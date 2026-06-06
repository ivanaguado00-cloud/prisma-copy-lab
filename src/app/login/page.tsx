'use client'

import { useActionState } from 'react'
import { loginAction } from '../actions/authActions'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0f] relative overflow-hidden">

      {/* Radial purple glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(124,58,237,0.18) 0%, rgba(10,10,15,0) 70%)',
        }}
      />

      <div className="w-full max-w-sm space-y-7 relative z-10">

        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-1 prisma-gradient-bg shadow-lg shadow-purple-900/40">
            <span className="text-white font-bold text-lg tracking-tight">P</span>
          </div>
          <h1 className="text-2xl font-bold prisma-gradient-text">PRISMA Copy Lab</h1>
          <p className="text-sm text-slate-400">Accede con tu cuenta institucional</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{
            background: '#0f0f1a',
            border: '1px solid #1e1e3a',
            boxShadow: '0 0 40px rgba(124,58,237,0.12), 0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <form action={formAction} className="space-y-4">

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-200 block">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="usuario@prisma.es"
                className="w-full rounded-xl border border-[#1e1e3a] bg-[#0a0a0f] px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 focus:border-[#7c3aed] placeholder:text-slate-600 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-200 block">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#1e1e3a] bg-[#0a0a0f] px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/40 focus:border-[#7c3aed] placeholder:text-slate-600 transition-all"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-[#f87171] bg-[#1c0000] border border-[#ef4444]/30 rounded-xl px-4 py-2.5">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white prisma-gradient-bg hover:opacity-90 active:opacity-80 transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Accediendo…' : 'Entrar'}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-slate-600">
          Universidad Prisma — uso interno
        </p>
      </div>
    </div>
  )
}
