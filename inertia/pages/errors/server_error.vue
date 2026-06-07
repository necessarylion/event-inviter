<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Something went wrong" />

  <div class="flex flex-col items-center justify-center py-24 text-center">
    <div
      class="mb-6 grid h-16 w-16 place-items-center rounded-[18px] bg-danger-50 text-3xl text-danger-500"
    >
      <i class="pi pi-exclamation-triangle" />
    </div>
    <h1 class="text-3xl font-extrabold tracking-tight text-ink">Something went wrong</h1>
    <p class="mt-2 max-w-md text-[15px] text-muted">
      An unexpected error occurred on our end. Please try again in a moment.
    </p>
    <a href="/dashboard" class="btn btn-primary mt-6">
      <i class="pi pi-arrow-left" /> Back to events
    </a>
  </div>
</template>
