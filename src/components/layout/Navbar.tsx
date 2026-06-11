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
    <header className="sticky top-0 z-50 bg-[#fbf9f8] border-b border-[#cfc4c5]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-16 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-bold text-[#1b1c1c]" style={{ fontFamily: 'var(--font-heading)' }}>
              PRISMA Copy Lab
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="text-sm text-[#4c4546] hover:text-[#1b1c1c] px-3 py-1.5 transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/briefs"
              className="text-sm text-[#4c4546] hover:text-[#1b1c1c] px-3 py-1.5 transition-colors"
            >
              Briefs
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-[#4c4546] hover:text-[#1b1c1c] px-3 py-1.5 transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#e4e2e2] border border-[#cfc4c5] flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-[#1b1c1c]">{initials}</span>
            </div>
            {session.user.name && (
              <span className="text-sm font-medium text-[#1b1c1c]">{session.user.name}</span>
            )}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs font-medium text-[#4c4546] hover:text-[#1b1c1c] border border-[#cfc4c5] hover:border-[#1b1c1c] rounded px-3 py-1.5 transition-all"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

      </div>
    </header>
  )
}
