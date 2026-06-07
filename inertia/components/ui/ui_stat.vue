<script setup lang="ts">
defineProps<{ value: number | string; label: string; accent?: boolean }>()
</script>

<template>
  <div class="rounded-card border border-line bg-surface px-5 py-[18px]">
    <div
      class="text-[32px] font-extrabold leading-none tracking-tight"
      :class="accent ? 'text-accent-600' : 'text-ink'"
    >
      {{ value }}
    </div>
    <div class="mt-1.5 text-[13px] text-muted">{{ label }}</div>
  </div>
</template>
