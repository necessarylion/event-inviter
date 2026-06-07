<script setup lang="ts">
import { ref } from 'vue'
import { DateTime } from 'luxon'
import { toast } from 'vue-sonner'
import { Head, router, useForm } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import {
  UiButton,
  UiCard,
  UiModal,
  UiField,
  UiInput,
  UiBadge,
  UiStat,
  UiAvatar,
  UiPageHeader,
} from '~/components/ui'
import { useCardImage } from '~/composables/use_card_image'

type GuestDraft = { name: string; email: string; phone: string }
const emptyRow = (): GuestDraft => ({ name: '', email: '', phone: '' })

type Invitation = { method: string; status: string; url: string }
type GuestRow = {
  id: number
  name: string
  email: string | null
  phone: string | null
  rsvpStatus: string
  checkedInAt: string | null
  isCheckedIn: boolean
  inviteUrl: string | null
  invitations: Invitation[]
}
type EventData = {
  id: number
  title: string
  status: string
  location: string | null
  startsAt: string | null
  timezone: string
}
type Stats = { total: number; confirmed: number; declined: number; checkedIn: number }

const props = defineProps<{ event: EventData; guests: GuestRow[]; stats: Stats }>()

const copiedId = ref<number | null>(null)
const downloadingId = ref<number | null>(null)
const { downloadCardImage } = useCardImage()

const addOpen = ref(false)
const guestForm = useForm<{ guests: GuestDraft[] }>({ guests: [emptyRow()] })

function openAddGuests() {
  guestForm.reset()
  guestForm.clearErrors()
  guestForm.guests = [emptyRow()]
  addOpen.value = true
}

function addRow() {
  guestForm.guests.push(emptyRow())
}

function removeRow(index: number) {
  guestForm.guests.splice(index, 1)
  if (guestForm.guests.length === 0) guestForm.guests.push(emptyRow())
}

function rowError(index: number, field: keyof GuestDraft) {
  return (guestForm.errors as Record<string, string>)[`guests.${index}.${field}`]
}

function submitGuests() {
  guestForm
    .transform((data) => ({
      guests: data.guests.filter((g) => g.name.trim() !== ''),
    }))
    .post(`/events/${props.event.id}/guests/bulk`, {
      preserveScroll: true,
      onSuccess: () => {
        addOpen.value = false
        guestForm.reset()
      },
    })
}

function copyLink(guest: GuestRow) {
  if (!guest.inviteUrl) return
  navigator.clipboard.writeText(guest.inviteUrl)
  copiedId.value = guest.id
  toast.success('Invite link copied')
  setTimeout(() => (copiedId.value = null), 1800)
}

function sendEmail(guest: GuestRow) {
  router.post(`/events/${props.event.id}/guests/${guest.id}/email`, {}, { preserveScroll: true })
}

async function downloadCard(guest: GuestRow) {
  if (downloadingId.value) return
  downloadingId.value = guest.id
  try {
    await downloadCardImage(
      `/events/${props.event.id}/guests/${guest.id}/card.pdf`,
      `invitation-${guest.name.replace(/\s+/g, '-').toLowerCase()}.png`
    )
  } catch {
    toast.error('Could not generate the card image.')
  } finally {
    downloadingId.value = null
  }
}

function removeGuest(guest: GuestRow) {
  if (!confirm(`Remove ${guest.name} from the guest list?`)) return
  router.delete(`/events/${props.event.id}/guests/${guest.id}`, { preserveScroll: true })
}

function deleteEvent() {
  if (!confirm('Delete this event and all its guests? This cannot be undone.')) return
  router.delete(`/events/${props.event.id}`)
}

function formatDate(iso: string | null) {
  return iso
    ? DateTime.fromISO(iso).setZone(props.event.timezone).toFormat('cccc, dd LLL yyyy • t')
    : 'Date TBD'
}

const rsvpVariant = (s: string) =>
  s === 'confirmed' ? 'accent' : s === 'declined' ? 'danger' : 'warn'
</script>

