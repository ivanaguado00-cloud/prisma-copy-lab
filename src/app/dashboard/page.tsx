import Link from 'next/link'
import { getValidationStats } from '../../dao/validationRunDao'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import { buttonVariants } from '../../components/ui/button'

export const metadata = {
  title: 'Dashboard — PRISMA Copy Lab',
}

const VERDICT_LABELS: Record<string, string> = {
  aprobada: 'Aprobada',
  aprobada_con_ajustes: 'Aprobada con ajustes',
  no_aprobada: 'No aprobada',
}

const VERDICT_BAR_COLOR: Record<string, string> = {
  aprobada: 'bg-emerald-500',
  aprobada_con_ajustes: 'bg-amber-400',
  no_aprobada: 'bg-red-500',
}

export default async function DashboardPage() {
  const stats = await getValidationStats()

  const metricCards = [
    { label: 'Briefings creados', value: stats.totalBriefs },
    { label: 'Mensajes generados', value: stats.totalVersions },
    { label: 'Validaciones realizadas', value: stats.totalValidations },
    { label: 'Media versiones / briefing', value: stats.avgVersionsPerBrief.toFixed(1) },
  ]

  const verdictEntries = Object.entries(stats.verdicts) as Array<
    [keyof typeof stats.verdicts, number]
  >

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Link href="/briefs" className={buttonVariants({ variant: 'outline' })}>
          ← Volver
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribución de veredictos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.totalValidations === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">
              No hay validaciones todavía.
            </p>
          ) : (
            verdictEntries.map(([verdict, count], index) => {
              const pct = Math.round((count / stats.totalValidations) * 100)
              return (
                <div key={verdict}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{VERDICT_LABELS[verdict]}</span>
                      <span className="text-zinc-500">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-100">
                      <div
                        className={`h-2 rounded-full ${VERDICT_BAR_COLOR[verdict]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
