/**
 * Downloads a curated set of invitation-oriented fonts (wedding, formal events,
 * modern celebrations) from the google/fonts repository into `public/fonts/`,
 * and writes `public/fonts/manifest.json` describing them.
 *
 * Run with: `node scripts/download-fonts.mjs` (or `bun scripts/download-fonts.mjs`).
 *
 * Fonts are self-hosted so they work identically in the pdfme Designer (frontend,
 * lazily fetched by URL) and in server-side PDF generation (read from disk).
 */

import { mkdir, writeFile, readFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'fonts')

/**
 * Curated invitation fonts.
 *  - name:     display name shown in the pdfme font dropdown + the pdfme font key
 *  - id:       google/fonts repo folder id
 *  - category: grouping used by the UI
 *  - fallback: marks the single pdfme fallback font (used for text w/o a fontName)
 */
const FONTS = [
  // ── Calligraphy / Script (wedding) ───────────────────────────────────────
  { name: 'Great Vibes', id: 'greatvibes', category: 'Script' },
  { name: 'Dancing Script', id: 'dancingscript', category: 'Script' },
  { name: 'Parisienne', id: 'parisienne', category: 'Script' },
  { name: 'Sacramento', id: 'sacramento', category: 'Script' },
  { name: 'Allura', id: 'allura', category: 'Script' },
  { name: 'Alex Brush', id: 'alexbrush', category: 'Script' },
  { name: 'Tangerine', id: 'tangerine', category: 'Script' },
  { name: 'Pinyon Script', id: 'pinyonscript', category: 'Script' },
  { name: 'Mr De Haviland', id: 'mrdehaviland', category: 'Script' },
  { name: 'Petit Formal Script', id: 'petitformalscript', category: 'Script' },
  { name: 'Pacifico', id: 'pacifico', category: 'Script' },
  { name: 'Satisfy', id: 'satisfy', category: 'Script' },
  { name: 'Cookie', id: 'cookie', category: 'Script' },
  { name: 'Yellowtail', id: 'yellowtail', category: 'Script' },
  { name: 'Kaushan Script', id: 'kaushanscript', category: 'Script' },
  { name: 'Marck Script', id: 'marckscript', category: 'Script' },
  { name: 'Herr Von Muellerhoff', id: 'herrvonmuellerhoff', category: 'Script' },
  { name: 'Rouge Script', id: 'rougescript', category: 'Script' },
  { name: 'Italianno', id: 'italianno', category: 'Script' },
  { name: 'Niconne', id: 'niconne', category: 'Script' },
  { name: 'Lobster', id: 'lobster', category: 'Script' },
  { name: 'Courgette', id: 'courgette', category: 'Script' },
  { name: 'Damion', id: 'damion', category: 'Script' },
  { name: 'Qwigley', id: 'qwigley', category: 'Script' },
  { name: 'Norican', id: 'norican', category: 'Script' },
  { name: 'Engagement', id: 'engagement', category: 'Script' },
  { name: 'Clicker Script', id: 'clickerscript', category: 'Script' },
  { name: 'Birthstone', id: 'birthstone', category: 'Script' },
  { name: 'Bilbo Swash Caps', id: 'bilboswashcaps', category: 'Script' },
  { name: 'Mr Dafoe', id: 'mrdafoe', category: 'Script' },

  // ── Elegant Serif (formal) ───────────────────────────────────────────────
  { name: 'Playfair Display', id: 'playfairdisplay', category: 'Serif' },
  { name: 'Cormorant Garamond', id: 'cormorantgaramond', category: 'Serif' },
  { name: 'EB Garamond', id: 'ebgaramond', category: 'Serif' },
  { name: 'Cinzel', id: 'cinzel', category: 'Serif' },
  { name: 'Cinzel Decorative', id: 'cinzeldecorative', category: 'Serif' },
  { name: 'Libre Baskerville', id: 'librebaskerville', category: 'Serif' },
  { name: 'Cardo', id: 'cardo', category: 'Serif' },
  { name: 'Lora', id: 'lora', category: 'Serif' },
  { name: 'Marcellus', id: 'marcellus', category: 'Serif' },
  { name: 'Marcellus SC', id: 'marcellussc', category: 'Serif' },
  { name: 'Prata', id: 'prata', category: 'Serif' },
  { name: 'Bodoni Moda', id: 'bodonimoda', category: 'Serif' },
  { name: 'Tenor Sans', id: 'tenorsans', category: 'Serif' },
  { name: 'Spectral', id: 'spectral', category: 'Serif' },
  { name: 'Italiana', id: 'italiana', category: 'Serif' },
  { name: 'Gilda Display', id: 'gildadisplay', category: 'Serif' },
  { name: 'Bellefair', id: 'bellefair', category: 'Serif' },
  { name: 'Forum', id: 'forum', category: 'Serif' },
  { name: 'Cormorant', id: 'cormorant', category: 'Serif' },
  { name: 'Della Respira', id: 'dellarespira', category: 'Serif' },
  { name: 'Yeseva One', id: 'yesevaone', category: 'Serif' },
  { name: 'Abril Fatface', id: 'abrilfatface', category: 'Serif' },
  { name: 'Fraunces', id: 'fraunces', category: 'Serif' },
  { name: 'Crimson Text', id: 'crimsontext', category: 'Serif' },

  // ── Modern Sans (contemporary events) ────────────────────────────────────
  { name: 'Montserrat', id: 'montserrat', category: 'Sans' },
  { name: 'Josefin Sans', id: 'josefinsans', category: 'Sans' },
  { name: 'Raleway', id: 'raleway', category: 'Sans' },
  { name: 'Poppins', id: 'poppins', category: 'Sans' },
  { name: 'Quicksand', id: 'quicksand', category: 'Sans' },
  { name: 'Jost', id: 'jost', category: 'Sans' },
  { name: 'Questrial', id: 'questrial', category: 'Sans' },
  { name: 'Work Sans', id: 'worksans', category: 'Sans' },
  { name: 'Nunito', id: 'nunito', category: 'Sans' },
  { name: 'Archivo', id: 'archivo', category: 'Sans' },
  // Neutral body font, also the pdfme fallback (used for text without a fontName).
  { name: 'Roboto', id: 'roboto', category: 'Sans', fallback: true },
]

