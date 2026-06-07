<script setup lang="ts">
type Variant = 'muted' | 'accent' | 'success' | 'warn' | 'danger'

withDefaults(defineProps<{ variant?: Variant; icon?: string }>(), {
  variant: 'muted',
  icon: undefined,
})
</script>

<template>
  <span class="tag" :class="`tag-${variant}`">
    <i v-if="icon" :class="['pi', icon, 'text-[11px]']" />
    <slot />
  </span>
</template>
