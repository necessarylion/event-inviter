<script setup lang="ts">
withDefaults(
  defineProps<{
    /** "solid" = accent square (default), "soft" = translucent (for brand panels) */
    tone?: 'solid' | 'soft'
    wordmark?: boolean
    size?: number
  }>(),
  { tone: 'solid', wordmark: true, size: 32 }
)
</script>

<template>
  <span class="flex items-center gap-[10px] font-extrabold tracking-tight text-ink no-underline">
    <span
      class="grid place-items-center rounded-[9px]"
      :class="
        tone === 'solid'
          ? 'bg-accent-500 text-accent-contrast shadow-[0_6px_16px_-6px_color-mix(in_srgb,var(--accent-500),transparent_40%)]'
          : 'bg-white/20 text-white'
      "
      :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.52}px` }"
    >
      <i class="pi pi-ticket" />
    </span>
    <span v-if="wordmark" :style="{ fontSize: `${size * 0.56}px` }">Guest Invite</span>
  </span>
</template>
