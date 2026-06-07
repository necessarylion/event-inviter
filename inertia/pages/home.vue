<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { UiButton } from '~/components/ui'
</script>

<template>
  <Head title="Welcome" />

  <div class="mx-auto max-w-3xl py-20 text-center">
    <h1 class="text-[clamp(36px,5vw,52px)] font-extrabold leading-tight tracking-tight text-ink">
      Invite guests. <span class="text-accent-500">Scan a QR.</span> Done.
    </h1>
    <p class="mx-auto mt-5 max-w-xl text-lg text-ink-2">
      Create your event, build a guest list, and send invitations by email, link, or printable card
      — each with a unique QR code for instant check-in at the door.
    </p>
    <div class="mt-8 flex justify-center gap-3">
      <UiButton href="/signup" size="lg" icon="pi-arrow-right">Create your event — free</UiButton>
      <UiButton href="/login" size="lg" variant="secondary">Login</UiButton>
    </div>
  </div>
</template>
