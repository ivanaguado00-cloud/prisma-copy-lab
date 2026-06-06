import Link from 'next/link'
import { auth } from '../../auth'
import { signOutAction } from '../../app/actions/authActions'

export async function Navbar() {
  const session = await auth()

  if (!session?.user) return null

  const initials = session.user.name
    ? session.user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : (session.user.email?.[0] ?? 'U').toUpperCase()

  return (
    <header
      className="sticky top-0 z-10 backdrop-blur-md"
      style={{
        background: 'rgba(10,10,15,0.85)',
        borderBottom: '1px solid #1e1e3a',
      }}
    >
      <div className="mx-auto max-w-screen-2xl px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 prisma-gradient-bg shadow-md shadow-purple-900/40"
          >
            <span className="text-white text-xs font-bold tracking-tight">P</span>
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold prisma-gradient-text">PRISMA Copy Lab</p>
            <p className="text-[11px] text-[#94a3b8] mt-px">Universidad Prisma</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            href="/briefs"
            className="text-sm text-[#94a3b8] hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#1e1e3a] transition-colors"
          >
            Briefings
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-[#94a3b8] hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#1e1e3a] transition-colors"
          >
            Dashboard
          </Link>
        </nav>

        {/* User */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)' }}
            >
              <span className="text-[11px] font-semibold text-[#a855f7]">{initials}</span>
            </div>
            <div className="leading-none text-right">
              {session.user.name && (
                <p className="text-sm font-medium text-[#e2e8f0]">{session.user.name}</p>
              )}
              <p className="text-[11px] text-[#94a3b8] mt-px">{session.user.email}</p>
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs font-medium text-[#94a3b8] hover:text-white border border-[#1e1e3a] hover:border-[#7c3aed]/50 rounded-lg px-3 py-1.5 hover:bg-[#1e1e3a] transition-all"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

      </div>
    </header>
  )
}
