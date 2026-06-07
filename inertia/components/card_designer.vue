<script setup lang="ts">
/*
 * Reusable pdfme card editor: a sticky toolbar (paper-size controls, "Replace PDF",
 * Save) over a full-height editor canvas. Used by the per-event card designer and
 * the admin system-template designer. Page-specific toolbar items go in the
 * `toolbar-start` (left) and `toolbar-extra` (right, before Save) slots.
 */
import { Designer } from '@pdfme/ui'
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
import { SIZE_PRESETS, SIZE_DIMENSIONS, DEFAULT_SIZE_PRESET } from '~/constants/card_sizes'

const props = withDefaults(
  defineProps<{
    // `initialTemplate` arrives as a plain JSON object; cast to pdfme's Template.
    initialTemplate: Record<string, any>
    saving?: boolean
    // Field names that must survive in-designer edits (rename/delete are undone).
    reservedFields?: string[]
  }>(),
  { saving: false, reservedFields: () => ['guestName'] }
)

const emit = defineEmits<{ save: [template: Template] }>()

const container = ref<HTMLDivElement | null>(null)
let designer: Designer | null = null

const plain = (t: any): any => JSON.parse(JSON.stringify(t))

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

async function onReplacePdf(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    setBasePdf(await readAsDataUrl(file))
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
  const template = plain(props.initialTemplate) as Template
  const font = await buildFonts()
  designer = new Designer({
    domContainer: container.value!,
    template,
    options: font ? { font } : {},
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
  })
})

onBeforeUnmount(() => {
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
  return designer ? (designer.getTemplate() as Template) : null
}

function save() {
  const template = getTemplate()
  if (template) emit('save', template)
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

        <UiButton class="h-9" :loading="saving" icon="pi-check" @click="save">Save design</UiButton>
      </div>
    </div>

    <div ref="container" class="min-h-0 flex-1 overflow-hidden" />
  </div>
</template>
