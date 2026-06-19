import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '../../../../../auth'
import { canEditDiscount } from '../../../../../types/domain'
import { getProgramById } from '../../../../../dao/programDao'
import { updateDiscountAction } from '../../../../../app/actions/programActions'
import { DiscountForm } from '../../../../../components/titulos/DiscountForm'

export const metadata = { title: 'Editar descuento — PRISMA Copy Lab' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditDescuentoPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (!canEditDiscount(session.user.role)) redirect('/titulos')

  const { id } = await params
  const program = await getProgramById(id)
  if (!program) notFound()

  const boundAction = updateDiscountAction.bind(null, id)

  return (
    <div className="px-6 md:px-10 py-8 max-w-lg mx-auto space-y-6">
      <div>
        <p className="text-xs text-[#7e7576] mb-1">
          <Link href="/titulos" className="hover:underline">Títulos</Link>
          {' › '}
          <Link href={`/titulos/${id}`} className="hover:underline">{program.name}</Link>
          {' › '}Editar descuento
        </p>
        <h1
          className="text-2xl font-bold text-[#1b1c1c]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Editar descuento
        </h1>
        <p className="text-sm text-[#4c4546] mt-1">
          Modifica el descuento activo y la fecha desde la que aplica.
        </p>
      </div>

      <DiscountForm
        action={boundAction}
        currentDiscount={program.activeDiscount}
        currentValidFrom={program.discountValidFrom}
      />
    </div>
  )
}
