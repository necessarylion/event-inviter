import type { HttpContext } from '@adonisjs/core/http'

/**
 * Redirect a freshly-authenticated user back to the page they were trying to
 * reach. Public pages (e.g. event join) stash a `returnTo` path in the session
 * before bouncing to login; we honour it here, falling back to the dashboard.
 *
 * Only same-origin, relative paths are accepted — an absolute/`//host` URL is
 * ignored to avoid an open-redirect.
 */
export function redirectAfterLogin(
  response: HttpContext['response'],
  session: HttpContext['session']
) {
  const target = session.pull('returnTo')
  if (typeof target === 'string' && /^\/(?!\/)/.test(target)) {
    return response.redirect().toPath(target)
  }
  return response.redirect().toRoute('dashboard')
}
