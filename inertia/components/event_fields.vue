<script setup lang="ts">
/*
 * This component renders fields bound to a shared Inertia `useForm` instance
 * passed in by the parent (create/edit pages), so it intentionally writes to the
 * form prop — the parent owns the form and reads the values back on submit.
 */
/* eslint-disable vue/no-mutating-props */
import type { InertiaForm } from '@inertiajs/vue3'
import { UiField, UiInput, UiTextarea, UiSelect, UiCheckbox } from '~/components/ui'

interface EventFormData {
  title: string
  description: string
  location: string
  venueAddress: string
  coverImageUrl: string
  startsAt: string
  endsAt: string
  timezone: string
  status: string
  allowPublicRsvp: boolean
}

defineProps<{ form: InertiaForm<EventFormData> }>()
</script>

<template>
  <div class="flex flex-col gap-[18px]">
    <UiField label="Event title" for="title" :error="form.errors.title">
      <UiInput id="title" v-model="form.title" :invalid="!!form.errors.title" />
    </UiField>

    <UiField label="Description" for="description" optional :error="form.errors.description">
      <UiTextarea id="description" v-model="form.description" />
    </UiField>

    <div class="grid gap-[18px] sm:grid-cols-2">
      <UiField label="Starts at" for="startsAt" :error="form.errors.startsAt">
        <UiInput
          id="startsAt"
          v-model="form.startsAt"
          type="datetime-local"
          :invalid="!!form.errors.startsAt"
        />
      </UiField>
      <UiField label="Ends at" for="endsAt" optional :error="form.errors.endsAt">
        <UiInput id="endsAt" v-model="form.endsAt" type="datetime-local" />
      </UiField>
    </div>

    <div class="grid gap-[18px] sm:grid-cols-2">
      <UiField label="Location name" for="location" optional>
        <UiInput id="location" v-model="form.location" />
      </UiField>
      <UiField label="Timezone" for="timezone">
        <UiInput id="timezone" v-model="form.timezone" />
      </UiField>
    </div>

    <UiField label="Venue address" for="venueAddress" optional>
      <UiInput id="venueAddress" v-model="form.venueAddress" />
    </UiField>

    <UiField
      label="Cover image URL"
      for="coverImageUrl"
      optional
      :error="form.errors.coverImageUrl"
    >
      <UiInput
        id="coverImageUrl"
        v-model="form.coverImageUrl"
        type="url"
        :invalid="!!form.errors.coverImageUrl"
      />
    </UiField>

    <div class="grid items-start gap-[18px] sm:grid-cols-2">
      <UiField label="Status" for="status">
        <UiSelect id="status" v-model="form.status">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </UiSelect>
      </UiField>
      <UiField label="Public RSVP">
        <UiCheckbox v-model="form.allowPublicRsvp">
          Allow guests to RSVP from the invite link
        </UiCheckbox>
      </UiField>
    </div>
  </div>
</template>
