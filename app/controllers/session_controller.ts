import User from '#models/user'
import firebase from '#services/firebase_service'
import { redirectAfterLogin } from '#services/login_redirect'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { email, password } = request.all()
    const user = await User.verifyCredentials(email, password)

    await auth.use('web').login(user)
    redirectAfterLogin(response, session)
  }

  /**
   * Google sign-in via Firebase. The browser obtains a Firebase ID token (see
   * `inertia/lib/firebase.ts`) and posts it here; we verify it with the Admin
   * SDK, then find-or-create the matching local user and start a session.
   */
  async google({ request, auth, response, session }: HttpContext) {
    if (!firebase.isConfigured) {
      return response.serviceUnavailable({ error: 'Google sign-in is not configured.' })
    }

    const idToken = request.input('idToken')
    if (!idToken) {
      return response.badRequest({ error: 'Missing ID token.' })
    }

    let claims
    try {
      claims = await firebase.verifyIdToken(idToken)
    } catch {
      return response.unauthorized({ error: 'Invalid Google sign-in. Please try again.' })
    }

    if (!claims.email) {
      return response.unprocessableEntity({ error: 'Your Google account has no email.' })
    }

    // Link to an existing account by email, otherwise create a fresh one.
    const user = await User.firstOrNew({ email: claims.email }, {})
    user.firebaseUid = claims.uid
    if (!user.fullName && claims.name) {
      user.fullName = claims.name as string
    }
    await user.save()

    await auth.use('web').login(user)
    session.flash('success', `Welcome, ${user.fullName ?? user.email}`)
    redirectAfterLogin(response, session)
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('session.create')
  }
}
