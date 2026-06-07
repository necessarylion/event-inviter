<script setup lang="ts">
defineProps<{ invalid?: boolean }>()
const model = defineModel<string>()
</script>

<template>
  <textarea v-model="model" class="textarea" :class="{ invalid }" />
</template>
