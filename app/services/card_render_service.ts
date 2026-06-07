import { generate } from '@pdfme/generator'
import { pdf2img } from '@pdfme/converter'
import {
  text,
  multiVariableText,
  image,
  svg,
  table,
  list,
  line,
  rectangle,
  ellipse,
  circleMark,
  signature,
  barcodes,
} from '@pdfme/schemas'
import type { Template } from '@pdfme/common'
import type CardTemplate from '#models/card_template'
import fontService from '#services/font_service'

/**
 * Renders an invitation card to a PDF using pdfme's generator (pure Node, no
 * headless browser). The card layout is a pdfme Template designed in the editor.
 *
 * The QR field content is owned by the system: at render time every `qrcode`
 * schema is filled with the guest's invite URL, regardless of what placeholder
 * was set in the designer — so the organizer can scan and verify it at the door.
 *
 * `multiVariableText` schemas (e.g. "Dear {guestName},") get their variables
 * substituted too: the organizer's saved defaults are kept, then any variable
 * matching a per-guest field (guestName) or per-event field (eventTitle,
 * eventDate) is overwritten with the real value.
 */
class CardRenderService {
  async toPdf(
    cardTemplate: CardTemplate,
    qrPayload: string,
    fields: Record<string, string> = {}
  ): Promise<Uint8Array> {
    const template = cardTemplate.template as Template

    // Build the per-field input value, highest priority first. Critically, pdfme
    // only paints image/svg/signature fields when a value is supplied via `inputs`
    // — unlike text, it does NOT fall back to the schema's `content`. So every
    // field is seeded from its designed `content`, ensuring static images render.
    const input: Record<string, string> = {}
    for (const page of template.schemas) {
      for (const schema of page) {
        if (schema.type === 'qrcode') {
          input[schema.name] = qrPayload
        } else if (schema.type === 'multiVariableText') {
          input[schema.name] = this.multiVariableInput(schema, fields)
        } else if (schema.name in fields) {
          input[schema.name] = fields[schema.name]
        } else if (typeof schema.content === 'string') {
          input[schema.name] = schema.content
        }
      }
    }

    return this.generatePdf(template, input)
  }

  /**
   * Render the card's first page to a PNG image. Builds the same PDF as
   * `toPdf`, then rasterizes page 1 to PNG via pdfme's converter (native
   * canvas, runs headless under Node). `scale` controls the output DPI.
   */
  async toPng(
    cardTemplate: CardTemplate,
    qrPayload: string,
    fields: Record<string, string> = {},
    scale = 3
  ): Promise<Uint8Array> {
    const pdf = await this.toPdf(cardTemplate, qrPayload, fields)
    const [png] = await pdf2img(pdf, {
      imageType: 'png',
      scale,
      range: { start: 0, end: 0 },
    })
    return new Uint8Array(png)
  }

  private async generatePdf(
    template: Template,
    input: Record<string, string>
  ): Promise<Uint8Array> {
    return generate({
      template,
      inputs: [input],
      // The invitation fonts referenced by this template, plus the fallback. Must
      // mirror what the designer offers, or generate() throws when a schema's
      // fontName isn't found in the font map.
      options: { font: await fontService.fontsForTemplate(template) },
      // Every plugin a designed template might contain must be registered here, or
      // generate() throws on an unknown schema type. Mirror the designer's set.
      plugins: {
        text,
        multiVariableText,
        image,
        qrcode: barcodes.qrcode,
        table,
        list,
        line,
        rectangle,
        ellipse,
        svg,
        circleMark,
        signature,
      },
    })
  }

  /**
   * Build the JSON-string input pdfme expects for a multiVariableText field:
   * the field's own default variable values, with our known data fields merged
   * over the top so placeholders like `{guestName}` resolve per guest.
   */
  private multiVariableInput(schema: any, fields: Record<string, string>): string {
    let variables: Record<string, string> = {}
    try {
      variables =
        typeof schema.content === 'string' && schema.content ? JSON.parse(schema.content) : {}
    } catch {
      variables = {}
    }

    for (const name of (schema.variables as string[] | undefined) ?? []) {
      if (name in fields) {
        variables[name] = fields[name]
      }
    }

    return JSON.stringify(variables)
  }
}

export default new CardRenderService()
