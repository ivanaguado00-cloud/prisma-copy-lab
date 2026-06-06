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
  whatsapp: 'bg-[#052e16] text-[#34d399] border-[#065f46]',
  email: 'bg-[#1e1b4b] text-[#a5b4fc] border-[#3730a3]',
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
          <p className="text-sm text-[#94a3b8] mt-1">
            {briefs.length === 0
              ? 'Crea tu primer briefing para empezar'
              : `${briefs.length} briefing${briefs.length !== 1 ? 's' : ''} en total`}
          </p>
        </div>
        <Link
          href="/briefs/new"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white prisma-gradient-bg hover:opacity-90 transition-all shadow-lg shadow-purple-900/30"
        >
          + Nuevo briefing
        </Link>
      </div>

      {/* Empty state */}
      {briefs.length === 0 ? (
        <div
          className="rounded-2xl px-6 py-16 text-center space-y-4"
          style={{
            background: '#0f0f1a',
            border: '1px dashed #1e1e3a',
          }}
        >
          <div className="text-4xl mb-2">📄</div>
          <p className="text-base font-medium text-[#e2e8f0]">Sin briefings todavía</p>
          <p className="text-sm text-[#94a3b8]">
            Empieza creando un briefing para generar mensajes de captación.
          </p>
          <Link
            href="/briefs/new"
            className="inline-block rounded-xl px-5 py-2 text-sm font-semibold text-white prisma-gradient-bg hover:opacity-90 transition-all shadow-lg shadow-purple-900/30 mt-2"
          >
            Crear briefing
          </Link>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0f0f1a', border: '1px solid #1e1e3a' }}
        >
          <ul>
            {briefs.map((brief, idx) => (
              <li
                key={brief.id}
                style={idx < briefs.length - 1 ? { borderBottom: '1px solid #1a1a2e' } : {}}
              >
                <Link
                  href={`/briefs/${brief.id}`}
                  className="flex items-center justify-between px-6 py-4 gap-4 group transition-colors hover:bg-[#1a1a2e]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border shrink-0 ${
                        CHANNEL_BADGE[brief.channel] ?? 'bg-[#1e1e3a] text-[#94a3b8] border-[#1e1e3a]'
                      }`}
                    >
                      {CHANNEL_LABELS[brief.channel] ?? brief.channel}
                    </span>
                    <p className="font-medium text-[#e2e8f0] truncate group-hover:text-white transition-colors">
                      {brief.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm text-[#94a3b8]">{formatDate(brief.createdAt)}</p>
                    <span className="text-[#7c3aed] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
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
