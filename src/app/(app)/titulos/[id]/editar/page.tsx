import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '../../../../../auth'
import { canManagePrograms } from '../../../../../types/domain'
import { getProgramById } from '../../../../../dao/programDao'
import { ProgramForm } from '../../../../../components/titulos/ProgramForm'
import { updateProgramAction } from '../../../../../app/actions/programActions'

export const metadata = { title: 'Editar título — PRISMA Copy Lab' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProgramPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (!canManagePrograms(session.user.role)) redirect('/titulos')

  const { id } = await params
  const program = await getProgramById(id)
  if (!program) notFound()

  // Bind the program ID into the update action
  const boundUpdateAction = updateProgramAction.bind(null, id)

  return (
    <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs text-[#7e7576] mb-1">
          <Link href="/titulos" className="hover:underline">Títulos</Link>
          {' › '}
          <Link href={`/titulos/${id}`} className="hover:underline">{program.name}</Link>
          {' › '}Editar
        </p>
        <h1
          className="text-2xl font-bold text-[#1b1c1c]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Editar título
        </h1>
      </div>

      <ProgramForm
        action={boundUpdateAction}
        program={program}
        submitLabel="Guardar cambios"
      />
    </div>
  )
}
