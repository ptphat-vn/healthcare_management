import nodemailer from 'nodemailer'
import sgMail from '@sendgrid/mail'
import { env } from '~/configs/environment.config'

const hasSendGrid = Boolean(env.SENDGRID_API_KEY)

if (hasSendGrid) {
  sgMail.setApiKey(env.SENDGRID_API_KEY as string)
}

const smtpTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
})

interface SendMailParams {
  to: string
  subject: string
  text?: string
  html?: string
}

export async function sendMail({ to, subject, text, html }: SendMailParams) {

  if (hasSendGrid) {
    const fromEmail = env.SENDGRID_FROM_EMAIL || env.SMTP_FROM
    const fromName = env.SENDGRID_FROM_NAME || 'FSA Healthcare'

    try {
      const [response] = await sgMail.send({
        to,
        from: {
          email: fromEmail,
          name: fromName
        },
        subject,
        text: text || '',
        html
      })
      return response
    } catch (error) {
      console.error('Error sending email via SendGrid:', error)
      throw error
    }
  }

  try {
    const info = await smtpTransporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      text,
      html
    })
    return info
  } catch (error) {
    console.error('Error sending email via SMTP:', error)
    throw error
  }
}
