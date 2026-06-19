import { prisma } from '../lib/prisma'
import type {
  SendMetricsTotals,
  WeeklyDataPoint,
  ChannelBreakdown,
  ProgramBreakdown,
} from '../types/domain'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SendMetricsWithBrief {
  id: string
  briefId: string
  utmCampaign: string | null
  utmSource: string | null
  utmMedium: string | null
  utmContent: string | null
  sentCount: number
  deliveredCount: number
  bouncedCount: number
  opensCount: number
  clicksCount: number
  leadsReactivated: number
  enrollments: number
  programPrice: number | null
  programDiscount: number | null
  isSuccessCase: boolean
  successNote: string | null
  sentAt: Date | null
  createdAt: Date
  updatedAt: Date
  brief: {
    id: string
    title: string
    channel: string
    programOrTitulation: string | null
    audience: string
    cta: string
    crmSentAt: Date | null
    latestMessageContent: string | null
    latestEmailSubject: string | null
    versionNumber: number | null
  }
}

export interface AnalyticsFilters {
  userId?: string
  channel?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface CreateSendMetricsInput {
  briefId: string
  utmCampaign?: string
  utmSource?: string
  utmMedium?: string
  utmContent?: string
  sentCount: number
  deliveredCount: number
  bouncedCount: number
  opensCount: number
  clicksCount: number
  leadsReactivated: number
  enrollments: number
  programPrice?: number
  programDiscount?: number
  sentAt?: Date
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Returns all SendMetrics joined with their Brief and latest MessageVersion.
 * Optionally filtered by channel and date range (based on sentAt).
 */
export async function listSendMetrics(
  filters: AnalyticsFilters = {},
): Promise<SendMetricsWithBrief[]> {
  const rows = await prisma.sendMetrics.findMany({
    where: {
      ...(filters.channel || filters.userId
        ? {
            brief: {
              ...(filters.channel ? { channel: filters.channel } : {}),
              ...(filters.userId ? { userId: filters.userId } : {}),
            },
          }
        : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            sentAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
    },
    include: {
      brief: {
        select: {
          id: true,
          title: true,
          channel: true,
          programOrTitulation: true,
          audience: true,
          cta: true,
          crmSentAt: true,
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
            select: {
              content: true,
              emailSubject: true,
              versionNumber: true,
            },
          },
        },
      },
    },
    orderBy: { sentAt: 'desc' },
  })

  return rows.map((row: typeof rows[0]) => {
    const latestVersion = row.brief.versions[0] ?? null
    return {
      ...row,
      brief: {
        id: row.brief.id,
        title: row.brief.title,
        channel: row.brief.channel,
        programOrTitulation: row.brief.programOrTitulation,
        audience: row.brief.audience,
        cta: row.brief.cta,
        crmSentAt: row.brief.crmSentAt,
        latestMessageContent: latestVersion?.content ?? null,
        latestEmailSubject: latestVersion?.emailSubject ?? null,
        versionNumber: latestVersion?.versionNumber ?? null,
      },
    }
  })
}

/** Returns a single SendMetrics entry by brief ID. */
export async function getSendMetricsByBriefId(briefId: string) {
  return prisma.sendMetrics.findUnique({ where: { briefId } })
}

/** Returns all success cases for the Learning Memory panel. */
export async function listSuccessCases() {
  return prisma.sendMetrics.findMany({
    where: { isSuccessCase: true },
    include: {
      brief: {
        select: {
          title: true,
          channel: true,
          programOrTitulation: true,
          cta: true,
          audience: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

/** Toggles the isSuccessCase flag on a SendMetrics record. */
export async function toggleSuccessCase(id: string, newValue: boolean) {
  return prisma.sendMetrics.update({
    where: { id },
    data: { isSuccessCase: newValue, updatedAt: new Date() },
    select: { id: true, isSuccessCase: true },
  })
}

/** Creates a SendMetrics record (called when marking a brief as sent to audience). */
export async function createSendMetrics(input: CreateSendMetricsInput) {
  return prisma.sendMetrics.create({ data: input })
}

// ── Aggregation helpers ───────────────────────────────────────────────────────

/**
 * Computes aggregated totals from a set of SendMetrics rows.
 * Revenue is computed using programPrice × (1 - programDiscount) × enrollments.
 */
export function computeTotals(rows: SendMetricsWithBrief[]): SendMetricsTotals {
  let sentCount = 0
  let deliveredCount = 0
  let bouncedCount = 0
  let opensCount = 0
  let clicksCount = 0
  let leadsReactivated = 0
  let enrollments = 0
  let revenueReal = 0
  let revenueOfficial = 0

  for (const row of rows) {
    sentCount += row.sentCount
    deliveredCount += row.deliveredCount
    bouncedCount += row.bouncedCount
    opensCount += row.opensCount
    clicksCount += row.clicksCount
    leadsReactivated += row.leadsReactivated
    enrollments += row.enrollments

    if (row.programPrice != null && row.enrollments > 0) {
      const discount = row.programDiscount ?? 0
      revenueReal += row.enrollments * row.programPrice * (1 - discount)
      revenueOfficial += row.enrollments * row.programPrice
    }
  }

  return {
    sentCount,
    deliveredCount,
    bouncedCount,
    opensCount,
    clicksCount,
    leadsReactivated,
    enrollments,
    revenueReal,
    revenueOfficial,
  }
}

/**
 * Groups SendMetrics rows by ISO week (YYYY-Www) and returns an ordered array
 * of data points for line/area charts. At most the last 12 weeks.
 */
export function computeWeeklySeries(rows: SendMetricsWithBrief[]): WeeklyDataPoint[] {
  const buckets = new Map<string, WeeklyDataPoint>()

  for (const row of rows) {
    const date = row.sentAt ?? row.createdAt
    const weekLabel = getISOWeekLabel(date)

    const existing = buckets.get(weekLabel) ?? {
      label: weekLabel,
      opens: 0,
      clicks: 0,
      enrollments: 0,
      revenue: 0,
    }

    const discount = row.programDiscount ?? 0
    const price = row.programPrice ?? 0

    existing.opens += row.opensCount
    existing.clicks += row.clicksCount
    existing.enrollments += row.enrollments
    existing.revenue += row.enrollments * price * (1 - discount)

    buckets.set(weekLabel, existing)
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(-12)
}

/**
 * Groups rows by channel for the comparison bar chart.
 */
export function computeChannelBreakdown(rows: SendMetricsWithBrief[]): ChannelBreakdown[] {
  const map = new Map<string, ChannelBreakdown>()

  for (const row of rows) {
    const ch = row.brief.channel
    const existing = map.get(ch) ?? { channel: ch, sentCount: 0, opensCount: 0, clicksCount: 0, enrollments: 0 }
    existing.sentCount += row.sentCount
    existing.opensCount += row.opensCount
    existing.clicksCount += row.clicksCount
    existing.enrollments += row.enrollments
    map.set(ch, existing)
  }

  return Array.from(map.values())
}

/**
 * Groups rows by program for the program-level conversion chart.
 */
export function computeProgramBreakdown(rows: SendMetricsWithBrief[]): ProgramBreakdown[] {
  const map = new Map<string, ProgramBreakdown>()

  for (const row of rows) {
    const program = row.brief.programOrTitulation ?? row.brief.title
    const existing = map.get(program) ?? { program, enrollments: 0, revenueReal: 0, revenueOfficial: 0 }
    const discount = row.programDiscount ?? 0
    const price = row.programPrice ?? 0
    existing.enrollments += row.enrollments
    existing.revenueReal += row.enrollments * price * (1 - discount)
    existing.revenueOfficial += row.enrollments * price
    map.set(program, existing)
  }

  return Array.from(map.values()).sort((a, b) => b.revenueReal - a.revenueReal)
}

// ── Private helpers ───────────────────────────────────────────────────────────

function getISOWeekLabel(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getFullYear()}-S${week.toString().padStart(2, '0')}`
}
