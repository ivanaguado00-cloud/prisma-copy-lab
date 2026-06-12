import { Suspense } from 'react'
import { Sidebar } from '../../components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Suspense fallback={<aside className="hidden md:block w-64 shrink-0" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 md:ml-64">{children}</main>
    </div>
  )
}
