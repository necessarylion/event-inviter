<script setup lang="ts">
defineProps<{ icon?: string; title: string; description?: string }>()
</script>

<template>
  <div class="rounded-card border border-dashed border-line bg-surface px-6 py-[60px] text-center">
    <div
      class="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-[18px] bg-accent-50 text-[28px] text-accent-600"
    >
      <i :class="['pi', icon || 'pi-calendar']" />
    </div>
    <h3 class="mb-2 text-xl font-bold text-ink">{{ title }}</h3>
    <p v-if="description" class="mx-auto mb-[22px] max-w-sm text-[15px] text-ink-2">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
