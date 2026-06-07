import Link from 'next/link'
import { auth } from '../../auth'
import { signOutAction } from '../../app/actions/authActions'

// Inline SVG holographic prism — based on Universidad Prisma brand identity
function PrismaIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pe" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="pfl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0e7490" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="pfr" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="pfb" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
        </linearGradient>
        <filter id="pg" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Face fills — A(20,1) B(0,34) C(40,34) D(20,23) */}
      <polygon points="20,1 0,34 20,23" fill="url(#pfl)" />
      <polygon points="20,1 40,34 20,23" fill="url(#pfr)" />
      <polygon points="0,34 40,34 20,23" fill="url(#pfb)" />
      {/* Glowing edges */}
      <g filter="url(#pg)">
        <line x1="20" y1="1" x2="0" y2="34" stroke="url(#pe)" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="20" y1="1" x2="40" y2="34" stroke="url(#pe)" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="0" y1="34" x2="40" y2="34" stroke="url(#pe)" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="20" y1="1" x2="20" y2="23" stroke="url(#pe)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
        <line x1="0" y1="34" x2="20" y2="23" stroke="url(#pe)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
        <line x1="40" y1="34" x2="20" y2="23" stroke="url(#pe)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
      </g>
      <circle cx="20" cy="1.5" r="1.5" fill="#c4b5fd" opacity="0.9" />
    </svg>
  )
}

export async function Navbar() {
  const session = await auth()

  if (!session?.user) return null

  const initials = session.user.name
    ? session.user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : (session.user.email?.[0] ?? 'U').toUpperCase()

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{ background: 'rgba(10,10,15,0.80)', borderBottom: '1px solid #1e1e3a' }}
    >
      <div className="mx-auto max-w-screen-2xl px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <PrismaIcon size={28} />
          <div className="leading-none">
            <p className="text-sm font-bold prisma-gradient-text-cyan">PRISMA Copy Lab</p>
            <p className="text-[10px] text-slate-500 mt-px tracking-wide uppercase">
              Universidad Prisma
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            href="/briefs"
            className="text-sm text-slate-300 hover:text-violet-400 px-3 py-1.5 rounded-lg hover:bg-[#1e1e3a] transition-colors"
          >
            Briefings
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-slate-300 hover:text-violet-400 px-3 py-1.5 rounded-lg hover:bg-[#1e1e3a] transition-colors"
          >
            Dashboard
          </Link>
        </nav>

        {/* User */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white">{initials}</span>
            </div>
            <div className="leading-none text-right">
              {session.user.name && (
                <p className="text-sm font-medium text-white">{session.user.name}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-px">{session.user.email}</p>
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs font-medium text-violet-400 hover:text-white border border-violet-500 hover:bg-violet-500 rounded-lg px-3 py-1.5 transition-all"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

      </div>
    </header>
  )
}
