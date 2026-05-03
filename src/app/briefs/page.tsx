import Link from 'next/link'
import { listBriefs } from '../../dao/briefDao'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'

export const metadata = {
  title: 'Briefings — PRISMA Copy Lab',
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export default async function BriefsListPage() {
  const briefs = await listBriefs()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Briefings</h1>
        <Button asChild>
          <Link href="/briefs/new">Nuevo briefing</Link>
        </Button>
      </div>

      {briefs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-zinc-500">
            No hay briefings todavía.{' '}
            <Link href="/briefs/new" className="underline underline-offset-4 hover:text-zinc-900">
              Crea el primero
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-zinc-500">
              {briefs.length} briefing{briefs.length !== 1 ? 's' : ''} en total
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul>
              {briefs.map((brief, index) => (
                <li key={brief.id}>
                  {index > 0 && <Separator />}
                  <Link
                    href={`/briefs/${brief.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium leading-snug">{brief.title}</p>
                      <p className="text-sm text-zinc-500">
                        {CHANNEL_LABELS[brief.channel] ?? brief.channel}
                      </p>
                    </div>
                    <p className="text-sm text-zinc-400 shrink-0 ml-4">
                      {formatDate(brief.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
