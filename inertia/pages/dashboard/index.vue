<script setup lang="ts">
import { DateTime } from 'luxon'
import { Head } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { UiButton, UiBadge, UiEmpty, UiPageHeader } from '~/components/ui'

type EventRow = {
  id: number
  title: string
  status: string
  location: string | null
  startsAt: string | null
  guestsCount: number
  checkedInCount: number
}

defineProps<{ events: EventRow[]; totalEvents: number }>()

function formatDate(iso: string | null) {
  return iso ? DateTime.fromISO(iso).toFormat('dd LLL yyyy, t') : 'Date TBD'
}
</script>

<template>
  <Head title="Your events" />

  <UiPageHeader
    title="Your events"
    :subtitle="`${totalEvents} event${totalEvents === 1 ? '' : 's'} total`"
  >
    <template #actions>
      <Link route="events.create" class="btn btn-primary">
        <i class="pi pi-plus" /> Create event
      </Link>
    </template>
  </UiPageHeader>

  <div
    v-if="events.length"
    class="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]"
  >
    <Link
      v-for="event in events"
      :key="event.id"
      route="events.show"
      :params="{ id: event.id }"
      class="group block rounded-card border border-line bg-surface px-6 py-[22px] no-underline transition-all hover:-translate-y-[3px] hover:border-accent-500/40 hover:shadow-card"
    >
      <div class="mb-2.5 flex items-center justify-between gap-3">
        <h3 class="text-[19px] font-extrabold leading-tight tracking-tight text-ink">
          {{ event.title }}
        </h3>
        <UiBadge :variant="event.status === 'published' ? 'accent' : 'muted'">
          {{ event.status }}
        </UiBadge>
      </div>

      <div class="mb-[18px] flex items-center gap-[7px] text-sm text-muted">
        <i class="pi pi-calendar text-[13px]" /> {{ formatDate(event.startsAt) }}
      </div>
      <div v-if="event.location" class="mb-[18px] flex items-center gap-[7px] text-sm text-muted">
        <i class="pi pi-map-marker text-[13px]" /> {{ event.location }}
      </div>

      <div class="flex gap-[22px] text-sm text-muted">
        <span
          ><b class="font-bold text-ink">{{ event.guestsCount }}</b> guests</span
        >
        <span
          ><b class="font-bold text-ink">{{ event.checkedInCount }}</b> checked in</span
        >
      </div>
    </Link>
  </div>

  <UiEmpty
    v-else
    icon="pi-calendar-plus"
    title="No events yet"
    description="Create your first event to start inviting guests."
  >
    <UiButton href="/events/create" icon="pi-plus">Create event</UiButton>
  </UiEmpty>
</template>
