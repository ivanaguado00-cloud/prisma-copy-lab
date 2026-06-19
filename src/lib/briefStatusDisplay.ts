export interface BriefStatusMeta {
  label: string
  cls: string
  responsable: string
}

const APPROVED_CSS = 'bg-success-container text-on-success-container border-success-container'
const SENT_CSS = 'bg-[#ddf4ff] text-[#0550ae] border-[#54aeff]'

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
 * - `approved + sent_to_crm` → «Enviado» (el contenido ya está en CRM/enviado).
 * - `approved` sin envío     → «Aprobado» (pendiente de envío a CRM).
 */
export function getBriefListStatusMeta(
  reviewStatus: string,
  crmStatus: string | null | undefined,
): BriefStatusMeta {
  if (reviewStatus === 'approved') {
    if (crmStatus === 'sent_to_crm') {
      return {
        label: 'Enviado',
        cls: SENT_CSS,
        responsable: 'Equipo CRM',
      }
    }
    return {
      label: 'Aprobado',
      cls: APPROVED_CSS,
      responsable: 'En espera de CRM',
    }
  }
  return STATUS_META[reviewStatus] ?? FALLBACK_META
}
