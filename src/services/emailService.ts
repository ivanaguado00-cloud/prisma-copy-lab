// Abstracción de envío de email.
// Modo controlado por CRM_EMAIL_MODE en .env:
//   - mock (por defecto): registra el envío en consola, no envía nada real.
//   - smtp: envío real via nodemailer.
//
// Resolución de la contraseña SMTP (en orden de prioridad):
//   1. Variable de entorno SMTP_PASS o SMTP_PASSWORD.
//   2. Archivo scripts/.gmailpass cifrado con DPAPI de Windows (solo Windows).
//
// Ver docs/email-security.md para instrucciones de configuración.

import { existsSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'
import nodemailer from 'nodemailer'

export interface SendEmailPayload {
  to: string
  subject: string
  html: string
  text: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
  mock?: boolean
}

export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const mode = process.env.CRM_EMAIL_MODE ?? 'mock'

  if (mode !== 'smtp') {
    return sendMock(payload)
  }

  return sendSmtp(payload)
}

// ── Mock ─────────────────────────────────────────────────────────────────────

function sendMock(payload: SendEmailPayload): SendEmailResult {
  console.log('\n[EMAIL SERVICE - MOCK] ─────────────────────────────────────')
  console.log(`  To:      ${payload.to}`)
  console.log(`  Subject: ${payload.subject}`)
  console.log(`  Plain:\n${payload.text.slice(0, 300)}...`)
  console.log('─────────────────────────────────────────────────────────────\n')

  return {
    success: true,
    messageId: `mock_${Date.now()}`,
    mock: true,
  }
}

// ── SMTP via nodemailer ───────────────────────────────────────────────────────
// Requiere: SMTP_HOST, SMTP_USER, contraseña (SMTP_PASS o scripts/.gmailpass), SMTP_FROM
// Opcionales: SMTP_PORT (por defecto 587), SMTP_SECURE (por defecto false salvo puerto 465)

async function sendSmtp(payload: SendEmailPayload): Promise<SendEmailResult> {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || readGmailPass()
  const from = process.env.SMTP_FROM ?? (user ? `"Universidad Prisma" <${user}>` : undefined)

  if (!host || !user || !pass || !from) {
    const missing = [
      !host && 'SMTP_HOST',
      !user && 'SMTP_USER',
      !pass && 'SMTP_PASS (o scripts/.gmailpass)',
      !from && 'SMTP_FROM',
    ]
      .filter(Boolean)
      .join(', ')
    const message = `Configuración SMTP incompleta. Variables requeridas: ${missing}.`
    console.error(`[EMAIL SERVICE] ${message}`)
    return { success: false, error: message }
  }

  const port = Number(process.env.SMTP_PORT ?? 587)
  const secureEnv = process.env.SMTP_SECURE
  const secure = secureEnv !== undefined ? secureEnv === 'true' : port === 465

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    })

    const info = await transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    })

    return { success: true, messageId: info.messageId }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[EMAIL SERVICE] Error al enviar email:', message)
    return { success: false, error: message }
  }
}

// ── DPAPI password reader ─────────────────────────────────────────────────────
// Lee y descifra scripts/.gmailpass usando DPAPI de Windows.
// El archivo se genera con: $Pass | ConvertFrom-SecureString | Out-File scripts/.gmailpass
// Solo funciona en el mismo usuario/PC que cifró el archivo.

function readGmailPass(): string | null {
  const filePath = join(process.cwd(), 'scripts', '.gmailpass')

  if (!existsSync(filePath)) return null

  if (process.platform !== 'win32') {
    console.warn(
      '[EMAIL SERVICE] scripts/.gmailpass solo puede descifrarse en Windows (DPAPI). ' +
      'Configura SMTP_PASS en .env para otros sistemas operativos.',
    )
    return null
  }

  try {
    // Usa -EncodedCommand para evitar problemas de comillas con rutas que contengan
    // espacios o caracteres especiales. El script PowerShell descifra la SecureString
    // exportada con ConvertFrom-SecureString (DPAPI) y devuelve el texto plano.
    const normalizedPath = filePath.replace(/\\/g, '/')
    const psScript =
      `$ss = Get-Content '${normalizedPath.replace(/'/g, "''")}' | ConvertTo-SecureString; ` +
      `[Runtime.InteropServices.Marshal]::PtrToStringAuto(` +
      `[Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss))`
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64')

    const raw = execSync(
      `powershell -NonInteractive -NoProfile -EncodedCommand ${encoded}`,
      { encoding: 'utf8', timeout: 8000 },
    )

    const password = raw.trim()
    return password.length > 0 ? password : null
  } catch (err) {
    console.error(
      '[EMAIL SERVICE] Error al descifrar scripts/.gmailpass:',
      err instanceof Error ? err.message : String(err),
    )
    return null
  }
}
