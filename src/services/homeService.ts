import { getHomeBriefReviewSummary, listRecentBriefActivity } from '../dao/briefDao'
import { countMessageVersions, listRecentMessageVersions } from '../dao/messageVersionDao'
import { countProgramsWithActiveDiscount, getBestConvertingProgram } from '../dao/programDao'
import {
  computeChannelBreakdown,
  computeTotals,
  listSendMetrics,
  listSuccessCases,
} from '../dao/sendMetricsDao'
import { listRecentValidationActivity } from '../dao/validationRunDao'
import { canSeeAllBriefs, type SendMetricsTotals } from '../types/domain'

export type HomePeriod = '7d' | '30d'

export interface HomeMetricCard {
  label: string
  value: number
  helper: string
}

export interface HomeActivityItem {
  label: string
  detail: string
  href: string
  date: Date
  tone: 'neutral' | 'success' | 'warning' | 'danger'
}

export interface HomeChartPoint {
  label: string
  messages: number
  sends: number
  clicks: number
}

export interface HomeAlert {
  label: string
  tone: 'neutral' | 'success' | 'warning' | 'danger'
}

export interface HomeData {
  period: HomePeriod
  operationalCards: HomeMetricCard[]
  recentActivity: HomeActivityItem[]
  performanceTotals: SendMetricsTotals
  chartSeries: HomeChartPoint[]
  alerts: HomeAlert[]
  insight: string
  canOpenAnalytics: boolean
}

export async function getHomeData(params: {
  userId: string
  role?: string
  period: HomePeriod
}): Promise<HomeData> {
  const scopeUserId = canSeeAllBriefs(params.role) ? undefined : params.userId
  const dateFrom = daysAgo(new Date(), params.period === '7d' ? 7 : 30)

  const [
    briefSummary,
    totalMessages,
    recentBriefs,
    recentMessages,
    recentApproved,
    recentRejected,
    allRecentSends,
    periodSends,
    successCases,
    activeDiscounts,
    bestProgram,
  ] = await Promise.all([
    getHomeBriefReviewSummary(scopeUserId),
    countMessageVersions(scopeUserId),
    listRecentBriefActivity(scopeUserId, 4),
    listRecentMessageVersions(scopeUserId, 30),
    listRecentValidationActivity(scopeUserId, 'aprobada', 4),
    listRecentValidationActivity(scopeUserId, 'no_aprobada', 4),
    listSendMetrics({ userId: scopeUserId }),
    listSendMetrics({ userId: scopeUserId, dateFrom }),
    listSuccessCases(),
    countProgramsWithActiveDiscount(),
    getBestConvertingProgram(),
  ])

  const performanceTotals = computeTotals(periodSends)

  const chartSeries = buildHomeChartSeries({
    period: params.period,
    messages: recentMessages,
    sends: periodSends,
  })

  const alerts = buildAlerts({
    pendingPmReview: briefSummary.pendingPmReview,
    pendingAuthorCorrection: briefSummary.pendingAuthorCorrection,
    activeDiscounts,
    bestProgramName: bestProgram?.name ?? null,
  })

  return {
    period: params.period,
    operationalCards: [
      { label: 'Mensajes generados', value: totalMessages, helper: 'versiones guardadas' },
      { label: 'Briefings creados', value: briefSummary.totalBriefs, helper: 'en el histórico' },
      { label: 'Pendientes PM', value: briefSummary.pendingPmReview, helper: 'en revisión' },
      { label: 'Pendientes redactor', value: briefSummary.pendingAuthorCorrection, helper: 'necesitan corrección' },
      { label: 'Briefings aprobados', value: briefSummary.approvedBriefs, helper: 'listos para activar' },
      { label: 'Casos de éxito', value: successCases.length, helper: 'guardados en memoria' },
    ],
    recentActivity: buildRecentActivity({
      recentBriefs,
      recentApproved,
      recentRejected,
      recentSends: allRecentSends.slice(0, 4),
      successCases: successCases.slice(0, 4),
    }),
    performanceTotals,
    chartSeries,
    alerts,
    insight: buildInsight(periodSends),
    canOpenAnalytics: params.role === 'pm' || params.role === 'coordinador' || params.role === 'admin',
  }
}

function daysAgo(from: Date, days: number): Date {
  const date = new Date(from)
  date.setDate(date.getDate() - days)
  return date
}

