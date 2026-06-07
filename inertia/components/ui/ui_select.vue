<script setup lang="ts">
const model = defineModel<string>()
</script>

<template>
  <select v-model="model" class="select">
    <slot />
  </select>
</template>
