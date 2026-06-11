import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../../auth'
import { listBriefs } from '../../../dao/briefDao'

export const metadata = {
  title: 'Briefings — PRISMA Copy Lab',
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
}

const CHANNEL_BADGE: Record<string, string> = {
  whatsapp: 'bg-[#e9e8e7] text-[#1b1c1c] border-[#cfc4c5]',
  email:    'bg-[#e9e8e7] text-[#1b1c1c] border-[#cfc4c5]',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function formatBriefNumber(briefNumber: number): string {
  return `BR-${briefNumber.toString().padStart(3, '0')}`
}

export default async function BriefsListPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const briefs = await listBriefs(session.user.id)

  const totalBriefs = briefs.length
  const whatsappCount = briefs.filter((b) => b.channel === 'whatsapp').length
  const emailCount = briefs.filter((b) => b.channel === 'email').length

  const stats = [
    { label: 'Total briefs', value: totalBriefs },
    { label: 'WhatsApp', value: whatsappCount },
    { label: 'Email', value: emailCount },
    { label: 'Este mes', value: briefs.filter((b) => {
        const d = new Date(b.createdAt)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).length },
  ]

  return (
    <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-[#1b1c1c]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Briefings
          </h1>
          <p className="text-sm text-[#4c4546] mt-0.5">
            {briefs.length === 0
              ? 'Crea tu primer briefing para empezar'
              : `${briefs.length} briefing${briefs.length !== 1 ? 's' : ''} en total`}
          </p>
        </div>
        <Link
          href="/briefs/new"
          className="rounded px-4 py-2 text-sm font-semibold bg-[#1b1c1c] text-white hover:bg-[#4c4546] transition-colors"
        >
          + Nuevo briefing
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg px-4 py-3"
          >
            <p className="text-xs text-[#4c4546] mb-1">{label}</p>
            <p className="text-2xl font-bold text-[#1b1c1c]">{value}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {briefs.length === 0 ? (
        <div className="bg-[#ffffff] border border-dashed border-[#cfc4c5] rounded-lg px-6 py-16 text-center space-y-4">
          <p className="text-base font-medium text-[#1b1c1c]">Sin briefings todavía</p>
          <p className="text-sm text-[#4c4546]">
            Empieza creando un briefing para generar mensajes de captación.
          </p>
          <Link
            href="/briefs/new"
            className="inline-block rounded px-5 py-2 text-sm font-semibold bg-[#1b1c1c] text-white hover:bg-[#4c4546] transition-colors mt-2"
          >
            Crear briefing
          </Link>
        </div>
      ) : (
        <div className="bg-[#ffffff] border border-[#cfc4c5] rounded-lg overflow-hidden">

          {/* Table header */}
          <div className="hidden md:grid md:grid-cols-[80px_120px_1fr_120px_32px] gap-4 px-5 py-3 bg-[#f5f3f3] border-b border-[#cfc4c5]">
            <p className="text-xs font-semibold text-[#4c4546] uppercase tracking-wider">Nº</p>
            <p className="text-xs font-semibold text-[#4c4546] uppercase tracking-wider">Canal</p>
            <p className="text-xs font-semibold text-[#4c4546] uppercase tracking-wider">Título</p>
            <p className="text-xs font-semibold text-[#4c4546] uppercase tracking-wider">Fecha</p>
            <span />
          </div>

          <ul>
            {briefs.map((brief, idx) => (
              <li
                key={brief.id}
                className={idx < briefs.length - 1 ? 'border-b border-[#f5f3f3]' : ''}
              >
                <Link
                  href={`/briefs/${brief.id}`}
                  className="flex md:grid md:grid-cols-[80px_120px_1fr_120px_32px] gap-4 items-center px-5 py-3.5 group hover:bg-[#f5f3f3] transition-colors"
                >
                  <span className="text-xs font-mono font-semibold text-[#7e7576] shrink-0">
                    {formatBriefNumber(brief.briefNumber)}
                  </span>
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded border shrink-0 w-fit ${
                      CHANNEL_BADGE[brief.channel] ?? 'bg-[#e9e8e7] text-[#1b1c1c] border-[#cfc4c5]'
                    }`}
                  >
                    {CHANNEL_LABELS[brief.channel] ?? brief.channel}
                  </span>
                  <p className="font-medium text-[#1b1c1c] truncate group-hover:text-[#000000] transition-colors text-sm">
                    {brief.title}
                  </p>
                  <p className="text-sm text-[#7e7576] shrink-0 hidden md:block">{formatDate(brief.createdAt)}</p>
                  <span className="text-[#7e7576] opacity-0 group-hover:opacity-100 transition-opacity text-sm">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
