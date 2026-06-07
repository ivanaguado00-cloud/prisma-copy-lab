import Link from 'next/link'

export const metadata = {
  title: 'PRISMA Copy Lab',
  description: 'Generador de mensajes de captación para Universidad Prisma',
}

const quickCards = [
  {
    icon: '✍️',
    title: 'Nuevo briefing',
    description: 'Rellena el briefing para generar un mensaje de captación personalizado.',
    href: '/briefs/new',
    cta: 'Empezar',
    primary: true,
  },
  {
    icon: '📄',
    title: 'Histórico',
    description: 'Consulta todos los briefings y mensajes generados anteriormente.',
    href: '/briefs',
    cta: 'Ver briefings',
    primary: false,
  },
  {
    icon: '📊',
    title: 'Dashboard',
    description: 'Métricas de uso: briefings, mensajes, validaciones y veredictos.',
    href: '/dashboard',
    cta: 'Ver métricas',
    primary: false,
  },
]

export default function HomePage() {
  return (
    <div
      className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 bg-[#0d0e10] relative overflow-hidden"
    >
      {/* Radial lime glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 35%, rgba(195,244,0,0.08) 0%, rgba(13,14,16,0) 65%)',
        }}
      />

      <div className="w-full max-w-2xl space-y-12 relative z-10">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#c3f400] bg-[#1f2022] border border-[#c3f400]/25 rounded-full px-4 py-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c3f400] animate-pulse" />
            Universidad Prisma
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold prisma-gradient-text leading-tight">
            PRISMA Copy Lab
          </h1>
          <p className="text-lg text-[#c4c9ac] max-w-md mx-auto leading-relaxed">
            Genera, refina y valida mensajes de captación con inteligencia artificial.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/briefs/new"
              className="rounded px-6 py-2.5 text-sm font-semibold text-[#283500] prisma-gradient-bg hover:opacity-90 transition-all shadow-lg shadow-[#abd600]/20"
            >
              Crear briefing
            </Link>
            <Link
              href="/briefs"
              className="rounded px-6 py-2.5 text-sm font-medium text-[#c3f400] border border-[#c3f400]/40 hover:bg-[#1f2022] hover:border-[#c3f400] transition-all"
            >
              Ver histórico
            </Link>
          </div>
        </div>

        {/* Quick-access cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {quickCards.map(({ icon, title, description, href, cta, primary }) => (
            <div
              key={href}
              className="rounded-lg p-5 space-y-4 prisma-card"
            >
              <div>
                <div className="text-2xl mb-3">{icon}</div>
                <h2 className="text-base font-semibold text-[#e3e2e5] mb-1">{title}</h2>
                <p className="text-sm text-[#c4c9ac] leading-relaxed">{description}</p>
              </div>
              <Link
                href={href}
                className={
                  primary
                    ? 'block w-full text-center rounded px-4 py-2 text-sm font-semibold text-[#283500] prisma-gradient-bg hover:opacity-90 transition-all shadow-md shadow-[#abd600]/15'
                    : 'block w-full text-center rounded px-4 py-2 text-sm font-medium text-[#c3f400] border border-[#c3f400]/40 hover:bg-[#1f2022] hover:border-[#c3f400] transition-all'
                }
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
