import type { Handler } from '@netlify/functions'
import { Resend } from 'resend'

// Expects env vars:
// - RESEND_API_KEY: string
// - DEST_EMAIL: recipient email (site owner's inbox)
// - FROM_EMAIL: verified sender identity in Resend (e.g., no-reply@yourdomain)

const resend = new Resend(process.env.RESEND_API_KEY)

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { email, images } = JSON.parse(event.body || '{}') as {
      email?: string // visitor email (for reply-to)
      images?: string[] // array of data URLs (image/png)
    }

    if (!Array.isArray(images) || images.length === 0) {
      return { statusCode: 400, body: 'No images provided' }
    }

    const to = process.env.DEST_EMAIL
    const from = process.env.FROM_EMAIL

    if (!to) return { statusCode: 500, body: 'DEST_EMAIL env missing' }
    if (!from) return { statusCode: 500, body: 'FROM_EMAIL env missing' }

    // Prepare attachments from data URLs
    const attachments = images
      .filter((dataUrl) => typeof dataUrl === 'string' && dataUrl.startsWith('data:image/png;base64,'))
      .map((dataUrl, i) => ({
        filename: `note-${Date.now()}-${i + 1}.png`,
        content: dataUrl.replace(/^data:image\/png;base64,/, ''),
      }))

    if (attachments.length === 0) {
      return { statusCode: 400, body: 'Invalid images' }
    }

    const subject = `New note${attachments.length > 1 ? 's' : ''} from portfolio`

    const textLines = [
      'You have received new note image(s) from your portfolio.',
      email ? `Visitor email: ${email}` : undefined,
      '',
      'Attached: ' + attachments.map((a) => a.filename).join(', '),
    ].filter(Boolean)

    const res = await resend.emails.send({
      from,
      to,
      subject,
      text: textLines.join('\n'),
      attachments,
      reply_to: email || undefined,
    })

    if ((res as any)?.error) {
      console.error('Resend error:', (res as any).error)
      return { statusCode: 502, body: 'Email provider error' }
    }

    return { statusCode: 200, body: 'OK' }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: 'Server error' }
  }
}
