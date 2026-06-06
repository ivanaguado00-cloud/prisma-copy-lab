'use client'

import { useActionState } from 'react'
import { loginAction } from '../actions/authActions'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { buttonVariants } from '../../components/ui/button'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">PRISMA Copy Lab</h1>
          <p className="text-sm text-zinc-500 mt-1">Accede con tu cuenta institucional</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Iniciar sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-zinc-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="usuario@prisma.es"
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400"
                />
              </div>

              {state?.error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className={`${buttonVariants()} w-full`}
              >
                {isPending ? 'Accediendo…' : 'Entrar'}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
