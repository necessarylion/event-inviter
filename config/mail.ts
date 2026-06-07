import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'
import type { InferMailers } from '@adonisjs/mail/types'

const mailConfig = defineConfig({
  /**
   * Default mailer used by the system (e.g. for users who have not configured
   * their own provider). In development this points at a local SMTP catcher
   * such as MailHog/Mailpit (localhost:1025).
   */
  default: 'smtp',

  /**
   * Global "from" identity used when a message does not set its own sender.
   */
  from: {
    address: env.get('MAIL_FROM_ADDRESS', 'no-reply@event-inviter.test'),
    name: env.get('MAIL_FROM_NAME', 'Guest Invite'),
  },

  /**
   * The system-level mailers. Per-user custom providers are built at runtime by
   * the MailerFactory service (see app/services/mailer_factory.ts).
   */
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST'),
      port: env.get('SMTP_PORT'),
    }),

    resend: transports.resend({
      key: env.get('RESEND_API_KEY', ''),
      baseUrl: 'https://api.resend.com',
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
