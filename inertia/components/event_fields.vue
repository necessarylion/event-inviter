<script setup lang="ts">
/*
 * This component renders fields bound to a shared Inertia `useForm` instance
 * passed in by the parent (create/edit pages), so it intentionally writes to the
 * form prop — the parent owns the form and reads the values back on submit.
 */
/* eslint-disable vue/no-mutating-props */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { InertiaForm } from '@inertiajs/vue3'
import { UiField, UiInput, UiTextarea, UiDatePicker, UiButton } from '~/components/ui'
import ImageCropper from '~/components/image_cropper.vue'

interface EventFormData {
  title: string
  description: string
  location: string
  mapUrl: string
  startsAt: string
  endsAt: string
  allowPublicRsvp: boolean
  thumbnail: File | null
  // Present on the edit form only — flags the existing thumbnail for removal.
  removeThumbnail?: boolean
}

const props = defineProps<{
  form: InertiaForm<EventFormData>
  // Existing thumbnail URL when editing; null/undefined when creating.
  currentThumbnailUrl?: string | null
}>()

const fileInput = ref<HTMLInputElement | null>(null)
// Object URL for the cropped file shown as the preview; revoked on cleanup.
const localPreview = ref<string | null>(null)

// Cropper state: source object URL of the just-picked (uncropped) file.
const cropOpen = ref(false)
const cropSrc = ref<string | null>(null)

const previewUrl = computed(() => {
  if (localPreview.value) return localPreview.value
  if (props.form.removeThumbnail) return null
  return props.currentThumbnailUrl ?? null
})

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // Reset so re-selecting the same file fires `change` again.
  input.value = ''
  if (!file) return
  revokeCropSrc()
  cropSrc.value = URL.createObjectURL(file)
  cropOpen.value = true
}

function onCropped(file: File) {
  props.form.thumbnail = file
  if ('removeThumbnail' in props.form) props.form.removeThumbnail = false
  revokeLocalPreview()
  localPreview.value = URL.createObjectURL(file)
}

function clearImage() {
  props.form.thumbnail = null
  revokeLocalPreview()
  // Mark the stored image for removal (edit form). Harmless on create.
  if ('removeThumbnail' in props.form) props.form.removeThumbnail = true
}

function revokeLocalPreview() {
  if (localPreview.value) {
    URL.revokeObjectURL(localPreview.value)
    localPreview.value = null
  }
}

function revokeCropSrc() {
  if (cropSrc.value) {
    URL.revokeObjectURL(cropSrc.value)
    cropSrc.value = null
  }
}

// Release the source object URL once the cropper closes (applied or cancelled).
watch(cropOpen, (isOpen) => {
  if (!isOpen) revokeCropSrc()
})

onBeforeUnmount(() => {
  revokeLocalPreview()
  revokeCropSrc()
})
</script>

<template>
  <div class="flex flex-col gap-[18px]">
    <UiField label="Event title" for="title" :error="form.errors.title">
      <UiInput id="title" v-model="form.title" :invalid="!!form.errors.title" />
    </UiField>

    <UiField label="Thumbnail image" optional :error="form.errors.thumbnail">
      <div class="flex items-center gap-4">
        <div
          class="relative aspect-4/3 w-32 shrink-0 overflow-hidden rounded-card border border-line bg-surface-2"
        >
          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt="Event thumbnail preview"
            class="h-full w-full object-cover"
          />
          <div v-else class="grid h-full place-items-center text-muted">
            <i class="pi pi-image text-xl" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <input
            ref="fileInput"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            class="hidden"
            @change="onFileSelected"
          />
          <div class="flex gap-2">
            <UiButton variant="secondary" size="sm" icon="pi-upload" @click="fileInput?.click()">
              {{ previewUrl ? 'Change image' : 'Upload image' }}
            </UiButton>
            <UiButton
              v-if="previewUrl"
              variant="danger-ghost"
              size="sm"
              icon="pi-trash"
              @click="clearImage"
            >
              Remove
            </UiButton>
          </div>
          <p class="text-xs text-muted">PNG, JPG, WEBP or GIF — up to 5MB.</p>
        </div>
      </div>
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

    <UiField
      label="Google Maps link"
      for="mapUrl"
      optional
      :error="form.errors.mapUrl"
      hint="Paste a Google Maps share link (starts with https://maps.app.goo.gl)."
    >
      <UiInput
        id="mapUrl"
        v-model="form.mapUrl"
        type="url"
        placeholder="https://maps.app.goo.gl/…"
        :invalid="!!form.errors.mapUrl"
      />
    </UiField>

    <ImageCropper v-model="cropOpen" :src="cropSrc" @crop="onCropped" />
  </div>
</template>