function buildHomeChartSeries({
  period,
  messages,
  sends,
}: {
  period: HomePeriod
  messages: Awaited<ReturnType<typeof listRecentMessageVersions>>
  sends: Awaited<ReturnType<typeof listSendMetrics>>
}): HomeChartPoint[] {
  const days = period === '7d' ? 7 : 30
  const buckets = new Map<string, HomeChartPoint>()
  const now = new Date()

  for (let index = days - 1; index >= 0; index--) {
    const date = daysAgo(now, index)
    const key = formatDateKey(date)
    buckets.set(key, {
      label: period === '7d'
        ? new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(date)
        : new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(date),
      messages: 0,
      sends: 0,
      clicks: 0,
    })
  }

  for (const message of messages) {
    const key = formatDateKey(message.createdAt)
    const point = buckets.get(key)
    if (point) point.messages += 1
  }

  for (const send of sends) {
    const key = formatDateKey(send.sentAt ?? send.createdAt)
    const point = buckets.get(key)
    if (point) {
      point.sends += send.sentCount
      point.clicks += send.clicksCount
    }
  }

  return Array.from(buckets.values())
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function buildRecentActivity({
  recentBriefs,
  recentApproved,
  recentRejected,
  recentSends,
  successCases,
}: {
  recentBriefs: Awaited<ReturnType<typeof listRecentBriefActivity>>
  recentApproved: Awaited<ReturnType<typeof listRecentValidationActivity>>
  recentRejected: Awaited<ReturnType<typeof listRecentValidationActivity>>
  recentSends: Awaited<ReturnType<typeof listSendMetrics>>
  successCases: Awaited<ReturnType<typeof listSuccessCases>>
}): HomeActivityItem[] {
  const items: HomeActivityItem[] = [
    ...recentBriefs.map((brief) => ({
      label: 'Briefing creado',
      detail: brief.title,
      href: `/briefs/${brief.id}`,
      date: brief.createdAt,
      tone: 'neutral' as const,
    })),
    ...recentApproved.map((run) => ({
      label: 'Mensaje aprobado',
      detail: run.messageVersion.brief.title,
      href: `/briefs/${run.messageVersion.brief.id}`,
      date: run.createdAt,
      tone: 'success' as const,
    })),
    ...recentRejected.map((run) => ({
      label: 'Mensaje rechazado',
      detail: run.messageVersion.brief.title,
      href: `/briefs/${run.messageVersion.brief.id}`,
      date: run.createdAt,
      tone: 'danger' as const,
    })),
    ...recentSends.map((send) => ({
      label: 'Envío analizado',
      detail: send.brief.title,
      href: `/analisis?briefIds=${send.briefId}`,
      date: send.sentAt ?? send.createdAt,
      tone: 'warning' as const,
    })),
    ...successCases.map((send) => ({
      label: 'Caso de éxito guardado',
      detail: send.brief.title,
      href: '/analisis',
      date: send.updatedAt,
      tone: 'success' as const,
    })),
  ]

  return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8)
}

function buildAlerts(params: {
  pendingPmReview: number
  pendingAuthorCorrection: number
  activeDiscounts: number
  bestProgramName: string | null
}): HomeAlert[] {
  const alerts: HomeAlert[] = []

  if (params.pendingPmReview > 0) {
    alerts.push({
      label: `Tienes ${params.pendingPmReview} briefing${params.pendingPmReview !== 1 ? 's' : ''} pendiente${params.pendingPmReview !== 1 ? 's' : ''} de revisión`,
      tone: 'warning',
    })
  }

  if (params.pendingAuthorCorrection > 0) {
    alerts.push({
      label: `${params.pendingAuthorCorrection} mensaje${params.pendingAuthorCorrection !== 1 ? 's' : ''} rechazado${params.pendingAuthorCorrection !== 1 ? 's' : ''} necesita${params.pendingAuthorCorrection !== 1 ? 'n' : ''} corrección`,
      tone: 'danger',
    })
  }

  if (params.activeDiscounts > 0) {
    alerts.push({
      label: `Hay ${params.activeDiscounts} campaña${params.activeDiscounts !== 1 ? 's' : ''} con descuento activo esta semana`,
      tone: 'neutral',
    })
  }

  if (params.bestProgramName) {
    alerts.push({
      label: `${params.bestProgramName} es el título con mejor conversión registrada`,
      tone: 'success',
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      label: 'No hay avisos críticos ahora mismo',
      tone: 'success',
    })
  }

  return alerts
}

function buildInsight(sends: Awaited<ReturnType<typeof listSendMetrics>>): string {
  const channelBreakdown = computeChannelBreakdown(sends)
  const whatsapp = channelBreakdown.find((entry) => entry.channel === 'whatsapp')
  const email = channelBreakdown.find((entry) => entry.channel === 'email')

  if (whatsapp && email && whatsapp.sentCount > 0 && email.sentCount > 0) {
    const whatsappCtr = whatsapp.clicksCount / whatsapp.sentCount
    const emailCtr = email.clicksCount / email.sentCount
    const strongerCtr = whatsappCtr >= emailCtr ? 'WhatsApp' : 'email'
    const strongerEnrollments = whatsapp.enrollments >= email.enrollments ? 'WhatsApp' : 'email'

    return `En el periodo seleccionado, ${strongerCtr} genera mayor tasa de clic, mientras que ${strongerEnrollments} concentra más matrículas.`
  }

  const totals = computeTotals(sends)
  if (totals.clicksCount > 0) {
    return 'Los envíos con clics registrados ya tienen señales suficientes para guardar aprendizajes como casos de éxito.'
  }

  return 'Los mensajes con CTA orientada a asesoramiento suelen ser mejores candidatos para revisión comercial que los CTA genéricos.'
}
