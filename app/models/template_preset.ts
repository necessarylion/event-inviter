import { TemplatePresetSchema } from '#database/schema'
import type { Template } from '@pdfme/common'

/**
 * A system-provided, admin-authored card design. Organizers pick a published
 * preset as a starting point in the card designer; the stored `designJson` is a
 * pdfme Template (basePdf + schemas), same shape as CardTemplate.
 */
export default class TemplatePreset extends TemplatePresetSchema {
  get template(): Template {
    return this.designJson as Template
  }
}
