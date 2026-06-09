<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DateTime } from 'luxon'
import { toast } from 'vue-sonner'
import { Head, router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import {
  UiButton,
  UiCard,
  UiField,
  UiDatePicker,
  UiBadge,
  UiSwitch,
  UiPageHeader,
} from '~/components/ui'
import { confirm } from '~/composables/use_confirm'

type EventData = {
  id: number
  title: string
  slug: string
  allowPublicRsvp: boolean
  isPublic: boolean
}
type RegistrationLink = {
  url: string
  isActive: boolean
  expiresAt: string | null
  isExpired: boolean
  isUsable: boolean
}

const props = defineProps<{ event: EventData; registrationLink: RegistrationLink | null }>()

function toLocalInput(iso: string | null) {
  return iso ? DateTime.fromISO(iso).setZone('UTC').toFormat("yyyy-MM-dd'T'HH:mm") : ''
}

// ----- public RSVP + public listing -----
const allowPublicRsvp = ref(props.event.allowPublicRsvp)
const isPublic = ref(props.event.isPublic)
watch(
  () => props.event.allowPublicRsvp,
  (value) => (allowPublicRsvp.value = value)
)
watch(
  () => props.event.isPublic,
  (value) => (isPublic.value = value)
)

const publicUrl = computed(() => `/e/${props.event.slug}`)

function saveSettings() {
  router.put(
    `/events/${props.event.id}/settings`,
    { allowPublicRsvp: allowPublicRsvp.value, isPublic: isPublic.value },
    { preserveScroll: true }
  )
}

// ----- public registration link -----
const regCopied = ref(false)
const regBusy = ref(false)
const regExpiry = ref(toLocalInput(props.registrationLink?.expiresAt ?? null))

const regLinkUrl = computed(() => props.registrationLink?.url ?? '')

const regStatus = computed(() => {
  const l = props.registrationLink
  if (!l) return null
  if (l.isExpired) return { label: 'Expired', variant: 'danger' as const, icon: 'pi-clock' }
  if (!l.isActive) return { label: 'Disabled', variant: 'muted' as const, icon: 'pi-pause' }
  return { label: 'Active', variant: 'accent' as const, icon: 'pi-check-circle' }
})

function postRegLink(data: Record<string, string | number | boolean | null>) {
  if (regBusy.value) return
  regBusy.value = true
  router.post(`/events/${props.event.id}/registration-link`, data, {
    preserveScroll: true,
    onFinish: () => (regBusy.value = false),
  })
}

function createRegLink() {
  postRegLink({ expiresAt: regExpiry.value || null, isActive: true })
}

function saveRegExpiry() {
  postRegLink({ expiresAt: regExpiry.value || null })
}

function toggleRegActive() {
  postRegLink({ isActive: !props.registrationLink?.isActive, expiresAt: regExpiry.value || null })
}

async function regenerateRegLink() {
  const ok = await confirm({
    title: 'Regenerate registration link?',
    message: 'The current link will stop working immediately and a new one will be created.',
    confirmLabel: 'Regenerate',
    danger: true,
    icon: 'pi-refresh',
  })
  if (!ok) return
  postRegLink({ regenerate: true, expiresAt: regExpiry.value || null })
}

async function removeRegLink() {
  const ok = await confirm({
    title: 'Remove registration link?',
    message: 'The link will stop working. Existing guests who already registered are not affected.',
    confirmLabel: 'Remove link',
    danger: true,
    icon: 'pi-trash',
  })
  if (!ok) return
  if (regBusy.value) return
  regBusy.value = true
  router.delete(`/events/${props.event.id}/registration-link`, {
    preserveScroll: true,
    onFinish: () => (regBusy.value = false),
  })
}

function copyRegLink() {
  if (!regLinkUrl.value) return
  navigator.clipboard.writeText(regLinkUrl.value)
  regCopied.value = true
  toast.success('Registration link copied')
  setTimeout(() => (regCopied.value = false), 1800)
}
</script>

<template>
  <Head :title="`${event.title} — Settings`" />

  <div class="mx-auto max-w-[760px]">
    <Link
      :href="`/events/${event.id}`"
      class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-2 no-underline transition-colors hover:text-ink"
    >
      <i class="pi pi-arrow-left" /> Back to event
    </Link>

    <UiPageHeader title="Event settings" :subtitle="event.title" />

    <!-- public event listing -->
    <UiCard class="mb-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="flex items-center gap-2 text-base font-bold text-ink">
            <i class="pi pi-globe text-accent-600" /> Public event
          </h2>
          <p class="mt-1 text-sm text-muted">
            List this event publicly so anyone can discover it on the events page and join — each
            person who joins gets an invitation emailed to them.
          </p>
        </div>
        <UiSwitch
          v-model="isPublic"
          on-label="On"
          off-label="Off"
          @update:model-value="saveSettings"
        />
      </div>
      <a
        v-if="isPublic"
        :href="publicUrl"
        target="_blank"
        rel="noopener"
        class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent-700 no-underline hover:underline"
      >
        <i class="pi pi-external-link" /> View public page
      </a>
    </UiCard>

    <!-- public RSVP -->
    <UiCard class="mb-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="flex items-center gap-2 text-base font-bold text-ink">
            <i class="pi pi-check-square text-accent-600" /> Public RSVP
          </h2>
          <p class="mt-1 text-sm text-muted">
            Let guests confirm or decline straight from their invite link.
          </p>
        </div>
        <UiSwitch
          v-model="allowPublicRsvp"
          on-label="On"
          off-label="Off"
          @update:model-value="saveSettings"
        />
      </div>
    </UiCard>

    <!-- public registration link -->
    <UiCard>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="flex items-center gap-2 text-base font-bold text-ink">
            <i class="pi pi-share-alt text-accent-600" /> Public registration link
          </h2>
          <p class="mt-1 text-sm text-muted">
            Share one link anyone can use to register themselves for this event.
          </p>
        </div>
        <UiBadge v-if="regStatus" :variant="regStatus.variant" :icon="regStatus.icon">
          {{ regStatus.label }}
        </UiBadge>
      </div>

      <template v-if="registrationLink">
        <div class="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            :value="regLinkUrl"
            readonly
            class="input flex-1 font-mono text-sm!"
            @focus="(e) => (e.target as HTMLInputElement).select()"
          />
          <div class="flex gap-2">
            <UiButton
              variant="secondary"
              :icon="regCopied ? 'pi-check' : 'pi-link'"
              @click="copyRegLink"
            >
              {{ regCopied ? 'Copied' : 'Copy' }}
            </UiButton>
            <a :href="regLinkUrl" target="_blank" rel="noopener" class="btn btn-secondary">
              <i class="pi pi-external-link" /> Open
            </a>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
          <UiField label="Expires" optional class="w-full sm:w-72">
            <UiDatePicker v-model="regExpiry" placeholder="No expiry" />
          </UiField>
          <UiButton
            variant="secondary"
            icon="pi-calendar"
            :disabled="regBusy"
            @click="saveRegExpiry"
          >
            {{ regExpiry ? 'Update expiry' : 'No expiry' }}
          </UiButton>
          <span class="grow" />
          <UiButton
            :variant="registrationLink.isActive ? 'secondary' : 'primary'"
            :icon="registrationLink.isActive ? 'pi-pause' : 'pi-play'"
            :disabled="regBusy"
            @click="toggleRegActive"
          >
            {{ registrationLink.isActive ? 'Disable' : 'Enable' }}
          </UiButton>
          <UiButton
            variant="secondary"
            icon="pi-refresh"
            :disabled="regBusy"
            @click="regenerateRegLink"
          >
            Regenerate
          </UiButton>
          <UiButton
            variant="danger-ghost"
            icon="pi-trash"
            :disabled="regBusy"
            @click="removeRegLink"
          >
            Remove
          </UiButton>
        </div>
        <p v-if="registrationLink.isExpired" class="mt-3 text-sm text-danger-500">
          This link has expired — set a future expiry (or clear it) to reopen registration.
        </p>
      </template>

      <template v-else>
        <div class="mt-4 flex flex-wrap items-end gap-3">
          <UiField label="Expires" optional class="w-full sm:w-72">
            <UiDatePicker v-model="regExpiry" placeholder="No expiry" />
          </UiField>
          <UiButton icon="pi-plus" :disabled="regBusy" @click="createRegLink">
            Create registration link
          </UiButton>
        </div>
      </template>
    </UiCard>
  </div>
</template>
