<script setup lang="ts">
/*
 * Reusable pdfme card editor: a sticky toolbar (paper-size controls, "Replace PDF",
 * Save) over a full-height editor canvas. Used by the per-event card designer and
 * the admin system-template designer. Page-specific toolbar items go in the
 * `toolbar-start` (left) and `toolbar-extra` (right, before Save) slots.
 */
import { Designer } from '@pdfme/ui'
import { theme as antdTheme } from 'antd'
import { toast } from 'vue-sonner'
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
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import type { Template } from '@pdfme/common'
import { UiButton } from '~/components/ui'
import { useTheme } from '~/composables/use_theme'
import { SIZE_PRESETS, SIZE_DIMENSIONS, DEFAULT_SIZE_PRESET } from '~/constants/card_sizes'

const props = withDefaults(
  defineProps<{
    // `initialTemplate` arrives as a plain JSON object; cast to pdfme's Template.
    initialTemplate: Record<string, any>
    saving?: boolean
    // Field names that must survive in-designer edits (rename/delete are undone).
    reservedFields?: string[]
    // Base filename for the "Download" export (the .json is added automatically).
    downloadName?: string
    // When set, in-designer edits are debounce-saved (schema only) to this URL.
    // Leave undefined to disable auto-save (e.g. an unsaved new template).
    autosaveUrl?: string
  }>(),
  {
    saving: false,
    reservedFields: () => ['guestName'],
    downloadName: 'template',
    autosaveUrl: undefined,
  }
)

const emit = defineEmits<{ save: [template: Template] }>()

const container = ref<HTMLDivElement | null>(null)
let designer: Designer | null = null

const { isDark, accent, sync } = useTheme()

const plain = (t: any): any => JSON.parse(JSON.stringify(t))

/**
 * pdfme doesn't tolerate `null` schema properties that a freshly added, untouched
 * field serializes with: a null `content` fails init validation ("expected string,
 * received null"), and a null colour (`fontColor`, `backgroundColor`, …) crashes
 * the property panel on selection (`getAlphaFromHex` slices null). Coerce `content`
 * to an empty string and drop every other null key so pdfme falls back to its
 * defaults. Returns a clean plain copy, so it doubles as the proxy-safe deep clone
 * we hand the Designer. Applied on load and before every save.
 */
function sanitizeTemplate(t: any): any {
  const out = plain(t)
  if (Array.isArray(out.schemas)) {
    for (const page of out.schemas) {
      if (!Array.isArray(page)) continue
      for (const schema of page) {
        if (!schema || typeof schema !== 'object') continue
        for (const key of Object.keys(schema)) {
          if (schema[key] !== null) continue
          if (key === 'content') schema[key] = ''
          else delete schema[key]
        }
      }
    }
  }
  return out
}

// --- Auto-save (schema only) -------------------------------------------------
// When `autosaveUrl` is set, in-designer edits are debounced into a quiet
// background PUT of the current template. The endpoints persist the schema only
// (no preview re-render, no flash) and return 204, so this never disturbs the
// page. The manual "Save design" button still drives the authoritative save.
const AUTOSAVE_DEBOUNCE_MS = 1200
let autosaveTimer: ReturnType<typeof setTimeout> | null = null
const autosaveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
// How long the "Saved" confirmation lingers before it fades back to idle.
const SAVED_LINGER_MS = 2500
let savedHideTimer: ReturnType<typeof setTimeout> | null = null

// Echo the CSRF token the same way Inertia's axios does: read the (URL-encoded)
// XSRF-TOKEN cookie and send it back in the X-XSRF-TOKEN header.
function readXsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

async function runAutosave() {
  if (!props.autosaveUrl || !designer) return
  const template = getTemplate()
  if (!template) return
  if (savedHideTimer) {
    clearTimeout(savedHideTimer)
    savedHideTimer = null
  }
  autosaveStatus.value = 'saving'
  try {
    const res = await fetch(props.autosaveUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': readXsrfToken() },
      credentials: 'same-origin',
      body: JSON.stringify({ template }),
    })
    if (!res.ok) {
      autosaveStatus.value = 'error'
      return
    }
    // Show "Saved" briefly, then quietly clear it.
    autosaveStatus.value = 'saved'
    savedHideTimer = setTimeout(() => {
      if (autosaveStatus.value === 'saved') autosaveStatus.value = 'idle'
      savedHideTimer = null
    }, SAVED_LINGER_MS)
  } catch {
    autosaveStatus.value = 'error'
  }
}

