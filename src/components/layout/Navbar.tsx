import Link from 'next/link'
import { auth } from '../../auth'
import { signOutAction } from '../../app/actions/authActions'
import { NavLinks } from './NavLinks'

export async function Navbar() {
  const session = await auth()

  if (!session?.user) return null

  const initials = session.user.name
    ? session.user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : (session.user.email?.[0] ?? 'U').toUpperCase()

  return (
    <header className="sticky top-0 z-50 bg-surface-bright border-b border-outline-variant">
      <div className="mx-auto max-w-[1280px] px-6 md:px-16 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-bold text-on-surface" style={{ fontFamily: 'var(--font-heading)' }}>
              PRISMA Copy Lab
            </span>
          </Link>

          <NavLinks />
        </div>

        {/* User */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-on-surface">{initials}</span>
            </div>
            {session.user.name && (
              <span className="text-sm font-medium text-on-surface">{session.user.name}</span>
            )}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs font-medium text-on-surface-variant hover:text-on-surface border border-outline-variant hover:border-on-surface rounded px-3 py-1.5 transition-all"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

      </div>
    </header>
  )
}
