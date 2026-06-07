import { readFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import type { Font, Template } from '@pdfme/common'

interface FontEntry {
  name: string
  file: string
  category: string
  fallback: boolean
}

/**
 * Provides the curated invitation fonts (see `public/fonts/manifest.json`, built
 * by `scripts/download-fonts.mjs`) to pdfme for server-side PDF generation.
 *
 * pdfme's `checkFont` requires exactly one `fallback` font and that every
 * `fontName` referenced by a template's schemas is present in the font map. So
 * for each render we read just the fonts the template actually uses, plus the
 * fallback — keeping generation fast while satisfying that contract. File buffers
 * are cached per process, so a font's TTF is read from disk at most once.
 */
class FontService {
  private manifest?: FontEntry[]
  private buffers = new Map<string, string>()

  /** The manifest of available fonts, loaded (and cached) from disk. */
  async manifestEntries(): Promise<FontEntry[]> {
    if (!this.manifest) {
      const raw = await readFile(app.publicPath('fonts', 'manifest.json'), 'utf8')
      this.manifest = JSON.parse(raw) as FontEntry[]
    }
    return this.manifest
  }

  /** The font marked as the pdfme fallback (used for text without a fontName). */
  private async fallbackEntry(entries: FontEntry[]): Promise<FontEntry> {
    const fallback = entries.find((e) => e.fallback) ?? entries[0]
    if (!fallback) throw new Error('No fonts available in public/fonts/manifest.json')
    return fallback
  }

  /** TTF bytes as a base64 string (pdfme decodes non-URL string data as base64). */
  private async readFont(file: string): Promise<string> {
    let data = this.buffers.get(file)
    if (!data) {
      const buf = await readFile(app.publicPath('fonts', file))
      data = buf.toString('base64')
      this.buffers.set(file, data)
    }
    return data
  }

  /**
   * Build the pdfme Font map for a template: every font its schemas reference
   * (that we ship), plus the single fallback font.
   */
  async fontsForTemplate(template: Template): Promise<Font> {
    const entries = await this.manifestEntries()
    const byName = new Map(entries.map((e) => [e.name, e]))
    const fallback = await this.fallbackEntry(entries)

    const used = new Set<string>([fallback.name])
    for (const page of template.schemas) {
      for (const schema of page) {
        const fontName = (schema as { fontName?: string }).fontName
        if (fontName && byName.has(fontName)) used.add(fontName)
      }
    }

    const font: Font = {}
    for (const name of used) {
      const entry = byName.get(name)!
      font[name] = {
        data: await this.readFont(entry.file),
        fallback: entry.name === fallback.name,
      }
    }
    return font
  }
}

export default new FontService()