function scheduleAutosave() {
  if (!props.autosaveUrl) return
  if (autosaveTimer) clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(() => {
    autosaveTimer = null
    void runAutosave()
  }, AUTOSAVE_DEBOUNCE_MS)
}

/**
 * pdfme renders its UI with Ant Design, so we hand the Designer an antd token
 * set: dark mode follows the app's `data-theme` and the primary colour is pulled
 * from the live `--accent-500` token so the editor chrome matches the current
 * theme + accent. Re-applied via `updateOptions` whenever either changes.
 *
 * pdfme deep-clones its options with `structuredClone`, which throws on
 * functions — so we can't pass antd's `algorithm`. Instead we pre-compute the
 * dark token set with `getDesignToken()` (plain colour values) and pass that as
 * token overrides; light mode just seeds the primary and uses pdfme's default.
 */
function pdfmeTheme() {
  const colorPrimary = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-500')
    .trim()
  const token = colorPrimary ? { colorPrimary } : {}
  if (isDark.value) {
    return { token: antdTheme.getDesignToken({ algorithm: antdTheme.darkAlgorithm, token }) }
  }
  return { token }
}

/**
 * Keep the reserved fields intact after an in-designer edit. Mutates `next` and
 * reports what it had to undo so the user can be told why their change snapped back.
 */
function lockReserved(next: any, prev: any) {
  const reserved = props.reservedFields
  const namesOf = (t: any): string[] => t.schemas.flat().map((s: any) => s.name)
  const lost = reserved.filter((n) => namesOf(prev).includes(n) && !namesOf(next).includes(n))
  if (lost.length === 0) {
    return { changed: false, renamed: [] as string[], restored: [] as string[] }
  }

  // Rename: the page keeps its length, so positions line up — restore the name
  // wherever a reserved field's name was changed in place.
  const renamed: string[] = []
  next.schemas.forEach((page: any[], pi: number) => {
    const prevPage: any[] = prev.schemas[pi] ?? []
    if (page.length !== prevPage.length) return
    page.forEach((schema, si) => {
      const was = prevPage[si]
      if (was && reserved.includes(was.name) && schema.name !== was.name) {
        schema.name = was.name
        renamed.push(was.name)
      }
    })
  })

  // Deletion: anything still missing was removed — add it back from the snapshot.
  const present = new Set(namesOf(next))
  const restored: string[] = []
  for (const name of lost) {
    if (present.has(name)) continue
    const original = prev.schemas.flat().find((s: any) => s.name === name)
    if (original) {
      if (!next.schemas[0]) next.schemas[0] = []
      next.schemas[0].push(plain(original))
      restored.push(name)
    }
  }

  return { changed: renamed.length > 0 || restored.length > 0, renamed, restored }
}

// --- Base PDF: paper size & "replace with a PDF" -----------------------------
// pdfme's basePdf is either a blank-page spec `{ width, height, padding }` (mm) or a
// base64 PDF data URI. Size controls drive the former; "Replace PDF" sets the latter.
// The size list lives in `~/constants/card_sizes` — edit it there to add/remove sizes.
const PRESETS = SIZE_DIMENSIONS
const [defW, defH] = PRESETS[DEFAULT_SIZE_PRESET]
const preset = ref(DEFAULT_SIZE_PRESET)
const pdfWidth = ref<number | string>(defW)
const pdfHeight = ref<number | string>(defH)

function matchPreset(w: number, h: number): string {
  for (const [key, [pw, ph]] of Object.entries(PRESETS)) {
    if (Math.abs(pw - w) < 0.5 && Math.abs(ph - h) < 0.5) return key
  }
  return 'custom'
}

