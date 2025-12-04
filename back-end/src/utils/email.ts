import nodemailer from 'nodemailer'
import { env } from '~/configs/environment.config'

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  
})


export async function sendMail({ to, subject, text, html }: { to: string, subject: string, text?: string, html?: string }) {
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    })
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