const fileNameFor = (name) => `${name.replace(/\s+/g, '')}.ttf`

const RAW = 'https://raw.githubusercontent.com/google/fonts/main'

async function fetchTree() {
  const url = 'https://api.github.com/repos/google/fonts/git/trees/main?recursive=1'
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'event-inviter-font-fetch',
      'Accept': 'application/vnd.github+json',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  })
  if (!res.ok) throw new Error(`GitHub tree fetch failed: ${res.status} ${res.statusText}`)
  const json = await res.json()
  if (json.truncated) console.warn('⚠️  GitHub tree was truncated — some fonts may be missing.')
  return json.tree.map((n) => n.path)
}

/** Pick the best static-Regular TTF for a font id from the repo tree paths. */
function resolveTtfPath(paths, id) {
  const inDir = paths.filter(
    (p) => /^(ofl|apache|ucu)\//.test(p) && p.includes(`/${id}/`) && p.endsWith('.ttf')
  )
  const base = (p) => p.split('/').pop()
  const isItalic = (p) => /italic/i.test(base(p))
  const isVariable = (p) => /\[.*\]\.ttf$/.test(base(p))

  return (
    // top-level static Regular (e.g. ofl/greatvibes/GreatVibes-Regular.ttf)
    inDir.find(
      (p) => /-Regular\.ttf$/.test(base(p)) && !isVariable(p) && !p.includes('/static/')
    ) ||
    // static/ Regular instance (variable fonts ship these)
    inDir.find((p) => /-Regular\.ttf$/.test(base(p)) && !isVariable(p)) ||
    // any non-italic static
    inDir.find((p) => !isVariable(p) && !isItalic(p)) ||
    // upright variable file
    inDir.find((p) => isVariable(p) && !isItalic(p)) ||
    inDir[0]
  )
}

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  console.log('Fetching google/fonts file tree…')
  const paths = await fetchTree()

  const manifest = []
  const failures = []

  for (const font of FONTS) {
    const fileName = fileNameFor(font.name)
    const dest = join(OUT_DIR, fileName)

    if (await exists(dest)) {
      manifest.push({
        name: font.name,
        file: fileName,
        category: font.category,
        fallback: !!font.fallback,
      })
      console.log(`✓ ${font.name} (cached)`)
      continue
    }

    const ttfPath = resolveTtfPath(paths, font.id)
    if (!ttfPath) {
      failures.push(`${font.name} (${font.id}): no TTF found in tree`)
      console.warn(`✗ ${font.name}: not found`)
      continue
    }

    try {
      const res = await fetch(`${RAW}/${ttfPath}`)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const buf = Buffer.from(await res.arrayBuffer())
      await writeFile(dest, buf)
      manifest.push({
        name: font.name,
        file: fileName,
        category: font.category,
        fallback: !!font.fallback,
      })
      console.log(`✓ ${font.name}  (${(buf.length / 1024).toFixed(0)} KB)  ${ttfPath}`)
    } catch (err) {
      failures.push(`${font.name} (${font.id}): ${err.message}`)
      console.warn(`✗ ${font.name}: ${err.message}`)
    }
  }

  // Guarantee exactly one fallback exists in the manifest.
  if (!manifest.some((m) => m.fallback) && manifest.length) {
    manifest[manifest.length - 1].fallback = true
  }

  await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

  console.log(`\nDownloaded ${manifest.length}/${FONTS.length} fonts → ${OUT_DIR}`)
  if (failures.length) {
    console.log(`\n${failures.length} failed:`)
    for (const f of failures) console.log(`  - ${f}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
