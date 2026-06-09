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
  mapUrl: string | null
  startsAt: string | null
  endsAt: string | null
  allowPublicRsvp: boolean
  thumbnailUrl: string | null
}

const props = defineProps<{ event: EventData }>()

function toLocalInput(iso: string | null) {
  return iso ? DateTime.fromISO(iso).setZone('UTC').toFormat("yyyy-MM-dd'T'HH:mm") : ''
}

const form = useForm({
  title: props.event.title,
  description: props.event.description ?? '',
  location: props.event.location ?? '',
  mapUrl: props.event.mapUrl ?? '',
  startsAt: toLocalInput(props.event.startsAt),
  endsAt: toLocalInput(props.event.endsAt),
  allowPublicRsvp: props.event.allowPublicRsvp,
  thumbnail: null as File | null,
  removeThumbnail: false,
})

function submit() {
  form
    .transform((data) => {
      // Empty optional fields are normalised to null server-side; drop the
      // thumbnail key when no file is picked so it isn't sent as an empty value.
      const { thumbnail, ...rest } = data
      return thumbnail ? data : rest
    })
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
        <EventFields :form="form" :current-thumbnail-url="event.thumbnailUrl" />
        <div class="mt-7 flex items-center gap-3">
          <UiButton type="submit" :loading="form.processing" icon="pi-check">Save changes</UiButton>
          <Link :href="`/events/${event.id}`" class="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </UiCard>
  </div>
</template>
