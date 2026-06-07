<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Page not found" />

  <div class="flex flex-col items-center justify-center py-24 text-center">
    <div
      class="mb-6 grid h-16 w-16 place-items-center rounded-[18px] bg-accent-50 text-3xl text-accent-600"
    >
      <i class="pi pi-compass" />
    </div>
    <h1 class="text-3xl font-extrabold tracking-tight text-ink">Page not found</h1>
    <p class="mt-2 max-w-md text-[15px] text-muted">
      The page you're looking for doesn't exist or may have moved.
    </p>
    <a href="/dashboard" class="btn btn-primary mt-6">
      <i class="pi pi-arrow-left" /> Back to events
    </a>
  </div>
</template>
