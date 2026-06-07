<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <div class="panel">
    <div v-if="title || $slots.header" class="mb-[18px] flex items-center justify-between gap-3">
      <h2 v-if="title" class="text-lg font-bold tracking-tight text-ink">{{ title }}</h2>
      <slot name="header" />
    </div>
    <slot />
  </div>
</template>
