export interface BriefStatusMeta {
  label: string
  cls: string
  responsable: string
}

const APPROVED_CSS = 'bg-success-container text-on-success-container border-success-container'

const STATUS_META: Record<string, BriefStatusMeta> = {
  pending: {
    label: 'Borrador',
    cls: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
    responsable: 'Redactor',
  },
  submitted: {
    label: 'En revisión',
    cls: 'bg-[#e9e8e7] text-[#1b1c1c] border-[#cfc4c5]',
    responsable: 'Product Manager',
  },
  rejected: {
    label: 'Rechazado',
    cls: 'bg-error-container/30 text-on-error-container border-error-container/50',
    responsable: 'Redactor',
  },
}

const FALLBACK_META: BriefStatusMeta = STATUS_META['pending']!

/**
 * Devuelve la etiqueta, los estilos y el responsable para una fila de brief
 * en la lista de briefings.
 *
 * Los briefs aprobados muestran «Equipo CRM» solo cuando el envío al CRM
 * se ha confirmado (`crmStatus === 'sent_to_crm'`). Mientras tanto muestran
 * «En espera de CRM» para reflejar el estado real del proceso.
 */
export function getBriefListStatusMeta(
  reviewStatus: string,
  crmStatus: string | null | undefined,
): BriefStatusMeta {
  if (reviewStatus === 'approved') {
    return {
      label: 'Aprobado',
      cls: APPROVED_CSS,
      responsable: crmStatus === 'sent_to_crm' ? 'Equipo CRM' : 'En espera de CRM',
    }
  }
  return STATUS_META[reviewStatus] ?? FALLBACK_META
}
