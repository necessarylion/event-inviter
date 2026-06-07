<script setup lang="ts">
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
import { Head, router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import type { Template } from '@pdfme/common'
import { UiButton } from '~/components/ui'
import CardTemplateThumb from '~/components/card_template_thumb.vue'
import { CARD_TEMPLATES, type CardTemplatePreset } from '~/lib/card_templates'

// `template` arrives as a plain JSON object (Inertia prop); cast to pdfme's Template.
const props = defineProps<{ event: { id: number; title: string }; template: Record<string, any> }>()

// `guestName` is the only field whose value differs per guest, so its *name* (the
// data-binding key the renderer fills in — see CardController.fieldsFor) is locked in
// the designer so a rename or delete can't silently break the merge. eventTitle /
// eventDate are per-event constants the organizer can rename, restyle, or remove
// freely. The QR field binds by *type* and is enforced on save, so it needs no lock.
const RESERVED = ['guestName']

const container = ref<HTMLDivElement | null>(null)
const saving = ref(false)
let designer: Designer | null = null

const plain = (t: any): any => JSON.parse(JSON.stringify(t))

/**
 * Keep the reserved fields intact after an in-designer edit. Mutates `next` and
 * reports what it had to undo so the user can be told why their change snapped back.
 */
function lockReserved(next: any, prev: any) {
  const namesOf = (t: any): string[] => t.schemas.flat().map((s: any) => s.name)
  const lost = RESERVED.filter((n) => namesOf(prev).includes(n) && !namesOf(next).includes(n))
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
      if (was && RESERVED.includes(was.name) && schema.name !== was.name) {
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
const PRESETS: Record<string, [number, number]> = {
  a4: [210, 297],
  a5: [148, 210],
  a6: [105, 148],
  letter: [215.9, 279.4],
}
const preset = ref('a6')
const pdfWidth = ref<number | string>(105)
const pdfHeight = ref<number | string>(148)

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

// --- Pre-defined templates ---------------------------------------------------
const templates = CARD_TEMPLATES
const drawerOpen = ref(false)

// Point the size controls at a template's page size.
function syncSizeFromTemplate(tpl: any) {
  const base = tpl.basePdf
  if (base && typeof base === 'object' && base.width && base.height) {
    pdfWidth.value = base.width
    pdfHeight.value = base.height
    preset.value = matchPreset(base.width, base.height)
  }
}

function applyTemplate(choice: CardTemplatePreset) {
  if (!designer) return
  const ok = window.confirm(
    `Replace the current design with the "${choice.name}" template? Unsaved changes will be lost.`
  )
  if (!ok) return
  const tpl = plain(choice.template)
  designer.updateTemplate(tpl)
  syncSizeFromTemplate(tpl)
  drawerOpen.value = false
  toast.success(`Applied the "${choice.name}" template.`)
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
  // `props.template` is a Vue reactive proxy (Inertia props are reactive). pdfme's
  // Designer deep-clones it with `structuredClone`, which throws on proxies, so hand
  // it a plain JSON copy — the template is pure JSON data, so this is lossless.
  const template = plain(props.template) as Template
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

function save() {
  if (!designer) return
  saving.value = true
  router.put(
    `/events/${props.event.id}/card`,
    { template: JSON.stringify(designer.getTemplate()) },
    { preserveScroll: true, preserveState: true, onFinish: () => (saving.value = false) }
  )
}
</script>

<template>
  <Head title="Card designer" />

  <!-- The layout runs this page full-bleed (no global header), so it fills the
       whole viewport: a sticky toolbar on top, the editor filling the rest. -->
  <div class="flex flex-1 flex-col">
    <div
      class="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line bg-surface px-7 py-3"
    >
      <Link
        :href="`/events/${event.id}`"
        class="inline-flex items-center gap-2 text-sm font-medium text-ink-2 no-underline transition-colors hover:text-ink"
      >
        <i class="pi pi-arrow-left" /> Back to event
      </Link>

      <div class="flex items-center gap-2">
        <!-- Pre-defined templates -->
        <button
          type="button"
          class="inline-flex h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded-[9px] border border-line bg-surface px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface-2"
          @click="drawerOpen = true"
        >
          <i class="pi pi-clone text-ink-2" /> Templates
        </button>

        <span class="mx-1 h-5 w-px bg-line" />

        <!-- Paper-size preset -->
        <div class="relative">
          <select
            v-model="preset"
            class="h-9 cursor-pointer appearance-none rounded-[9px] border border-line bg-surface pl-3 pr-8 text-[13px] font-medium text-ink outline-none transition-colors focus:border-accent-500"
          >
            <option value="a6">A6</option>
            <option value="a5">A5</option>
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
            <option value="custom">Custom</option>
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

  <!-- Template picker: right slide-over drawer -->
  <Transition name="drawer">
    <div v-if="drawerOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/30" @click="drawerOpen = false" />
      <aside
        class="absolute inset-y-0 right-0 flex w-[360px] max-w-[90vw] flex-col border-l border-line bg-surface shadow-2xl"
      >
        <div class="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <h2 class="text-sm font-semibold text-ink">Templates</h2>
            <p class="text-xs text-ink-2">Pick a starter design for this card.</p>
          </div>
          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label="Close"
            @click="drawerOpen = false"
          >
            <i class="pi pi-times" />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4 overflow-y-auto p-4">
          <button
            v-for="t in templates"
            :key="t.id"
            type="button"
            class="group flex flex-col items-center gap-2"
            @click="applyTemplate(t)"
          >
            <div
              class="overflow-hidden rounded-md ring-1 ring-line transition group-hover:ring-2 group-hover:ring-accent-500"
            >
              <CardTemplateThumb :template="t.template" :width="150" />
            </div>
            <span class="text-xs font-medium text-ink-2 group-hover:text-ink">{{ t.name }}</span>
          </button>
        </div>
      </aside>
    </div>
  </Transition>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-active aside,
.drawer-leave-active aside {
  transition: transform 0.25s ease;
}
.drawer-enter-from aside,
.drawer-leave-to aside {
  transform: translateX(100%);
}
</style>
