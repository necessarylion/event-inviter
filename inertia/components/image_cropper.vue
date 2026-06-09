<script setup lang="ts">
/*
 * Lightweight dependency-free image cropper. Shows the picked image inside a
 * fixed-aspect viewport (4:3 by default) that the user can pan (drag) and zoom
 * (slider). On apply it renders the visible region to a canvas and emits a
 * cropped JPEG File, so uploads always match the target aspect ratio.
 */
import { computed, nextTick, ref, watch } from 'vue'
import { UiButton, UiModal } from '~/components/ui'

const props = withDefaults(
  defineProps<{
    /** Object URL of the source image to crop. */
    src: string | null
    /** Output filename for the cropped file. */
    fileName?: string
    /** Width / height ratio of the crop (defaults to 4:3). */
    aspect?: number
    /** Longest output edge in pixels (the result never upscales past this). */
    maxWidth?: number
  }>(),
  { fileName: 'thumbnail.jpg', aspect: 4 / 3, maxWidth: 1200 }
)

const emit = defineEmits<{ crop: [file: File] }>()
const open = defineModel<boolean>({ default: false })

const viewport = ref<HTMLElement | null>(null)
const imgEl = ref<HTMLImageElement | null>(null)

// Natural image size and viewport pixel size, captured on load.
const natW = ref(0)
const natH = ref(0)
const vpW = ref(0)
const vpH = ref(0)

const zoom = ref(1)
// Top-left offset (px, in viewport coordinates) of the scaled image.
const tx = ref(0)
const ty = ref(0)

// Scale that makes the image exactly cover the viewport, then user zoom on top.
const baseScale = computed(() => {
  if (!natW.value || !vpW.value) return 1
  return Math.max(vpW.value / natW.value, vpH.value / natH.value)
})
const scale = computed(() => baseScale.value * zoom.value)
const imgW = computed(() => natW.value * scale.value)
const imgH = computed(() => natH.value * scale.value)

const imageStyle = computed(() => ({
  width: `${imgW.value}px`,
  height: `${imgH.value}px`,
  transform: `translate(${tx.value}px, ${ty.value}px)`,
}))

const ready = computed(() => natW.value > 0 && vpW.value > 0)

function clamp() {
  // Keep the image covering the viewport (no empty gaps).
  tx.value = Math.min(0, Math.max(vpW.value - imgW.value, tx.value))
  ty.value = Math.min(0, Math.max(vpH.value - imgH.value, ty.value))
}

function measureViewport() {
  const el = viewport.value
  if (!el) return
  vpW.value = el.clientWidth
  vpH.value = el.clientWidth / props.aspect
}

function onImageLoad() {
  const el = imgEl.value
  if (!el) return
  natW.value = el.naturalWidth
  natH.value = el.naturalHeight
  measureViewport()
  zoom.value = 1
  // Center the image in the viewport.
  tx.value = (vpW.value - imgW.value) / 2
  ty.value = (vpH.value - imgH.value) / 2
  clamp()
}

// --- panning ---------------------------------------------------------------
let dragging = false
let startX = 0
let startY = 0
let startTx = 0
let startTy = 0

function onPointerDown(e: PointerEvent) {
  if (!ready.value) return
  dragging = true
  startX = e.clientX
  startY = e.clientY
  startTx = tx.value
  startTy = ty.value
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging) return
  tx.value = startTx + (e.clientX - startX)
  ty.value = startTy + (e.clientY - startY)
  clamp()
}

function onPointerUp(e: PointerEvent) {
  dragging = false
  ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
}

// --- zoom ------------------------------------------------------------------
function onZoom(e: Event) {
  const next = Number((e.target as HTMLInputElement).value)
  // Preserve the image point currently under the viewport centre.
  const oldScale = scale.value
  const cx = (vpW.value / 2 - tx.value) / oldScale
  const cy = (vpH.value / 2 - ty.value) / oldScale
  zoom.value = next
  tx.value = vpW.value / 2 - cx * scale.value
  ty.value = vpH.value / 2 - cy * scale.value
  clamp()
}

// --- apply -----------------------------------------------------------------
function apply() {
  const el = imgEl.value
  if (!el || !ready.value) return

  const sx = -tx.value / scale.value
  const sy = -ty.value / scale.value
  const sW = vpW.value / scale.value
  const sH = vpH.value / scale.value

  const outW = Math.min(props.maxWidth, Math.round(sW))
  const outH = Math.round(outW / props.aspect)

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.drawImage(el, sx, sy, sW, sH, 0, 0, outW, outH)

  canvas.toBlob(
    (blob) => {
      if (!blob) return
      emit('crop', new File([blob], props.fileName, { type: 'image/jpeg' }))
      open.value = false
    },
    'image/jpeg',
    0.9
  )
}

// Re-measure once the modal is actually in the DOM (it mounts on open).
watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  if (natW.value) {
    measureViewport()
    clamp()
  }
})
</script>

<template>
  <UiModal v-model="open" title="Crop image" size="lg">
    <div class="flex flex-col gap-4">
      <div
        ref="viewport"
        class="aspect-4/3 relative w-full cursor-grab touch-none select-none overflow-hidden rounded-card border border-line bg-surface-2 active:cursor-grabbing"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <img
          v-if="src"
          ref="imgEl"
          :src="src"
          alt="Crop preview"
          draggable="false"
          class="pointer-events-none max-w-none origin-top-left"
          :style="imageStyle"
          @load="onImageLoad"
        />
      </div>

      <div class="flex items-center gap-3">
        <i class="pi pi-image text-muted" />
        <input
          type="range"
          min="1"
          max="3"
          step="0.01"
          :value="zoom"
          class="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-line accent-accent-600"
          aria-label="Zoom"
          @input="onZoom"
        />
        <i class="pi pi-image text-lg text-muted" />
      </div>

      <p class="text-xs text-muted">
        Drag to reposition, slide to zoom. The image is cropped to 4:3.
      </p>
    </div>

    <template #footer>
      <UiButton variant="ghost" @click="open = false">Cancel</UiButton>
      <UiButton icon="pi-check" @click="apply">Apply crop</UiButton>
    </template>
  </UiModal>
</template>
