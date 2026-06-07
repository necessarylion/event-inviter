<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div class="mb-7 flex flex-wrap items-start justify-between gap-5">
    <div>
      <h1
        class="text-[clamp(22px,2.6vw,28px)] font-extrabold leading-tight tracking-tight text-ink"
      >
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-1.5 text-sm text-muted">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2.5">
      <slot name="actions" />
    </div>
  </div>
</template>
