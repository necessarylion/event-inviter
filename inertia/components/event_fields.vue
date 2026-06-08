<script setup lang="ts">
/*
 * This component renders fields bound to a shared Inertia `useForm` instance
 * passed in by the parent (create/edit pages), so it intentionally writes to the
 * form prop — the parent owns the form and reads the values back on submit.
 */
/* eslint-disable vue/no-mutating-props */
import type { InertiaForm } from '@inertiajs/vue3'
import { UiField, UiInput, UiTextarea, UiDatePicker } from '~/components/ui'

interface EventFormData {
  title: string
  description: string
  location: string
  startsAt: string
  endsAt: string
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
      <UiField label="Starts at" :error="form.errors.startsAt">
        <UiDatePicker
          v-model="form.startsAt"
          placeholder="Select date & time"
          :invalid="!!form.errors.startsAt"
        />
      </UiField>
      <UiField label="Ends at" optional :error="form.errors.endsAt">
        <UiDatePicker v-model="form.endsAt" placeholder="Select date & time" />
      </UiField>
    </div>

    <UiField label="Location name" for="location" optional>
      <UiInput id="location" v-model="form.location" />
    </UiField>
  </div>
</template>