// A card is full-bleed, not a document — no printable margin.
const NO_MARGIN: [number, number, number, number] = [0, 0, 0, 0]

// Swap the base while preserving the designed fields.
function setBasePdf(basePdf: any) {
  if (!designer) return
  designer.updateTemplate({ ...designer.getTemplate(), basePdf })
}

function applySize() {
  const w = Number(pdfWidth.value)
  const h = Number(pdfHeight.value)
  if (!w || !h || w <= 0 || h <= 0) return
  setBasePdf({ width: w, height: h, padding: NO_MARGIN })
}

watch(preset, (value) => {
  const dims = PRESETS[value]
  if (!dims) return
  pdfWidth.value = dims[0]
  pdfHeight.value = dims[1]
  applySize()
})

function onSizeInput() {
  applySize()
  preset.value = matchPreset(Number(pdfWidth.value), Number(pdfHeight.value))
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// PDF page boxes are measured in points; basePdf sizes are in mm.
const PT_TO_MM = 25.4 / 72

// First-page size of a PDF, in mm — or null if it can't be read. Uses pdf-lib
// (no worker, unlike pdfjs) and accounts for page rotation.
async function pdfSizeMm(
  data: ArrayBuffer | Uint8Array
): Promise<{ width: number; height: number } | null> {
  try {
    const { PDFDocument } = await import('@pdfme/pdf-lib')
    const doc = await PDFDocument.load(data)
    const page = doc.getPage(0)
    if (!page) return null
    const { width, height } = page.getSize()
    const rotated = (page.getRotation().angle / 90) % 2 !== 0
    const w = rotated ? height : width
    const h = rotated ? width : height
    const round = (n: number) => Math.round(n * PT_TO_MM * 10) / 10
    return { width: round(w), height: round(h) }
  } catch {
    return null
  }
}

// A PDF base is a fixed bitmap, not a blank page we resize — mirror its real
// dimensions in the controls as a "custom" size (don't call applySize, which
// would replace the PDF with a blank page).
async function reflectPdfSize(data: ArrayBuffer | Uint8Array) {
  const size = await pdfSizeMm(data)
  if (!size) return
  pdfWidth.value = size.width
  pdfHeight.value = size.height
  preset.value = 'custom'
}

async function onReplacePdf(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    setBasePdf(await readAsDataUrl(file))
    await reflectPdfSize(await file.arrayBuffer())
    toast.success('Base PDF replaced.')
  } catch {
    toast.error('Could not read that PDF.')
  } finally {
    input.value = ''
  }
}

// Point the size controls at a template's page size.
function syncSizeFromTemplate(tpl: any) {
  const base = tpl.basePdf
  if (base && typeof base === 'object' && base.width && base.height) {
    pdfWidth.value = base.width
    pdfHeight.value = base.height
    preset.value = matchPreset(base.width, base.height)
  }
}

type FontData = { data: string | ArrayBuffer; fallback?: boolean }

/**
 * pdfme will only accept a font-data URL if it points at a public host — its
 * @pdfme/schemas SSRF guard rejects `localhost` and private IPs (so font URLs
 * break on a dev server). Mirror that rule for our own origin: when it's public
 * we hand pdfme the URL and let it fetch each font lazily; otherwise we fetch the
 * bytes ourselves (a same-origin browser fetch is fine — only pdfme's guard objects).
 */
function isPublicHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h === '0.0.0.0' || h === '::1' || h === '[::1]') return false
  if (/^127\./.test(h)) return false
  if (/^10\./.test(h)) return false
  if (/^169\.254\./.test(h)) return false
  if (/^192\.168\./.test(h)) return false
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false
  return true
}

/**
 * Build the pdfme font map from the self-hosted invitation fonts in
 * `public/fonts/manifest.json`. On a public host each font's `data` is its URL,
 * which pdfme fetches lazily (only when used) so listing 50+ fonts doesn't bloat
 * the page; on localhost/private hosts the bytes are fetched up front instead.
 * Returns `undefined` on failure so the Designer falls back to pdfme's built-in font.
 */
