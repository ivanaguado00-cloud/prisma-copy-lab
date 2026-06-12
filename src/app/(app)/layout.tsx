import { Suspense } from 'react'
import { Sidebar } from '../../components/layout/Sidebar'
import { SidebarProvider } from '../../components/layout/SidebarContext'
import { MainShell } from '../../components/layout/MainShell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-[calc(100vh-64px)]">
        <Suspense fallback={<aside className="hidden md:block w-64 shrink-0" />}>
          <Sidebar />
        </Suspense>
        <MainShell>{children}</MainShell>
      </div>
    </SidebarProvider>
  )
}
