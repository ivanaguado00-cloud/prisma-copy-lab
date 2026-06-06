import Link from 'next/link'
import { buttonVariants } from '../components/ui/button'
import { cn } from '../lib/utils'

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
      className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 relative overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 35%, rgba(124,58,237,0.15) 0%, rgba(10,10,15,0) 65%)',
        }}
      />

      <div className="w-full max-w-2xl space-y-12 relative z-10">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#a855f7] bg-[#1e1e3a] border border-[#7c3aed]/30 rounded-full px-4 py-1.5 mb-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse"
            />
            Universidad Prisma
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold prisma-gradient-text leading-tight">
            PRISMA Copy Lab
          </h1>
          <p className="text-lg text-[#94a3b8] max-w-md mx-auto leading-relaxed">
            Genera, refina y valida mensajes de captación con inteligencia artificial.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/briefs/new"
              className={cn(
                buttonVariants(),
                'px-6 py-2.5 text-sm font-semibold shadow-lg shadow-purple-900/30',
              )}
            >
              Crear briefing
            </Link>
            <Link
              href="/briefs"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'px-6 py-2.5 text-sm',
              )}
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
              className="rounded-2xl p-5 space-y-4 group transition-all"
              style={{
                background: '#0f0f1a',
                border: '1px solid #1e1e3a',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#3b1f6e'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(124,58,237,0.14)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#1e1e3a'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              <div>
                <div className="text-2xl mb-3">{icon}</div>
                <h2 className="text-base font-semibold text-[#e2e8f0] mb-1">{title}</h2>
                <p className="text-sm text-[#94a3b8] leading-relaxed">{description}</p>
              </div>
              <Link
                href={href}
                className={cn(
                  primary
                    ? 'block w-full text-center rounded-xl px-4 py-2 text-sm font-semibold text-white prisma-gradient-bg hover:opacity-90 transition-all shadow-md shadow-purple-900/20'
                    : 'block w-full text-center rounded-xl px-4 py-2 text-sm font-medium text-[#a855f7] border border-[#7c3aed]/40 hover:bg-[#1e1e3a] hover:border-[#7c3aed] transition-all',
                )}
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
