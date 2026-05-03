import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { BriefingForm } from '../../../components/briefing/BriefingForm'

export const metadata = {
  title: 'Nuevo briefing — PRISMA Copy Lab',
}

export default function NewBriefPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo briefing</CardTitle>
          <CardDescription>
            Rellena los datos del briefing para generar el mensaje de captación.
            Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BriefingForm />
        </CardContent>
      </Card>
    </div>
  )
}