async function buildFonts(): Promise<Record<string, FontData> | undefined> {
  try {
    const res = await fetch('/fonts/manifest.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const entries = (await res.json()) as Array<{ file: string; name: string; fallback?: boolean }>
    const font: Record<string, FontData> = {}

    if (isPublicHost(window.location.hostname)) {
      for (const e of entries) {
        font[e.name] = { data: `${window.location.origin}/fonts/${e.file}`, fallback: !!e.fallback }
      }
    } else {
      await Promise.all(
        entries.map(async (e) => {
          const r = await fetch(`/fonts/${e.file}`)
          if (r.ok) font[e.name] = { data: await r.arrayBuffer(), fallback: !!e.fallback }
        })
      )
    }
    return Object.keys(font).length ? font : undefined
  } catch {
    return undefined
  }
}

onMounted(async () => {
  // `props.initialTemplate` is a Vue reactive proxy (Inertia props are reactive). pdfme's
  // Designer deep-clones it with `structuredClone`, which throws on proxies, so hand
  // it a plain JSON copy — the template is pure JSON data, so this is lossless.
  // sanitizeTemplate also repairs any null content a prior save may have stored.
  const template = sanitizeTemplate(props.initialTemplate) as Template
  const font = await buildFonts()
  // Align the theme ref with the <html data-theme> the boot script set pre-paint.
  sync()
  designer = new Designer({
    domContainer: container.value!,
    template,
    options: { ...(font ? { font } : {}), theme: pdfmeTheme() },
    plugins: {
      'Text': text,
      'Multi Variable Text': multiVariableText,
      'Image': image,
      'QR code': barcodes.qrcode,
      'Table': table,
      'List': list,
      'Line': line,
      'Rectangle': rectangle,
      'Ellipse': ellipse,
      'SVG': svg,
      'Circle Mark': circleMark,
      'Signature': signature,
    },
  })

  // Reflect the loaded template's page size in the controls (leaves a PDF base as-is)
  // and drop any leftover document margin so the card is full-bleed.
  const base = designer.getTemplate().basePdf as any
  if (base && typeof base === 'object' && base.width && base.height) {
    pdfWidth.value = base.width
    pdfHeight.value = base.height
    preset.value = matchPreset(base.width, base.height)
    if (!Array.isArray(base.padding) || base.padding.some((n: number) => n !== 0)) {
      setBasePdf({ width: base.width, height: base.height, padding: NO_MARGIN })
    }
  } else if (typeof base === 'string' && base.startsWith('data:')) {
    // A PDF base has no blank-page size — read it off the PDF itself.
    const res = await fetch(base)
    reflectPdfSize(await res.arrayBuffer())
  }

  let snapshot = plain(designer.getTemplate())
  let locking = false
  designer.onChangeTemplate((next) => {
    if (locking) return
    const candidate = plain(next)
    const { changed, renamed, restored } = lockReserved(candidate, snapshot)
    if (changed) {
      locking = true
      designer!.updateTemplate(candidate)
      locking = false
      const uniq = (a: string[]) => [...new Set(a)].join(', ')
      if (renamed.length) toast.info(`System field can't be renamed: ${uniq(renamed)}`)
      if (restored.length) toast.info(`System field restored: ${uniq(restored)}`)
    }
    snapshot = plain(candidate)
    scheduleAutosave()
  })
})

// Re-theme the live editor when the app's dark mode or accent changes.
watch([isDark, accent], () => {
  designer?.updateOptions({ theme: pdfmeTheme() })
})

onBeforeUnmount(() => {
  // Flush a pending edit before tearing down so the last change isn't lost.
  // The fetch outlives this component (the SPA document stays alive across
  // Inertia navigation), so it completes even though we destroy the designer.
  if (autosaveTimer) {
    clearTimeout(autosaveTimer)
    autosaveTimer = null
    void runAutosave()
  }
  if (savedHideTimer) {
    clearTimeout(savedHideTimer)
    savedHideTimer = null
  }
  designer?.destroy()
  designer = null
})

/** Replace the whole design (e.g. when the user picks a starter template). */
function applyTemplate(tpl: Record<string, any>) {
  if (!designer) return
  const next = plain(tpl)
  designer.updateTemplate(next)
  syncSizeFromTemplate(next)
}

function getTemplate(): Template | null {
  return designer ? (sanitizeTemplate(designer.getTemplate()) as Template) : null
}

function save() {
  const template = getTemplate()
  if (template) emit('save', template)
}

/**
 * Export the whole design to a JSON file the admin can re-import later. The
 * pdfme template carries its `basePdf` inline — a blank-page spec or, for an
 * uploaded PDF, a base64 data URI — so the single file is fully self-contained.
 */
function download() {
  const template = getTemplate()
  if (!template) return
  const payload = {
    format: 'event-inviter-template',
    version: 1,
    name: props.downloadName,
    template,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const slug =
    props.downloadName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'template'
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

defineExpose({ applyTemplate, getTemplate })
</script>

<template>
  <!-- The host page runs full-bleed (no global header), so this fills the whole
       viewport: a sticky toolbar on top, the editor filling the rest. -->
  <div class="flex flex-1 flex-col">
    <div
      class="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line bg-surface px-7 py-3"
    >
      <div class="flex min-w-0 items-center gap-2">
        <slot name="toolbar-start" />
      </div>

      <div class="flex items-center gap-2">
        <slot name="toolbar-extra" />

        <!-- Quiet auto-save status (schema only); the manual save is authoritative.
             "Saved" clears itself after a few seconds. -->
        <span
          v-if="autosaveUrl && autosaveStatus !== 'idle'"
          class="flex items-center gap-1.5 px-1 text-xs font-medium"
          :class="autosaveStatus === 'error' ? 'text-red-500' : 'text-ink-2'"
        >
          <i
            class="text-[10px]"
            :class="{
              'pi pi-spin pi-spinner': autosaveStatus === 'saving',
              'pi pi-check': autosaveStatus === 'saved',
              'pi pi-exclamation-circle': autosaveStatus === 'error',
            }"
          />
          {{
            autosaveStatus === 'saving'
              ? 'Saving…'
              : autosaveStatus === 'saved'
                ? 'Saved'
                : 'Save failed'
          }}
        </span>

        <!-- Paper-size preset -->
        <div class="relative">
          <select
            v-model="preset"
            class="h-9 cursor-pointer appearance-none rounded-[9px] border border-line bg-surface pl-3 pr-8 text-[13px] font-medium text-ink outline-none transition-colors focus:border-accent-500"
          >
            <option v-for="size in SIZE_PRESETS" :key="size.key" :value="size.key">
              {{ size.label }}
            </option>
          </select>
          <i
            class="pi pi-chevron-down pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-2"
          />
        </div>

        <!-- Custom width × height (mm) -->
        <div
          class="flex h-9 items-center gap-1.5 rounded-[9px] border border-line bg-surface px-3 text-[13px] text-ink-2 transition-colors focus-within:border-accent-500"
        >
          <input
            v-model="pdfWidth"
            type="number"
            min="1"
            aria-label="Width (mm)"
            class="w-10 bg-transparent text-center font-medium text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            @change="onSizeInput"
          />
          <span class="text-ink-2">×</span>
          <input
            v-model="pdfHeight"
            type="number"
            min="1"
            aria-label="Height (mm)"
            class="w-10 bg-transparent text-center font-medium text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            @change="onSizeInput"
          />
          <span>mm</span>
        </div>

        <!-- Replace the base with an uploaded PDF -->
        <label
          class="inline-flex h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded-[9px] border border-line bg-surface px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface-2"
        >
          <i class="pi pi-file-pdf text-ink-2" /> Replace PDF
          <input type="file" accept="application/pdf,.pdf" class="hidden" @change="onReplacePdf" />
        </label>

        <UiButton
          class="h-9"
          variant="secondary"
          icon="pi-download"
          title="Download template (.json)"
          aria-label="Download template"
          @click="download"
        />

        <UiButton class="h-9" :loading="saving" icon="pi-save" @click="save">Save design</UiButton>
      </div>
    </div>

    <div ref="container" class="min-h-0 flex-1 overflow-hidden" />
  </div>
</template>
