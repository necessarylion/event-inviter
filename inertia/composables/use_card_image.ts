import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// pdfjs runs its parser in a Web Worker; point it at the Vite-bundled worker.
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

/**
 * Client-side PDF → PNG. We let the server render the card to a PDF (fast,
 * no headless canvas) and rasterize the first page in the browser, so the
 * download stays snappy and the conversion cost lands on the user's machine.
 */
export function useCardImage() {
  /**
   * Fetch a card PDF, render its first page to a PNG, and download it.
   * `scale` trades file size for sharpness (3 ≈ ~216 DPI for an A6 card).
   */
  async function downloadCardImage(pdfUrl: string, filename: string, scale = 3) {
    const res = await fetch(pdfUrl, { headers: { Accept: 'application/pdf' } })
    if (!res.ok) throw new Error(`Failed to load card (${res.status})`)

    const data = new Uint8Array(await res.arrayBuffer())
    const pdf = await pdfjs.getDocument({ data }).promise
    try {
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas not supported')

      await page.render({ canvas, canvasContext: context, viewport }).promise

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Could not encode PNG'))),
          'image/png'
        )
      )

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      await pdf.destroy()
    }
  }

  return { downloadCardImage }
}
