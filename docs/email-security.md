# Envío de email CRM — Seguridad y configuración

Este documento describe cómo configurar el envío real de emails CRM con Gmail SMTP sin guardar la App Password en texto plano.

---

## Visión general

El sistema soporta tres modos de envío, controlados por `CRM_EMAIL_MODE` en `.env`:

| Modo | Variable | Comportamiento |
|---|---|---|
| `mock` (por defecto) | `CRM_EMAIL_MODE=mock` | Registra el email en consola. No envía nada. |
| `smtp` con `.gmailpass` | `CRM_EMAIL_MODE=smtp` + archivo cifrado | Envío real via Gmail. Contraseña cifrada con DPAPI. |
| `smtp` con `SMTP_PASS` | `CRM_EMAIL_MODE=smtp` + var de entorno | Envío real via cualquier SMTP. Contraseña en `.env`. |

En desarrollo y CI/CD se usa `mock`. Para demos o envíos reales en local se usa `smtp` con `.gmailpass`.

---

## 1. Crear una App Password de Google

Una App Password es una contraseña de 16 caracteres generada por Google específicamente para una aplicación. Es distinta de tu contraseña normal y se puede revocar individualmente.

**Requisito previo:** la cuenta de Google debe tener la verificación en dos pasos activada.

1. Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. En "Seleccionar aplicación", elige **Correo**
3. En "Seleccionar dispositivo", elige **Otro (nombre personalizado)** → escribe `prisma-copy-lab`
4. Pulsa **Generar**
5. Copia los 16 caracteres que aparecen (sin espacios)

---

## 2. Cifrar la App Password con DPAPI (Windows)

DPAPI (Data Protection API) de Windows cifra datos usando las credenciales del usuario de Windows activo. El archivo resultante es inútil fuera de la misma sesión de usuario en el mismo PC.

Abre PowerShell en la raíz del proyecto y ejecuta:

```powershell
# Crea la carpeta scripts si no existe
if (-not (Test-Path "scripts")) { New-Item -ItemType Directory "scripts" }

# Solicita la App Password (sin mostrarla en pantalla) y la cifra con DPAPI
$Pass = Read-Host "App Password de Google (16 chars, sin espacios)" -AsSecureString
$Pass | ConvertFrom-SecureString | Out-File "scripts/.gmailpass" -Encoding utf8

Write-Host "✅ Archivo scripts/.gmailpass creado correctamente."
```

El archivo generado contiene una cadena hexadecimal cifrada. Nunca contiene la contraseña en texto plano.

**Verificación:** puedes confirmar que el archivo existe y descifra correctamente con:

```powershell
$ss = Get-Content "scripts/.gmailpass" | ConvertTo-SecureString
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss)
)
Write-Host "Longitud: $($plain.Length) chars"  # Debe ser 16
```

---

## 3. Configurar `.env` para Gmail SMTP

Añade o actualiza estas variables en tu `.env` local (no en `.env.example`):

```env
CRM_EMAIL_MODE=smtp
CRM_RECIPIENT_EMAIL=ivan.aguado00@gmail.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ivan.aguado00@gmail.com
# SMTP_PASS es opcional cuando existe scripts/.gmailpass
# SMTP_PASS=
SMTP_FROM="PRISMA Copy Lab" <ivan.aguado00@gmail.com>
```

Cuando `SMTP_PASS` no está definida, `emailService.ts` lee y descifra automáticamente `scripts/.gmailpass`.

---

## 4. Probar el envío

### Prueba rápida con Ethereal (sin credenciales reales)

```bash
node scripts/test-email.mjs
```

Genera una cuenta temporal, envía el email y devuelve una URL de previsualización.

### Prueba real con Gmail

Con `.gmailpass` creado y `.env` configurado:

```bash
node scripts/test-gmail.mjs
```

Envía un email real al correo configurado como `CRM_RECIPIENT_EMAIL`.

---

## 5. Propiedades de seguridad

| Propiedad | Garantía |
|---|---|
| La App Password no está en texto plano | El archivo usa cifrado DPAPI, no AES con clave hardcodeada |
| No se puede usar en otra máquina | DPAPI liga el cifrado al usuario y perfil de Windows |
| No sube al repositorio | `.gitignore` incluye `scripts/.gmailpass` y `.gmailpass` |
| No se expone al cliente | `emailService.ts` solo se importa desde cadenas server-side |
| El destinatario es fijo | `to` siempre es `CRM_RECIPIENT_EMAIL` — no acepta input del usuario |
| Errores no exponen la contraseña | Los bloques `catch` registran el mensaje de error, no las variables de credenciales |

---

## 6. Rotar o revocar la App Password

Si necesitas cambiar la contraseña:

1. Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) y revoca `prisma-copy-lab`
2. Genera una nueva App Password
3. Vuelve a ejecutar el paso 2 de este documento para sobreescribir `scripts/.gmailpass`
4. No hace falta cambiar nada más en el código

---

## 7. Limitaciones conocidas

- El descifrado DPAPI solo funciona en **Windows**. En Linux/macOS el servicio cae en modo `mock` automáticamente con un aviso en consola.
- Si el perfil de Windows se migra a otra máquina, el archivo `.gmailpass` deja de ser válido. Hay que regenerarlo.
- Gmail impone un límite de ~500 emails/día por cuenta con SMTP. Para volúmenes mayores usar un proveedor SMTP dedicado (SendGrid, Mailgun, etc.) y configurar `SMTP_PASS` directamente.
