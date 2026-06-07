<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import EventFields from '~/components/event_fields.vue'
import { UiButton, UiCard, UiPageHeader } from '~/components/ui'

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const form = useForm({
  title: '',
  description: '',
  location: '',
  venueAddress: '',
  coverImageUrl: '',
  startsAt: '',
  endsAt: '',
  timezone,
  status: 'draft',
  allowPublicRsvp: true,
})

function submit() {
  form
    .transform((data) => ({
      ...data,
      description: data.description || null,
      location: data.location || null,
      venueAddress: data.venueAddress || null,
      coverImageUrl: data.coverImageUrl || null,
      endsAt: data.endsAt || null,
    }))
    .post('/events')
}
</script>

<template>
  <Head title="Create event" />

  <div class="mx-auto max-w-[760px]">
    <Link
      href="/dashboard"
      class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-2 no-underline transition-colors hover:text-ink"
    >
      <i class="pi pi-arrow-left" /> Back to events
    </Link>

    <UiPageHeader
      title="Create event"
      subtitle="Set up your event, then add guests and send invitations."
    />

    <UiCard>
      <form class="flex flex-col" @submit.prevent="submit">
        <EventFields :form="form" />
        <div class="mt-7 flex items-center gap-3">
          <UiButton type="submit" :loading="form.processing" icon="pi-check">Create event</UiButton>
          <Link href="/dashboard" class="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </UiCard>
  </div>
</template>
