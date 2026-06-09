import { unlink } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import app from '@adonisjs/core/services/app'
import type { MultipartFile } from '@adonisjs/core/bodyparser'

/** Public sub-directory (under `public/`) where event thumbnails are stored. */
const UPLOAD_DIR = 'uploads/events'

/**
 * Persists user-uploaded event thumbnails to the static `public/` directory and
 * derives the public URL they are served from. Files live at
 * `public/uploads/events/<cuid>.<ext>` and are served by @adonisjs/static at
 * `/uploads/events/<cuid>.<ext>`.
 */
class EventThumbnailService {
  /**
   * Moves an uploaded file into the public uploads directory under a random,
   * collision-resistant name and returns its public URL path.
   */
  async store(file: MultipartFile) {
    const name = `${randomBytes(16).toString('hex')}.${file.extname}`
    await file.move(app.publicPath(UPLOAD_DIR), { name })
    return `/${UPLOAD_DIR}/${name}`
  }

  /**
   * Deletes a previously stored thumbnail from disk. No-op for empty values or
   * URLs that don't point at our uploads directory (e.g. external URLs).
   */
  async delete(url: string | null | undefined) {
    const prefix = `/${UPLOAD_DIR}/`
    if (!url || !url.startsWith(prefix)) return

    try {
      await unlink(app.publicPath(UPLOAD_DIR, url.slice(prefix.length)))
    } catch {
      // Already gone — nothing to clean up.
    }
  }
}

export default new EventThumbnailService()
