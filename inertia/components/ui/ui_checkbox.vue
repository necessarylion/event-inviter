<script setup lang="ts">
const model = defineModel<boolean>()
</script>

<template>
  <label class="flex items-start gap-2.5 cursor-pointer">
    <input v-model="model" type="checkbox" class="checkbox mt-0.5" />
    <span class="text-sm leading-snug text-ink-2">
      <slot />
    </span>
  </label>
</template>
