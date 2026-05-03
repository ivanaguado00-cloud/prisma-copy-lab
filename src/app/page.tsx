import Link from 'next/link'
import { buttonVariants } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { cn } from '../lib/utils'

export const metadata = {
  title: 'PRISMA Copy Lab',
  description: 'Generador de mensajes de captación para Universidad Prisma',
}

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 min-h-screen px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">PRISMA Copy Lab</h1>
          <p className="text-zinc-500">
            Generador de mensajes de captación para Universidad Prisma
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Nuevo briefing</CardTitle>
              <CardDescription>
                Rellena el briefing para generar un mensaje de captación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/briefs/new" className={cn(buttonVariants(), 'w-full')}>
                Empezar
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Histórico</CardTitle>
              <CardDescription>
                Consulta todos los briefings creados anteriormente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/briefs" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
                Ver briefings
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
