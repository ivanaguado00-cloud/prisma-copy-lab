import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '../../../../auth'
import { canManagePrograms } from '../../../../types/domain'
import { ProgramForm } from '../../../../components/titulos/ProgramForm'
import { createProgramAction } from '../../../../app/actions/programActions'

export const metadata = { title: 'Nuevo título — PRISMA Copy Lab' }

export default async function NewProgramPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (!canManagePrograms(session.user.role)) redirect('/titulos')

  return (
    <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs text-[#7e7576] mb-1">
          <Link href="/titulos" className="hover:underline">Títulos</Link>
          {' › '}Nuevo
        </p>
        <h1
          className="text-2xl font-bold text-[#1b1c1c]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Nuevo título
        </h1>
        <p className="text-sm text-[#4c4546] mt-0.5">
          Crea la ficha de un programa o titulación de Universidad Prisma.
        </p>
      </div>

      <ProgramForm action={createProgramAction} submitLabel="Crear título" />
    </div>
  )
}
