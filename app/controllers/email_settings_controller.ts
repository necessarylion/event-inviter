import { DateTime } from 'luxon'
import EmailSetting from '#models/email_setting'
import mailerFactory from '#services/mailer_factory'
import encryption from '@adonisjs/core/services/encryption'
import { emailSettingValidator } from '#validators/email_setting'
import type { HttpContext } from '@adonisjs/core/http'
import type { EmailCredentials, SmtpCredentials, SesCredentials } from '#models/email_setting'

export default class EmailSettingsController {
  async edit({ auth, inertia }: HttpContext) {
    const setting = await EmailSetting.findBy('userId', auth.user!.id)

    /**
     * Prefill non-secret fields only; secrets stay blank (a "configured" flag
     * tells the UI a secret is already stored).
     */
    let config = null as null | {
      host: string
      port: number
      secure: boolean
      username: string
      region: string
      accessKeyId: string
      hasSecret: boolean
    }
    if (setting) {
      const creds = (encryption.decrypt<EmailCredentials>(setting.credentials) ?? {}) as Record<
        string,
        unknown
      >
      config = {
        host: String(creds.host ?? ''),
        port: Number(creds.port ?? 587),
        secure: Boolean(creds.secure ?? false),
        username: String(creds.username ?? ''),
        region: String(creds.region ?? ''),
        accessKeyId: String(creds.accessKeyId ?? ''),
        hasSecret: Boolean(creds.password || creds.apiKey || creds.secretAccessKey),
      }
    }

    return inertia.render('settings/email', {
      setting: setting
        ? {
            provider: setting.provider,
            fromEmail: setting.fromEmail,
            fromName: setting.fromName,
            isVerified: setting.isVerified,
            lastTestedAt: setting.lastTestedAt?.toISO() ?? null,
          }
        : null,
      config,
    })
  }

  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(emailSettingValidator)

    const existing = await EmailSetting.findBy('userId', user.id)
    const previous = existing
      ? ((encryption.decrypt<EmailCredentials>(existing.credentials) ?? {}) as Record<
          string,
          unknown
        >)
      : {}

    const credentials = this.buildCredentials(payload, previous)

    await EmailSetting.updateOrCreate(
      { userId: user.id },
      {
        userId: user.id,
        provider: payload.provider,
        fromEmail: payload.fromEmail,
        fromName: payload.fromName ?? null,
        credentials: encryption.encrypt(credentials),
        // Any change requires re-verification via "send test email".
        isVerified: false,
      }
    )

    session.flash('success', 'Email settings saved. Send a test email to verify them.')
    return response.redirect().toRoute('email_settings.edit')
  }

  async test({ auth, response, session }: HttpContext) {
    const user = auth.user!
    const setting = await EmailSetting.findBy('userId', user.id)
    if (!setting) {
      session.flash('error', 'Save your email settings first.')
      return response.redirect().toRoute('email_settings.edit')
    }

    try {
      const { mailer, from } = mailerFactory.fromSetting(setting)
      await mailer.send((message) => {
        if (from) {
          message.from(from.address, from.name)
        }
        message
          .to(user.email)
          .subject('Test email from Guest Invite')
          .html('<p>✅ Your email settings are working. You can now send invitations.</p>')
      })

      setting.isVerified = true
      setting.lastTestedAt = DateTime.now()
      await setting.save()
      session.flash('success', `Test email sent to ${user.email}.`)
    } catch (error) {
      setting.isVerified = false
      await setting.save()
      session.flash('error', `Test failed: ${(error as Error).message}`)
    }

    return response.redirect().toRoute('email_settings.edit')
  }

  /**
   * Assembles the provider credential blob, preserving previously-stored secrets
   * when the corresponding field is left blank on submit.
   */
  private buildCredentials(
    payload: Awaited<ReturnType<typeof emailSettingValidator.validate>>,
    previous: Record<string, unknown>
  ): EmailCredentials {
    const keep = (incoming: string | undefined, key: string) =>
      incoming && incoming.length > 0 ? incoming : ((previous[key] as string | undefined) ?? '')

    switch (payload.provider) {
      case 'smtp':
        return {
          host: payload.host!,
          port: payload.port!,
          secure: payload.secure ?? false,
          username: payload.username || undefined,
          password: keep(payload.password, 'password'),
        } satisfies SmtpCredentials
      case 'resend':
        return { apiKey: keep(payload.apiKey, 'apiKey') }
      case 'ses':
        return {
          region: payload.region!,
          accessKeyId: payload.accessKeyId || (previous.accessKeyId as string) || '',
          secretAccessKey: keep(payload.secretAccessKey, 'secretAccessKey'),
        } satisfies SesCredentials
      default:
        throw new Error('Unsupported provider')
    }
  }
}
