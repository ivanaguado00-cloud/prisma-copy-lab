import { auth } from '../../auth'
import { signOutAction } from '../../app/actions/authActions'
import { buttonVariants } from '../ui/button'

export async function Navbar() {
  const session = await auth()

  if (!session?.user) return null

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-4xl px-4 h-12 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-800">PRISMA Copy Lab</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{session.user.name ?? session.user.email}</span>
          <form action={signOutAction}>
            <button
              type="submit"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
