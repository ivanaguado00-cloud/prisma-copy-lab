'use client'

import { useSidebar } from './SidebarContext'

export function MainShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <main className={`flex-1 transition-[margin] duration-200 ${collapsed ? 'md:ml-14' : 'md:ml-64'}`}>
      {children}
    </main>
  )
}
