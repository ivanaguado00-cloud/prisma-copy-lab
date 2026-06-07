import Link from 'next/link'
import { auth } from '../../auth'
import { signOutAction } from '../../app/actions/authActions'

// Inline SVG holographic prism — Prisma Lime edition
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
          <stop offset="0%" stopColor="#abd600" />
          <stop offset="50%" stopColor="#c3f400" />
          <stop offset="100%" stopColor="#e3e2e5" />
        </linearGradient>
        <linearGradient id="pfl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#abd600" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#444933" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="pfr" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c3f400" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#444933" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="pfb" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#abd600" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1b1c1e" stopOpacity="0.1" />
        </linearGradient>
        <filter id="pg" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Face fills */}
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
      <circle cx="20" cy="1.5" r="1.5" fill="#c3f400" opacity="0.9" />
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
      style={{ background: 'rgba(13,14,16,0.85)', borderBottom: '1px solid #444933' }}
    >
      <div className="mx-auto max-w-screen-2xl px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <PrismaIcon size={28} />
          <div className="leading-none">
            <p className="text-sm font-bold prisma-gradient-text">PRISMA Copy Lab</p>
            <p className="text-[10px] text-[#c4c9ac] mt-px tracking-wide uppercase">
              Universidad Prisma
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            href="/briefs"
            className="text-sm text-[#c4c9ac] hover:text-[#c3f400] px-3 py-1.5 rounded hover:bg-[#1f2022] transition-colors"
          >
            Briefings
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-[#c4c9ac] hover:text-[#c3f400] px-3 py-1.5 rounded hover:bg-[#1f2022] transition-colors"
          >
            Dashboard
          </Link>
        </nav>

        {/* User */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#c3f400] flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-[#283500]">{initials}</span>
            </div>
            <div className="leading-none text-right">
              {session.user.name && (
                <p className="text-sm font-medium text-[#e3e2e5]">{session.user.name}</p>
              )}
              <p className="text-[11px] text-[#c4c9ac] mt-px">{session.user.email}</p>
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs font-medium text-[#c3f400] hover:text-[#283500] border border-[#c3f400]/50 hover:bg-[#c3f400] rounded px-3 py-1.5 transition-all"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

      </div>
    </header>
  )
}
