'use server'

import { AuthError } from 'next-auth'
import { signIn, signOut } from '../../auth'

export interface LoginState {
  error?: string
}

export async function loginAction(
  _prevState: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/briefs',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email o contraseña incorrectos.' }
    }
    throw error
  }
  return {}
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/login' })
}
