import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Restricts a route to admin users (see User.isAdmin, backed by the ADMIN_EMAILS
 * env allowlist). Must run after `auth` so `ctx.auth.user` is populated.
 */
export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!ctx.auth.user?.isAdmin) {
      return ctx.response.forbidden('Admins only')
    }
    return next()
  }
}
