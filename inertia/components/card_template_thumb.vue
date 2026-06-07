<script setup lang="ts">
/*
 * A cheap, faithful preview of a pdfme card template: each schema is drawn as a
 * scaled, absolutely-positioned element (no PDF rendering). Good enough to tell
 * the layouts apart in the template picker.
 */
import { computed } from 'vue'

const props = defineProps<{
  template: Record<string, any>
  width?: number
  // A pre-rendered PNG (data URI) of the first page. When present it's shown
  // instead of the CSS approximation — a faithful, font-accurate thumbnail.
  image?: string | null
}>()

const PT_TO_MM = 0.3528

const W = computed(() => props.width ?? 150)
const base = computed(() => props.template.basePdf ?? { width: 105, height: 148 })
const scale = computed(() => W.value / base.value.width)
const H = computed(() => base.value.height * scale.value)
const schemas = computed<any[]>(() => props.template.schemas?.[0] ?? [])

function box(s: any) {
  return {
    left: `${s.position.x * scale.value}px`,
    top: `${s.position.y * scale.value}px`,
    width: `${s.width * scale.value}px`,
    height: `${s.height * scale.value}px`,
  }
}
function textStyle(s: any) {
  return {
    ...box(s),
    fontSize: `${Math.max(4, (s.fontSize ?? 12) * PT_TO_MM * scale.value)}px`,
    color: s.fontColor ?? '#111827',
    textAlign: (s.alignment ?? 'left') as any,
    letterSpacing: s.characterSpacing ? `${s.characterSpacing * scale.value}px` : undefined,
  }
}
function shapeStyle(s: any) {
  const st: Record<string, any> = {
    ...box(s),
    background: s.color || 'transparent',
    opacity: s.opacity ?? 1,
  }
  if (s.borderWidth)
    st.border = `${Math.max(1, s.borderWidth * scale.value)}px solid ${s.borderColor || '#000'}`
  if (s.type === 'ellipse') st.borderRadius = '50%'
  else if (s.radius) st.borderRadius = `${s.radius * scale.value}px`
  return st
}
function lineStyle(s: any) {
  return {
    ...box(s),
    background: s.color || '#000',
    height: `${Math.max(1, s.height * scale.value)}px`,
  }
}
function isDataImage(s: any) {
  return s.type === 'image' && typeof s.content === 'string' && s.content.startsWith('data:')
}
</script>

<template>
  <div
    class="relative overflow-hidden rounded-md bg-white ring-1 ring-black/10"
    :style="{ width: `${W}px`, height: `${H}px` }"
  >
    <img v-if="image" :src="image" class="h-full w-full object-contain" alt="" />
    <template v-for="(s, i) in schemas" v-else :key="i">
      <div
        v-if="s.type === 'rectangle' || s.type === 'ellipse'"
        class="absolute"
        :style="shapeStyle(s)"
      />
      <div v-else-if="s.type === 'line'" class="absolute" :style="lineStyle(s)" />
      <i
        v-else-if="s.type === 'qrcode'"
        class="pi pi-qrcode absolute grid place-items-center leading-none"
        :style="{ ...box(s), fontSize: `${s.width * scale * 0.95}px`, color: s.barColor || '#000' }"
      />
      <img
        v-else-if="isDataImage(s)"
        class="absolute object-contain"
        :src="s.content"
        :style="box(s)"
        alt=""
      />
      <div
        v-else-if="s.type === 'image'"
        class="absolute grid place-items-center bg-slate-100 text-slate-400"
        :style="box(s)"
      >
        <i class="pi pi-image" />
      </div>
      <div v-else class="absolute overflow-hidden leading-tight" :style="textStyle(s)">
        {{ s.type === 'multiVariableText' ? (s.text ?? s.content) : s.content }}
      </div>
    </template>
  </div>
</template>
