<script setup lang="ts">
defineProps<{
  label?: string
  for?: string
  optional?: boolean
  error?: string
  hint?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-[7px]">
    <label v-if="label" :for="$props.for" class="text-sm font-medium text-ink">
      {{ label }}
      <span v-if="optional" class="font-normal text-muted">(optional)</span>
    </label>

    <slot />

    <p v-if="hint && !error" class="text-xs text-muted">{{ hint }}</p>
    <p v-if="error" class="flex items-center gap-1.5 text-[12.5px] text-danger-500">
      <i class="pi pi-exclamation-circle text-xs" />
      <span>{{ error }}</span>
    </p>
  </div>
</template>
