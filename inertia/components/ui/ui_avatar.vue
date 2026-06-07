<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ name: string; size?: number }>(), { size: 36 })

/** Deterministic, pleasant colour derived from the guest's name. */
const PALETTE = ['#10b981', '#0ea5e9', '#8b5cf6', '#f43f5e', '#f59e0b', '#14b8a6', '#6366f1']

const initials = computed(() =>
  props.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
)

const bg = computed(() => {
  let hash = 0
  for (const ch of props.name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTE[hash % PALETTE.length]
})
</script>

<template>
  <span
    class="grid flex-none place-items-center rounded-full font-bold text-white"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      background: bg,
      fontSize: `${size * 0.36}px`,
    }"
  >
    {{ initials }}
  </span>
</template>
