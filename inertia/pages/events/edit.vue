<script setup lang="ts">
import { DateTime } from 'luxon'
import { Head, useForm } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import EventFields from '~/components/event_fields.vue'
import { UiButton, UiCard, UiPageHeader } from '~/components/ui'

type EventData = {
  id: number
  title: string
  description: string | null
  location: string | null
  venueAddress: string | null
  coverImageUrl: string | null
  startsAt: string | null
  endsAt: string | null
  timezone: string
  status: string
  allowPublicRsvp: boolean
}

const props = defineProps<{ event: EventData }>()

function toLocalInput(iso: string | null, zone: string) {
  return iso ? DateTime.fromISO(iso).setZone(zone).toFormat("yyyy-MM-dd'T'HH:mm") : ''
}

const form = useForm({
  title: props.event.title,
  description: props.event.description ?? '',
  location: props.event.location ?? '',
  venueAddress: props.event.venueAddress ?? '',
  coverImageUrl: props.event.coverImageUrl ?? '',
  startsAt: toLocalInput(props.event.startsAt, props.event.timezone),
  endsAt: toLocalInput(props.event.endsAt, props.event.timezone),
  timezone: props.event.timezone,
  status: props.event.status,
  allowPublicRsvp: props.event.allowPublicRsvp,
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
    .put(`/events/${props.event.id}`)
}
</script>

<template>
  <Head title="Edit event" />

  <div class="mx-auto max-w-[760px]">
    <Link
      :href="`/events/${event.id}`"
      class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-2 no-underline transition-colors hover:text-ink"
    >
      <i class="pi pi-arrow-left" /> Back to event
    </Link>

    <UiPageHeader title="Edit event" />

    <UiCard>
      <form class="flex flex-col" @submit.prevent="submit">
        <EventFields :form="form" />
        <div class="mt-7 flex items-center gap-3">
          <UiButton type="submit" :loading="form.processing" icon="pi-check">Save changes</UiButton>
          <Link :href="`/events/${event.id}`" class="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </UiCard>
  </div>
</template>
