import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '../../auth'
import { listBriefs } from '../../dao/briefDao'

export const metadata = {
  title: 'Briefings — PRISMA Copy Lab',
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
}

const CHANNEL_BADGE: Record<string, string> = {
  whatsapp: 'bg-[#0d2318] text-[#4ade80] border-[#1a4731]',
  email:    'bg-[#1f2022] text-[#93c5fd] border-[#444933]',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export default async function BriefsListPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const briefs = await listBriefs(session.user.id)

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold prisma-gradient-text">Briefings</h1>
          <p className="text-sm text-[#c4c9ac] mt-1">
            {briefs.length === 0
              ? 'Crea tu primer briefing para empezar'
              : `${briefs.length} briefing${briefs.length !== 1 ? 's' : ''} en total`}
          </p>
        </div>
        <Link
          href="/briefs/new"
          className="rounded px-4 py-2 text-sm font-semibold text-[#283500] prisma-gradient-bg hover:opacity-90 transition-all shadow-lg shadow-[#abd600]/20"
        >
          + Nuevo briefing
        </Link>
      </div>

      {/* Empty state */}
      {briefs.length === 0 ? (
        <div
          className="rounded-lg px-6 py-16 text-center space-y-4 bg-[#1b1c1e]"
          style={{ border: '1px dashed #444933' }}
        >
          <div className="text-4xl mb-2">📄</div>
          <p className="text-base font-medium text-[#e3e2e5]">Sin briefings todavía</p>
          <p className="text-sm text-[#c4c9ac]">
            Empieza creando un briefing para generar mensajes de captación.
          </p>
          <Link
            href="/briefs/new"
            className="inline-block rounded px-5 py-2 text-sm font-semibold text-[#283500] prisma-gradient-bg hover:opacity-90 transition-all shadow-lg shadow-[#abd600]/20 mt-2"
          >
            Crear briefing
          </Link>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden bg-[#1b1c1e]" style={{ border: '1px solid #444933' }}>
          <ul>
            {briefs.map((brief, idx) => (
              <li
                key={brief.id}
                style={idx < briefs.length - 1 ? { borderBottom: '1px solid #1f2022' } : {}}
              >
                <Link
                  href={`/briefs/${brief.id}`}
                  className="flex items-center justify-between px-6 py-4 gap-4 group hover:bg-[#1f2022] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border shrink-0 ${
                        CHANNEL_BADGE[brief.channel] ?? 'bg-[#1f2022] text-[#c4c9ac] border-[#444933]'
                      }`}
                    >
                      {CHANNEL_LABELS[brief.channel] ?? brief.channel}
                    </span>
                    <p className="font-medium text-[#e3e2e5] truncate group-hover:text-white transition-colors">
                      {brief.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm text-[#c4c9ac]/60">{formatDate(brief.createdAt)}</p>
                    <span className="text-[#c3f400] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
