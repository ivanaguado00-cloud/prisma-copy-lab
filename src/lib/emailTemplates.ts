// ── Brand Kit ────────────────────────────────────────────────────────────────
// Centraliza la identidad visual de Universidad Prisma para todos los emails
// generados. Cambia aquí colores, logo, tipografía o footer sin tocar templates.

export interface BrandKit {
  brandId: string
  brandName: string
  claim: string
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  onBrandColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  mutedTextColor: string
  fontFamily: string
  footerText: string
  websiteUrl: string
}

export const PRISMA_BRAND_KIT: BrandKit = {
  brandId: 'prisma_default',
  brandName: 'Universidad Prisma',
  claim: 'Impulsa tu futuro, desde donde estés',
  logoUrl: '', // Se puede sustituir por URL pública cuando esté disponible
  primaryColor: '#1b1c1c',   // on-surface
  secondaryColor: '#4c4546', // on-surface-variant
  onBrandColor: '#ffffff',   // text on dark brand
  backgroundColor: '#ffffff', // surface-container-lowest
  surfaceColor: '#f5f3f3',   // surface-container-low
  textColor: '#1b1c1c',      // on-surface
  mutedTextColor: '#4c4546', // on-surface-variant
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  footerText: 'Universidad Prisma · Formación online flexible',
  websiteUrl: 'https://universidadprisma.es',
}

// ── Template definitions ─────────────────────────────────────────────────────

export interface EmailTemplate {
  templateId: string
  name: string
  description: string
  recommendedUse: string
  layout: 'standard' | 'promotional' | 'reminder' | 'newsletter'
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    templateId: 'standard',
    name: 'Email informativo',
    description: 'Estructura clara orientada a explicar y presentar. Titular, cuerpo con bloques de texto y CTA.',
    recommendedUse: 'Presentación de programa, novedades o comunicados.',
    layout: 'standard',
  },
  {
    templateId: 'palancas',
    name: 'Email de palancas',
    description: 'Diseño orientado a conversión por beneficio no económico. Palanca principal destacada y CTA prominente.',
    recommendedUse: 'Captación y reactivación por empleabilidad, flexibilidad, alumni u otras palancas.',
    layout: 'promotional',
  },
  {
    templateId: 'descuentos',
    name: 'Email de descuentos',
    description: 'Diseño de alta conversión centrado en la oferta económica. Precio o condición destacados y urgencia.',
    recommendedUse: 'Campañas con beca, descuento en matrícula o plazo especial.',
    layout: 'promotional',
  },
  {
    templateId: 'reminder',
    name: 'Email recordatorio',
    description: 'Formato conciso y directo. Aviso con fecha o acción clara, sin elementos visuales complejos.',
    recommendedUse: 'Seguimiento, fechas límite, convocatorias o reactivación.',
    layout: 'reminder',
  },
  {
    templateId: 'newsletter',
    name: 'Newsletter de sector',
    description: 'Noticias y tendencias del sector relevantes para el perfil del lead. Bloque principal + contenido de soporte.',
    recommendedUse: 'Nutrición de lead con contenido de valor del sector.',
    layout: 'newsletter',
  },
]

// ── HTML email renderer ───────────────────────────────────────────────────────
// Genera el HTML final del email a partir del contenido y la identidad visual.
// El resultado es apto para clientes de correo: usa tablas e inline styles.

export interface EmailContent {
  subject: string
  preheader: string
  body: string
  cta: string
  programOrTitulation?: string
}