<template>
  <Head :title="event.title" />

  <Link
    href="/dashboard"
    class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-2 no-underline transition-colors hover:text-ink"
  >
    <i class="pi pi-arrow-left" /> All events
  </Link>

  <UiPageHeader :title="event.title">
    <template #actions>
      <UiButton icon="pi-user-plus" @click="openAddGuests">Add guests</UiButton>
      <Link :href="`/events/${event.id}/scan`" class="btn btn-secondary">
        <i class="pi pi-qrcode" /> Scan check-in
      </Link>
      <Link :href="`/events/${event.id}/card`" class="btn btn-secondary">
        <i class="pi pi-palette" /> Card designer
      </Link>
      <Link :href="`/events/${event.id}/edit`" class="btn btn-secondary">
        <i class="pi pi-pencil" /> Edit
      </Link>
      <UiButton variant="danger-ghost" icon="pi-trash" @click="deleteEvent">Delete</UiButton>
    </template>
  </UiPageHeader>

  <p class="-mt-4 mb-7 flex flex-wrap items-center gap-2 text-[15px] text-muted">
    <i class="pi pi-calendar text-accent-600" /> {{ formatDate(event.startsAt) }}
    <span v-if="event.location" class="flex items-center gap-2">
      <span class="text-line">·</span>
      <i class="pi pi-map-marker text-accent-600" /> {{ event.location }}
    </span>
  </p>

  <!-- stats -->
  <div class="mb-7 grid grid-cols-2 gap-4 md:grid-cols-4">
    <UiStat :value="stats.total" label="Guests" />
    <UiStat :value="stats.confirmed" label="Confirmed" accent />
    <UiStat :value="stats.declined" label="Declined" />
    <UiStat :value="stats.checkedIn" label="Checked in" accent />
  </div>

  <!-- add guests modal -->
  <UiModal v-model="addOpen" title="Add guests" size="lg">
    <form id="add-guests-form" class="space-y-4" @submit.prevent="submitGuests">
      <p class="text-sm text-muted">
        Add one or more guests below. Only the name is required — each guest gets their own invite
        link.
      </p>

      <div
        v-for="(row, i) in guestForm.guests"
        :key="i"
        class="rounded-card border border-line bg-surface-2 p-4"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-muted">
            Guest {{ i + 1 }}
          </span>
          <button
            v-if="guestForm.guests.length > 1"
            type="button"
            class="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-danger-50 hover:text-danger-500"
            aria-label="Remove guest"
            @click="removeRow(i)"
          >
            <i class="pi pi-times text-xs" />
          </button>
        </div>

        <div class="grid gap-3.5 sm:grid-cols-2">
          <UiField label="Name" :error="rowError(i, 'name')">
            <UiInput v-model="row.name" :invalid="!!rowError(i, 'name')" />
          </UiField>
          <UiField label="Email" optional :error="rowError(i, 'email')">
            <UiInput v-model="row.email" type="email" :invalid="!!rowError(i, 'email')" />
          </UiField>
          <UiField label="Phone" optional :error="rowError(i, 'phone')">
            <UiInput v-model="row.phone" type="tel" :invalid="!!rowError(i, 'phone')" />
          </UiField>
        </div>
      </div>

      <UiButton variant="secondary" icon="pi-plus" @click="addRow">Add another guest</UiButton>
    </form>

    <template #footer>
      <UiButton variant="ghost" @click="addOpen = false">Cancel</UiButton>
      <UiButton
        type="submit"
        form="add-guests-form"
        :loading="guestForm.processing"
        icon="pi-check"
      >
        Add {{ guestForm.guests.length > 1 ? `${guestForm.guests.length} guests` : 'guest' }}
      </UiButton>
    </template>
  </UiModal>

  <!-- guest list -->
  <h2 class="mb-3.5 mt-8 text-[22px] font-extrabold tracking-tight text-ink">Guest list</h2>

  <div v-if="guests.length" class="overflow-x-auto rounded-card border border-line bg-surface">
    <table class="w-full border-collapse text-left">
      <thead>
        <tr
          class="border-b border-line bg-surface-2 text-[11px] font-bold uppercase tracking-wider text-muted"
        >
          <th class="px-5 py-3 font-bold">Name</th>
          <th class="px-5 py-3 font-bold">Contact</th>
          <th class="px-5 py-3 font-bold">RSVP</th>
          <th class="px-5 py-3 font-bold">Entry</th>
          <th class="px-5 py-3"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="guest in guests" :key="guest.id" class="border-b border-line last:border-b-0">
          <td class="px-5 py-3.5">
            <div class="flex items-center gap-3">
              <UiAvatar :name="guest.name" />
              <span class="font-semibold text-ink">{{ guest.name }}</span>
            </div>
          </td>

          <td class="px-5 py-3.5 text-sm">
            <span class="block text-ink">{{ guest.email || '—' }}</span>
            <span v-if="guest.phone" class="text-[13px] text-muted">{{ guest.phone }}</span>
          </td>

          <td class="px-5 py-3.5">
            <UiBadge :variant="rsvpVariant(guest.rsvpStatus)">{{ guest.rsvpStatus }}</UiBadge>
          </td>

          <td class="px-5 py-3.5">
            <UiBadge v-if="guest.isCheckedIn" variant="success" icon="pi-check">Checked in</UiBadge>
            <UiBadge v-else variant="muted">Not yet</UiBadge>
          </td>

          <td class="px-5 py-3.5">
            <div class="flex items-center justify-end gap-2 whitespace-nowrap">
              <UiButton
                variant="secondary"
                size="sm"
                :icon="copiedId === guest.id ? 'pi-check' : 'pi-link'"
                @click="copyLink(guest)"
              >
                {{ copiedId === guest.id ? 'Copied' : 'Copy link' }}
              </UiButton>
              <UiButton
                variant="secondary"
                size="sm"
                :icon="downloadingId === guest.id ? 'pi-spinner pi-spin' : 'pi-image'"
                :disabled="downloadingId === guest.id"
                @click="downloadCard(guest)"
              >
                Card image
              </UiButton>
              <UiButton
                v-if="guest.email"
                variant="secondary"
                size="sm"
                icon="pi-envelope"
                @click="sendEmail(guest)"
                >Email</UiButton
              >
              <UiButton variant="danger-ghost" size="sm" icon="pi-trash" @click="removeGuest(guest)"
                >Remove</UiButton
              >
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <UiCard v-else>
    <p class="py-6 text-center text-muted">No guests yet. Add your first guest above.</p>
  </UiCard>
</template>
