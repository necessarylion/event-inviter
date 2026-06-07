import vine from '@vinejs/vine'

/**
 * A template preset's metadata. The pdfme `template` itself arrives as a JSON
 * string and is parsed/validated (QR field presence) in the controller via
 * CardTemplateService, since that structure can't be expressed in Vine.
 */
const presetFields = {
  name: vine.string().trim().minLength(2).maxLength(150),
  description: vine.string().trim().maxLength(500).nullable().optional(),
  template: vine.string(),
  isPublished: vine.boolean().optional(),
}

export const createTemplatePresetValidator = vine.create({ ...presetFields })
export const updateTemplatePresetValidator = vine.create({ ...presetFields })
