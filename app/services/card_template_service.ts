import type { Template } from '@pdfme/common'

/**
 * Helpers for building/validating pdfme card templates, shared by the per-event
 * card designer (CardController) and the admin template manager
 * (AdminTemplatesController).
 */
class CardTemplateService {
  /**
   * Starter pdfme template (A6 portrait, millimetres) used as the blank canvas
   * for a brand-new card or template preset. Contains the required QR code field
   * and the reserved `guestName` field the per-guest renderer fills in.
   */
  defaultTemplate(title: string, sampleQr: string): Template {
    return {
      basePdf: { width: 105, height: 148, padding: [0, 0, 0, 0] },
      schemas: [
        [
          {
            name: 'eyebrow',
            type: 'text',
            content: "YOU'RE INVITED",
            position: { x: 10, y: 12 },
            width: 85,
            height: 6,
            fontSize: 9,
            alignment: 'center',
            characterSpacing: 1,
            fontColor: '#888888',
          },
          {
            name: 'eventTitle',
            type: 'text',
            content: title,
            position: { x: 10, y: 20 },
            width: 85,
            height: 14,
            fontSize: 20,
            alignment: 'center',
          },
          {
            name: 'guestName',
            type: 'text',
            content: 'Guest name',
            position: { x: 10, y: 40 },
            width: 85,
            height: 8,
            fontSize: 12,
            alignment: 'center',
            fontColor: '#555555',
          },
          {
            name: 'eventDate',
            type: 'text',
            content: 'Event date',
            position: { x: 10, y: 50 },
            width: 85,
            height: 6,
            fontSize: 9,
            alignment: 'center',
            fontColor: '#888888',
          },
          {
            name: 'qr',
            type: 'qrcode',
            content: sampleQr,
            position: { x: 37.5, y: 66 },
            width: 30,
            height: 30,
          },
          {
            name: 'qrLabel',
            type: 'text',
            content: 'Scan at the entrance',
            position: { x: 10, y: 100 },
            width: 85,
            height: 6,
            fontSize: 9,
            alignment: 'center',
            fontColor: '#888888',
          },
        ],
      ],
    }
  }

  /**
   * Parse a template payload (JSON string or object) and confirm it carries a
   * QR code field — the one field the system owns and fills with each guest's
   * invite URL, so a card is useless without it.
   */
  parseAndValidate(raw: unknown): { template: Template; hasQr: boolean } | null {
    let template: Template | undefined
    try {
      template = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Template
    } catch {
      template = undefined
    }
    if (!template) return null

    const schemas = template.schemas ?? []
    const hasQr = schemas.some((page) => page.some((schema) => schema.type === 'qrcode'))
    return { template, hasQr }
  }

  /**
   * Pull the page dimensions from a template's blank-page basePdf, rounded to
   * whole millimetres. Empty when the base is an uploaded PDF data URI.
   */
  dimensions(template: Template): { width?: number; height?: number } {
    const basePdf = template.basePdf as { width?: number; height?: number } | string
    return typeof basePdf === 'object' && basePdf.width && basePdf.height
      ? { width: Math.round(basePdf.width), height: Math.round(basePdf.height) }
      : {}
  }
}

export default new CardTemplateService()
