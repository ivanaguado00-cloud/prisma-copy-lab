/**
 * Script de prueba de envío de email CRM.
 * Usa una cuenta Ethereal temporal (nodemailer test account).
 * No requiere credenciales reales — genera una URL de previsualización.
 *
 * Uso: node scripts/test-email.mjs
 */

import nodemailer from 'nodemailer'

const CRM_RECIPIENT = 'ivan.aguado00@gmail.com'

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Test CRM Email</title></head>
<body style="font-family:Inter,Arial,sans-serif;margin:0;padding:24px;background:#f5f5f5;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 4px rgba(0,0,0,.08);">
  <div style="background:#1a1a1a;padding:24px;border-radius:6px 6px 0 0;margin:-32px -32px 24px;">
    <p style="color:#c3f400;font-size:11px;font-weight:700;letter-spacing:.08em;margin:0 0 4px;">UNIVERSIDAD PRISMA</p>
    <p style="color:#fff;font-size:18px;font-weight:700;margin:0;">Solicitud CRM · Email aprobado</p>
  </div>

  <p style="font-size:15px;color:#1a1a1a;margin:0 0 20px;">Hola equipo,</p>
  <p style="font-size:15px;color:#1a1a1a;margin:0 0 20px;">
    Se ha preparado una nueva propuesta de email lista para trabajar desde CRM.
  </p>

  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:24px;border-collapse:collapse;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;padding:12px 0;">
    <tr><td style="padding:8px 0;font-size:13px;color:#6b7280;width:160px;">Programa</td><td style="padding:8px 0;font-size:13px;color:#1a1a1a;">Máster en Marketing Digital</td></tr>
    <tr><td style="padding:8px 0;font-size:13px;color:#6b7280;">Objetivo</td><td style="padding:8px 0;font-size:13px;color:#1a1a1a;">Captación de leads profesionales 25-40</td></tr>
    <tr><td style="padding:8px 0;font-size:13px;color:#6b7280;">Plantilla</td><td style="padding:8px 0;font-size:13px;color:#1a1a1a;">Email comercial</td></tr>
    <tr><td style="padding:8px 0;font-size:13px;color:#6b7280;">Asunto propuesto</td><td style="padding:8px 0;font-size:13px;color:#1a1a1a;">Campaña Máster Marketing Digital</td></tr>
  </table>

  <div style="background:#1a1a1a;border-radius:6px;padding:20px;margin-bottom:24px;">
    <p style="color:#c3f400;font-size:11px;font-weight:700;letter-spacing:.08em;margin:0 0 12px;">EMAIL MAQUETADO</p>
    <p style="color:#e3e2e5;font-size:14px;line-height:1.6;margin:0;">
      ¿Trabajas en el sector y quieres dar el salto al marketing digital?
      El Máster en Marketing Digital de Universidad Prisma está diseñado para profesionales como tú:
      flexible, 100% online y con acceso a nuestra red de alumni.
    </p>
    <div style="margin-top:16px;">
      <a href="#" style="display:inline-block;background:#c3f400;color:#1a1a1a;font-weight:700;font-size:13px;padding:10px 20px;border-radius:4px;text-decoration:none;">
        Solicitar información
      </a>
    </div>
  </div>

  <p style="font-size:12px;color:#9ca3af;margin:0;">
    Este email es una propuesta interna generada por PRISMA Copy Lab.
    Solo se envía al equipo de CRM para revisión, no al lead final.
  </p>
</div>
</body></html>`

const SAMPLE_TEXT = `UNIVERSIDAD PRISMA — Solicitud CRM

Hola equipo,

Se ha preparado una nueva propuesta de email lista para trabajar desde CRM.

Programa: Máster en Marketing Digital
Objetivo: Captación de leads profesionales 25-40
Plantilla: Email comercial
Asunto propuesto: Campaña Máster Marketing Digital

EMAIL MAQUETADO:
¿Trabajas en el sector y quieres dar el salto al marketing digital?
El Máster en Marketing Digital de Universidad Prisma está diseñado para profesionales como tú.

CTA: Solicitar información

---
Propuesta interna — PRISMA Copy Lab. Solo para el equipo de CRM.`

async function main() {
  console.log('Creando cuenta de test Ethereal…')
  const testAccount = await nodemailer.createTestAccount()

  console.log(`\nCuenta temporal creada:`)
  console.log(`  Usuario: ${testAccount.user}`)
  console.log(`  Host:    ${testAccount.smtp.host}:${testAccount.smtp.port}`)

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })

  console.log('\nEnviando email de prueba…')

  const info = await transporter.sendMail({
    from: '"PRISMA Copy Lab [TEST]" <prisma-test@ethereal.email>',
    to: CRM_RECIPIENT,
    subject: 'TEST · Solicitud CRM · Email aprobado · Máster Marketing Digital · Email comercial',
    text: SAMPLE_TEXT,
    html: SAMPLE_HTML,
  })

  console.log('\n✅ Email enviado correctamente')
  console.log(`   Message ID: ${info.messageId}`)
  console.log(`\n🔗 Ver email en Ethereal:`)
  console.log(`   ${nodemailer.getTestMessageUrl(info)}`)
  console.log('\nNota: Ethereal es un sandbox — el email NO llega a la bandeja real.')
  console.log('Para envío real, configura CRM_EMAIL_MODE=smtp y las variables SMTP en .env\n')
}

main().catch((err) => {
  console.error('Error al enviar email de prueba:', err.message)
  process.exit(1)
})
