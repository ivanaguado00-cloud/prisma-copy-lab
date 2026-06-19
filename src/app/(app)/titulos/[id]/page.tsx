import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '../../../../auth'
import { canViewPrograms, canManagePrograms, canEditDiscount } from '../../../../types/domain'
import { getProgramById } from '../../../../dao/programDao'
import { ProgramDetail } from '../../../../components/titulos/ProgramDetail'

export const metadata = { title: 'Título — PRISMA Copy Lab' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProgramDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (!canViewPrograms(session.user.role)) redirect('/briefs')

  const { id } = await params
  const program = await getProgramById(id)
  if (!program) notFound()

  const canEdit = canManagePrograms(session.user.role)
  const showDiscountEdit = !canEdit && canEditDiscount(session.user.role)

  return (
    <div className="px-6 md:px-10 py-8 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-4">
        <p className="text-xs text-[#7e7576]">
          <Link href="/titulos" className="hover:underline">Títulos</Link>
          {' › '}{program.name}
        </p>
        {showDiscountEdit && (
          <Link
            href={`/titulos/${id}/descuento`}
            className="shrink-0 rounded px-3 py-1.5 text-xs font-semibold bg-[#1b1c1c] text-white hover:bg-[#4c4546] transition-colors"
          >
            Editar descuento
          </Link>
        )}
      </div>
      <ProgramDetail program={program} canEdit={canEdit} />
    </div>
  )
}