export function renderEmailHtml(
  content: EmailContent,
  template: EmailTemplate,
  brand: BrandKit = PRISMA_BRAND_KIT,
): string {
  const logoTextColor = template.layout === 'newsletter' ? '#ffffff' : brand.textColor
  const logoBlock = brand.logoUrl
    ? `<img src="${brand.logoUrl}" alt="${brand.brandName}" width="140" style="display:block;border:0;" />`
    : `<span style="font-size:16px;font-weight:700;color:${logoTextColor};letter-spacing:0.05em;text-transform:uppercase;">${brand.brandName}</span>`

  // CTA: fondo negro, texto blanco — alineado con el estilo evolve
  const ctaButton = content.cta
    ? `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto;">
        <tr>
          <td align="center" bgcolor="#1b1c1c" style="border-radius:6px;">
            <a href="#" style="display:inline-block;padding:12px 28px;font-family:${brand.fontFamily};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">${content.cta}</a>
          </td>
        </tr>
      </table>`
    : ''

  const headerBg = template.layout === 'newsletter'
    ? `background-color:#1b1c1c;`
    : `background-color:${brand.surfaceColor};`
  const headerBorder = template.layout === 'newsletter'
    ? `border-bottom:3px solid #4c4546;`
    : `border-bottom:3px solid #1b1c1c;`

  const bodyContent = layout(content, template, brand, ctaButton)

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${content.subject}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#efeded;font-family:${brand.fontFamily};">
  <!-- Preheader (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${content.preheader}&nbsp;&#8203;&zwnj;&nbsp;&#8203;&zwnj;</div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#efeded;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:${brand.backgroundColor};border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td style="padding:28px 40px 20px;${headerBg}${headerBorder}">
              ${logoBlock}
            </td>
          </tr>

          <!-- Body -->
          ${bodyContent}

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 24px;background-color:${brand.surfaceColor};border-top:1px solid #cfc4c5;">
              <p style="margin:0 0 4px;font-size:12px;color:${brand.mutedTextColor};text-align:center;">${brand.footerText}</p>
              <p style="margin:0;font-size:11px;color:${brand.mutedTextColor};text-align:center;">
                <a href="${brand.websiteUrl}" style="color:${brand.mutedTextColor};text-decoration:underline;">${brand.websiteUrl}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function layout(
  content: EmailContent,
  template: EmailTemplate,
  brand: BrandKit,
  ctaButton: string,
): string {
  const bodyText = content.body
    .split('\n')
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${brand.textColor};">${p}</p>`)
    .join('')

  switch (template.layout) {
    case 'promotional':
      return `
        <tr>
          <td style="padding:32px 40px 8px;">
            <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${brand.textColor};line-height:1.25;letter-spacing:-0.025em;">${content.subject}</h1>
            <p style="margin:0 0 20px;font-size:15px;color:${brand.mutedTextColor};font-style:italic;line-height:1.6;">${content.preheader}</p>
          </td>
        </tr>
        <tr><td style="padding:0 40px 8px;">${bodyText}</td></tr>
        <tr><td style="padding:8px 40px 24px;">${ctaButton}</td></tr>`

    case 'reminder':
      return `
        <tr>
          <td style="padding:28px 40px 12px;border-left:4px solid #1b1c1c;">
            <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${brand.textColor};letter-spacing:-0.015em;">${content.subject}</h2>
            <p style="margin:0;font-size:14px;color:${brand.mutedTextColor};line-height:1.6;">${content.preheader}</p>
          </td>
        </tr>
        <tr><td style="padding:16px 40px 8px;">${bodyText}</td></tr>
        <tr><td style="padding:0 40px 24px;">${ctaButton}</td></tr>`

    case 'newsletter':
      return `
        <tr>
          <td style="padding:40px;background-color:${brand.backgroundColor};text-align:center;">
            <h1 style="margin:0 0 12px;font-size:28px;font-weight:700;color:${brand.textColor};line-height:1.25;letter-spacing:-0.025em;">${content.subject}</h1>
            <p style="margin:0 0 24px;font-size:15px;color:${brand.mutedTextColor};line-height:1.6;">${content.preheader}</p>
            ${ctaButton}
          </td>
        </tr>
        <tr><td style="padding:28px 40px 24px;">${bodyText}</td></tr>`

    case 'standard':
    default:
      return `
        <tr>
          <td style="padding:28px 40px 12px;">
            <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${brand.textColor};letter-spacing:-0.015em;">${content.subject}</h2>
            <p style="margin:0;font-size:14px;color:${brand.mutedTextColor};line-height:1.6;">${content.preheader}</p>
          </td>
        </tr>
        <tr><td style="padding:8px 40px;">${bodyText}</td></tr>
        <tr><td style="padding:8px 40px 24px;">${ctaButton}</td></tr>`
  }
}

// ── Plain text renderer ───────────────────────────────────────────────────────

export function renderEmailPlainText(content: EmailContent, brand: BrandKit = PRISMA_BRAND_KIT): string {
  return [
    brand.brandName,
    '─'.repeat(40),
    '',
    content.subject,
    '',
    content.preheader,
    '',
    content.body,
    '',
    content.cta ? `→ ${content.cta}` : '',
    '',
    '─'.repeat(40),
    brand.footerText,
    brand.websiteUrl,
  ]
    .filter((line) => line !== undefined)
    .join('\n')
    .trim()
}
