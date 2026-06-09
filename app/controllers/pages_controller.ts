import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Public, server-rendered (Edge) marketing pages — optimized for SEO.
 */
export default class PagesController {
  async home({ view, auth }: HttpContext) {
    /**
     * The home page is public and always accessible — logged-in visitors see it
     * too (so `auth.check()` is only used to tailor the page, not to redirect).
     */
    const isAuthenticated = await auth.check()

    return view.render('pages/home', {
      appUrl: env.get('APP_URL'),
      isAuthenticated,
    })
  }

  async robots({ response }: HttpContext) {
    response.header('Content-Type', 'text/plain')
    return `User-agent: *\nAllow: /\nDisallow: /dashboard\nSitemap: ${env.get('APP_URL')}/sitemap.xml\n`
  }

  async sitemap({ response }: HttpContext) {
    const base = env.get('APP_URL')
    const urls = ['/', '/events', '/signup', '/login']

    response.header('Content-Type', 'application/xml')
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${base}${url === '/' ? '' : url}</loc></url>`).join('\n')}
</urlset>`
  }
}
