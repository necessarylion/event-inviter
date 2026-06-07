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
      // 5 × 7 in — the default card size (mirrors DEFAULT_SIZE_PRESET in the designer).
      basePdf: { width: 127, height: 178, padding: [0, 0, 0, 0] },
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
   * Pull the page dimensions (whole millimetres) from a template's basePdf —
   * either the blank-page spec `{ width, height }` or, for an uploaded PDF data
   * URI, the first page of the PDF itself (matching what the designer shows).
   * Empty only when neither can be read.
   */
  async dimensions(template: Template): Promise<{ width?: number; height?: number }> {
    const basePdf = template.basePdf as { width?: number; height?: number } | string

    if (typeof basePdf === 'object' && basePdf.width && basePdf.height) {
      return { width: Math.round(basePdf.width), height: Math.round(basePdf.height) }
    }

    if (typeof basePdf === 'string' && basePdf.startsWith('data:')) {
      const size = await this.pdfSizeMm(basePdf)
      if (size) return size
    }

    return {}
  }

  // PDF page boxes are measured in points; basePdf sizes are in millimetres.
  private readonly PT_TO_MM = 25.4 / 72

  /**
   * First-page size of a base64 PDF data URI, in whole millimetres (accounting
   * for page rotation) — the server-side mirror of the designer's pdfSizeMm.
   * Null if the PDF can't be read.
   */
  private async pdfSizeMm(dataUri: string): Promise<{ width: number; height: number } | null> {
    try {
      const base64 = dataUri.slice(dataUri.indexOf(',') + 1)
      const bytes = Buffer.from(base64, 'base64')
      const { PDFDocument } = (await import('@pdfme/pdf-lib')) as any
      const doc = await PDFDocument.load(bytes)
      const page = doc.getPage(0)
      if (!page) return null
      const { width, height } = page.getSize()
      const rotated = (page.getRotation().angle / 90) % 2 !== 0
      const w = rotated ? height : width
      const h = rotated ? width : height
      return { width: Math.round(w * this.PT_TO_MM), height: Math.round(h * this.PT_TO_MM) }
    } catch {
      return null
    }
  }
}

export default new CardTemplateService()
