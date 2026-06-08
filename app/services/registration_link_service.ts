import { randomBytes } from 'node:crypto'
import env from '#start/env'

/**
 * Owns the public registration-link token and the URL derived from it. The link
 * is event-scoped (one per event) and lets anyone self-register as a guest —
 * distinct from invitation_service, whose tokens are bound to a single guest.
 */
class RegistrationLinkService {
  /**
   * Cryptographically-random, URL-safe token used in the public registration URL.
   */
  generateToken() {
    return randomBytes(18).toString('base64url')
  }

  /**
   * Absolute public registration URL for a token.
   */
  registrationUrl(token: string) {
    return new URL(`/r/${token}`, env.get('APP_URL')).toString()
  }
}

export default new RegistrationLinkService()
