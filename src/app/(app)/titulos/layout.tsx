import { redirect } from 'next/navigation'
import { auth } from '../../../auth'
import { canViewPrograms, canManagePrograms } from '../../../types/domain'
import { TitulosSubNav } from '../../../components/titulos/TitulosSubNav'

export default async function TitulosLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (!canViewPrograms(session.user.role)) redirect('/briefs')

  const canManage = canManagePrograms(session.user.role)

  return (
    <div>
      <TitulosSubNav canManage={canManage} />
      {children}
    </div>
  )
}
