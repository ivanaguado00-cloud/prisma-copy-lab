/**
 * Script de prueba de envío real con Gmail SMTP + scripts/.gmailpass (DPAPI).
 * Lee la App Password desde el archivo cifrado y envía un email de prueba a CRM_RECIPIENT_EMAIL.
 *
 * Requisitos:
 *   1. Haber creado scripts/.gmailpass (ver docs/email-security.md)
 *   2. Tener en .env: SMTP_HOST, SMTP_USER, SMTP_FROM y CRM_RECIPIENT_EMAIL
 *
 * Uso:
 *   node scripts/test-gmail.mjs
 */

import { existsSync, readFileSync } from 'fs'
import { execSync } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import nodemailer from 'nodemailer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── Leer .env manualmente (sin dotenv como dependencia) ───────────────────────

function loadEnv() {
  const envPath = join(ROOT, '.env')
  if (!existsSync(envPath)) return {}

  const env = {}
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    env[key] = val
  }
  return env
}

const env = loadEnv()
const get = (key) => process.env[key] ?? env[key] ?? ''

// ── Descifrar scripts/.gmailpass ──────────────────────────────────────────────

function readGmailPass() {
  const filePath = join(ROOT, 'scripts', '.gmailpass')

  if (!existsSync(filePath)) {
    console.error('❌  No se encontró scripts/.gmailpass')
    console.error('    Genera el archivo con:')
    console.error('    $Pass = Read-Host "App Password" -AsSecureString')
    console.error('    $Pass | ConvertFrom-SecureString | Out-File "scripts/.gmailpass" -Encoding utf8')
    process.exit(1)
  }

  if (process.platform !== 'win32') {
    console.error('❌  scripts/.gmailpass solo puede descifrarse en Windows (DPAPI).')
    console.error('    En Linux/macOS configura SMTP_PASS en .env directamente.')
    process.exit(1)
  }

  try {
    const normalized = filePath.replace(/\\/g, '/')
    const psScript =
      `$ss = Get-Content '${normalized.replace(/'/g, "''")}' | ConvertTo-SecureString; ` +
      `[Runtime.InteropServices.Marshal]::PtrToStringAuto(` +
      `[Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss))`
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
    const raw = execSync(
      `powershell -NonInteractive -NoProfile -EncodedCommand ${encoded}`,
      { encoding: 'utf8', timeout: 8000 },
    )
    const pass = raw.trim()
    if (!pass) throw new Error('El archivo no produjo ninguna contraseña.')
    return pass
  } catch (err) {
    console.error('❌  Error al descifrar scripts/.gmailpass:', err.message)
    process.exit(1)
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const host = get('SMTP_HOST')
  const user = get('SMTP_USER')
  const from = get('SMTP_FROM') || (user ? `"PRISMA Copy Lab" <${user}>` : '')
  const recipient = get('CRM_RECIPIENT_EMAIL') || 'ivan.aguado00@gmail.com'

  if (!host || !user) {
    console.error('❌  Faltan variables en .env: SMTP_HOST y SMTP_USER son obligatorias.')
    process.exit(1)
  }

  console.log('🔐  Descifrando scripts/.gmailpass…')
  const pass = readGmailPass()
  console.log(`    App Password leída (${pass.length} chars)`)

  const transporter = nodemailer.createTransport({
    host,
    port: Number(get('SMTP_PORT') || '587'),
    secure: get('SMTP_SECURE') === 'true',
    auth: { user, pass },
  })

  console.log(`\n📨  Enviando email de prueba…`)
  console.log(`    De:   ${from}`)
  console.log(`    Para: ${recipient}`)

  const info = await transporter.sendMail({
    from,
    to: recipient,
    subject: '[TEST] PRISMA Copy Lab — Prueba de envío CRM',
    text: [
      'Hola equipo,',
      '',
      'Este es un email de prueba enviado desde PRISMA Copy Lab para verificar',
      'que el sistema de envío CRM funciona correctamente con Gmail SMTP.',
      '',
      `Modo:      smtp`,
      `Remitente: ${from}`,
      `Destinatario: ${recipient}`,
      '',
      'Si recibes este mensaje, la configuración es correcta.',
      '',
      '— PRISMA Copy Lab',
    ].join('\n'),
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;padding:24px;background:#f5f5f5;">
<div style="max-width:540px;margin:0 auto;background:#fff;border-radius:8px;padding:28px;">
  <div style="background:#1a1a1a;padding:16px 20px;border-radius:5px;margin-bottom:20px;">
    <p style="color:#c3f400;font-size:11px;letter-spacing:.08em;font-weight:700;margin:0 0 4px;">PRISMA COPY LAB</p>
    <p style="color:#fff;font-size:16px;font-weight:700;margin:0;">[TEST] Prueba de envío CRM</p>
  </div>
  <p style="color:#1a1a1a;font-size:14px;">Hola equipo,</p>
  <p style="color:#1a1a1a;font-size:14px;">
    Este email verifica que el sistema de envío CRM funciona correctamente con Gmail SMTP y contraseña cifrada con DPAPI.
  </p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;">
    <tr><td style="padding:6px 0;color:#6b7280;width:130px;">Modo</td><td style="color:#1a1a1a;">smtp (Gmail)</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Contraseña</td><td style="color:#1a1a1a;">Leída desde scripts/.gmailpass (DPAPI)</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Destinatario</td><td style="color:#1a1a1a;">${recipient}</td></tr>
  </table>
  <p style="color:#9ca3af;font-size:12px;">Si recibes este mensaje, la configuración es correcta.</p>
</div>
</body></html>`,
  })

  console.log(`\n✅  Email enviado correctamente`)
  console.log(`    Message ID: ${info.messageId}`)
  console.log(`    Revisa la bandeja de ${recipient}\n`)
}

main().catch((err) => {
  console.error('❌  Error inesperado:', err.message)
  process.exit(1)
})
