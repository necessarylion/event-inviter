<script setup lang="ts">
defineProps<{ invalid?: boolean }>()
const model = defineModel<string | number>()
</script>

<template>
  <input v-model="model" class="input" :class="{ invalid }" />
</template>
