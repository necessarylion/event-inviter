<script setup lang="ts">
import { computed, ref } from 'vue'
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
  UiTooltip,
  UiMenu,
  UiMenuItem,
} from '~/components/ui'
import { useCardImage } from '~/composables/use_card_image'
import { confirm } from '~/composables/use_confirm'

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
  location: string | null
  startsAt: string | null
}
type Stats = { total: number; confirmed: number; declined: number; checkedIn: number }

const props = defineProps<{ event: EventData; guests: GuestRow[]; stats: Stats }>()

const search = ref('')
const filteredGuests = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.guests
  return props.guests.filter((g) =>
    [g.name, g.email, g.phone].some((field) => field?.toLowerCase().includes(q))
  )
})

const copiedId = ref<number | null>(null)
const downloadingId = ref<number | null>(null)
const sharingId = ref<number | null>(null)
const checkingInId = ref<number | null>(null)
const { renderCardImage, downloadCardImage } = useCardImage()
const canShareFiles = typeof navigator !== 'undefined' && !!navigator.canShare && !!navigator.share

const addOpen = ref(false)
const guestForm = useForm<{ guests: GuestDraft[] }>({ guests: [emptyRow()] })
const csvInput = ref<HTMLInputElement | null>(null)

function openAddGuests() {
  guestForm.reset()
  guestForm.clearErrors()
  guestForm.guests = [emptyRow()]
  addOpen.value = true
}

function addRow() {
  guestForm.guests.push(emptyRow())
}

/**
 * Parse CSV text into guest rows. Recognises a header row containing any of
 * name/email/phone (in any order) and maps columns accordingly; otherwise
 * falls back to positional columns (name, email, phone).
 */
function parseCsv(text: string): GuestDraft[] {
  const rows = parseCsvRows(text).filter((cells) => cells.some((c) => c.trim() !== ''))
  if (rows.length === 0) return []

  const header = rows[0].map((c) => c.trim().toLowerCase())
  const has = (k: string) => header.some((h) => h === k || h.startsWith(k))
  let nameIdx = 0
  let emailIdx = 1
  let phoneIdx = 2
  let body = rows

  if (has('name') || has('email') || has('phone')) {
    const find = (...keys: string[]) =>
      header.findIndex((h) => keys.some((k) => h === k || h.startsWith(k)))
    nameIdx = find('name', 'full name')
    emailIdx = find('email', 'e-mail')
    phoneIdx = find('phone', 'mobile', 'tel')
    body = rows.slice(1)
  }

  const at = (cells: string[], idx: number) => (idx >= 0 ? (cells[idx] ?? '').trim() : '')
  return body
    .map((cells) => ({
      name: at(cells, nameIdx),
      email: at(cells, emailIdx),
      phone: at(cells, phoneIdx),
    }))
    .filter((g) => g.name !== '' || g.email !== '' || g.phone !== '')
}

/**
 * Minimal RFC-4180-ish CSV parser: handles quoted fields, escaped quotes
 * (""), and both LF and CRLF line endings.
 */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function onCsvSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const parsed = parseCsv(String(reader.result ?? ''))
    if (parsed.length === 0) {
      toast.error('No guests found in that CSV file.')
    } else {
      // Drop the leading empty row if the form is still untouched.
      const existing = guestForm.guests.filter((g) => g.name.trim() !== '' || g.email.trim() !== '')
      guestForm.guests = [...existing, ...parsed].slice(0, 1000)
      guestForm.clearErrors()
      toast.success(`${parsed.length} guest${parsed.length === 1 ? '' : 's'} loaded from CSV.`)
    }
  }
  reader.onerror = () => toast.error('Could not read that file.')
  reader.readAsText(file)
  input.value = ''
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

async function shareCard(guest: GuestRow) {
  if (sharingId.value) return
  sharingId.value = guest.id
  try {
    const blob = await renderCardImage(`/events/${props.event.id}/guests/${guest.id}/card.pdf`)
    const file = new File(
      [blob],
      `invitation-${guest.name.replace(/\s+/g, '-').toLowerCase()}.png`,
      { type: 'image/png' }
    )
    let text = `You are invited to ${props.event.title}`
    if (guest.inviteUrl) text += `\n${guest.inviteUrl}`

    if (canShareFiles && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text })
    } else {
      // Fallback for browsers without file-share support: download the card.
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Sharing not supported here — card downloaded instead.')
    }
  } catch (err) {
    // Ignore user-cancelled shares; surface real failures.
    if ((err as Error)?.name !== 'AbortError') {
      toast.error('Could not share the invitation.')
    }
  } finally {
    sharingId.value = null
  }
}

function toggleCheckIn(guest: GuestRow) {
  if (checkingInId.value) return
  checkingInId.value = guest.id
  router.post(
    `/events/${props.event.id}/guests/${guest.id}/check-in`,
    {},
    {
      preserveScroll: true,
      onFinish: () => (checkingInId.value = null),
    }
  )
}

async function removeGuest(guest: GuestRow) {
  const ok = await confirm({
    title: `Remove ${guest.name}?`,
    message: "They'll be taken off the guest list and their invite link will stop working.",
    confirmLabel: 'Remove guest',
    danger: true,
    icon: 'pi-user-minus',
  })
  if (!ok) return
  router.delete(`/events/${props.event.id}/guests/${guest.id}`, { preserveScroll: true })
}

async function deleteEvent() {
  const ok = await confirm({
    title: 'Delete this event?',
    message: 'The event and all its guests will be permanently deleted. This cannot be undone.',
    confirmLabel: 'Delete event',
    danger: true,
    icon: 'pi-trash',
  })
  if (!ok) return
  router.delete(`/events/${props.event.id}`)
}

function formatDate(iso: string | null) {
  return iso ? DateTime.fromISO(iso).setZone('UTC').toFormat('cccc, dd LLL yyyy • t') : 'Date TBD'
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
      <UiMenu label="More" icon="pi-ellipsis-h">
        <UiMenuItem :href="`/events/${event.id}/card`" icon="pi-palette">Card designer</UiMenuItem>
        <UiMenuItem :href="`/events/${event.id}/edit`" icon="pi-pencil">Edit event</UiMenuItem>
        <UiMenuItem :href="`/events/${event.id}/settings`" icon="pi-cog">Event settings</UiMenuItem>
        <div class="ui-menu__sep" />
        <UiMenuItem icon="pi-trash" danger @click="deleteEvent">Delete event</UiMenuItem>
      </UiMenu>
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

      <div class="flex flex-wrap gap-2">
        <UiButton variant="secondary" icon="pi-plus" @click="addRow">Add another guest</UiButton>
        <UiButton variant="secondary" icon="pi-upload" @click="csvInput?.click()">
          Import CSV
        </UiButton>
        <input
          ref="csvInput"
          type="file"
          accept=".csv,text/csv"
          class="hidden"
          @change="onCsvSelected"
        />
      </div>
      <p class="text-xs text-muted">
        CSV columns: <span class="font-semibold">name</span>, email, phone (a header row is
        optional).
      </p>
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
  <div class="mb-3.5 mt-8 flex flex-wrap items-center justify-between gap-3">
    <h2 class="text-[22px] font-extrabold tracking-tight text-ink">Guest list</h2>
    <div v-if="guests.length" class="relative w-full sm:w-72">
      <i
        class="pi pi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted"
      />
      <UiInput v-model="search" class="pl-9!" placeholder="Search by name, email, or phone" />
    </div>
  </div>

  <div
    v-if="filteredGuests.length"
    class="hidden overflow-x-auto rounded-card border border-line bg-surface md:block"
  >
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
        <tr
          v-for="guest in filteredGuests"
          :key="guest.id"
          class="border-b border-line last:border-b-0"
        >
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
            <div class="flex items-center gap-2">
              <UiBadge v-if="guest.isCheckedIn" variant="success" icon="pi-check"
                >Checked in</UiBadge
              >
              <UiBadge v-else variant="muted">Not yet</UiBadge>
              <UiTooltip :label="guest.isCheckedIn ? 'Undo check-in' : 'Check in'">
                <UiButton
                  variant="secondary"
                  size="sm"
                  :aria-label="guest.isCheckedIn ? 'Undo check-in' : 'Check in'"
                  :icon="
                    checkingInId === guest.id
                      ? 'pi-spinner pi-spin'
                      : guest.isCheckedIn
                        ? 'pi-replay'
                        : 'pi-check-circle'
                  "
                  :disabled="checkingInId === guest.id"
                  @click="toggleCheckIn(guest)"
                />
              </UiTooltip>
            </div>
          </td>

          <td class="px-5 py-3.5">
            <div class="flex items-center justify-end gap-2 whitespace-nowrap">
              <UiTooltip :label="copiedId === guest.id ? 'Copied' : 'Copy link'">
                <UiButton
                  variant="secondary"
                  size="sm"
                  :aria-label="copiedId === guest.id ? 'Copied' : 'Copy link'"
                  :icon="copiedId === guest.id ? 'pi-check' : 'pi-link'"
                  @click="copyLink(guest)"
                />
              </UiTooltip>
              <UiTooltip label="Download invitation">
                <UiButton
                  variant="secondary"
                  size="sm"
                  aria-label="Download invitation"
                  :icon="downloadingId === guest.id ? 'pi-spinner pi-spin' : 'pi-download'"
                  :disabled="downloadingId === guest.id"
                  @click="downloadCard(guest)"
                />
              </UiTooltip>
              <UiTooltip label="Share invitation">
                <UiButton
                  variant="secondary"
                  size="sm"
                  aria-label="Share invitation"
                  :icon="sharingId === guest.id ? 'pi-spinner pi-spin' : 'pi-share-alt'"
                  :disabled="sharingId === guest.id"
                  @click="shareCard(guest)"
                />
              </UiTooltip>
              <UiTooltip v-if="guest.email" label="Send email invite">
                <UiButton
                  variant="secondary"
                  size="sm"
                  aria-label="Send email invite"
                  icon="pi-envelope"
                  @click="sendEmail(guest)"
                />
              </UiTooltip>
              <UiButton variant="danger-ghost" size="sm" icon="pi-trash" @click="removeGuest(guest)"
                >Remove</UiButton
              >
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- guest list (mobile cards) -->
  <div v-if="filteredGuests.length" class="flex flex-col gap-3 md:hidden">
    <div
      v-for="guest in filteredGuests"
      :key="guest.id"
      class="rounded-card border border-line bg-surface p-4"
    >
      <div class="flex items-start gap-3">
        <UiAvatar :name="guest.name" />
        <div class="min-w-0 flex-1">
          <p class="truncate font-semibold text-ink">{{ guest.name }}</p>
          <p class="truncate text-sm text-ink">{{ guest.email || '—' }}</p>
          <p v-if="guest.phone" class="truncate text-[13px] text-muted">{{ guest.phone }}</p>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2">
        <UiBadge :variant="rsvpVariant(guest.rsvpStatus)">{{ guest.rsvpStatus }}</UiBadge>
        <UiBadge v-if="guest.isCheckedIn" variant="success" icon="pi-check">Checked in</UiBadge>
        <UiBadge v-else variant="muted">Not yet</UiBadge>
      </div>

      <div class="mt-3.5 grid grid-cols-2 gap-2 border-t border-line pt-3.5">
        <UiButton
          :variant="guest.isCheckedIn ? 'secondary' : 'primary'"
          size="sm"
          block
          class="col-span-2"
          :icon="
            checkingInId === guest.id
              ? 'pi-spinner pi-spin'
              : guest.isCheckedIn
                ? 'pi-replay'
                : 'pi-check-circle'
          "
          :disabled="checkingInId === guest.id"
          @click="toggleCheckIn(guest)"
        >
          {{ guest.isCheckedIn ? 'Undo check-in' : 'Check in' }}
        </UiButton>
        <UiTooltip block :label="copiedId === guest.id ? 'Copied' : 'Copy link'">
          <UiButton
            variant="secondary"
            size="sm"
            block
            :aria-label="copiedId === guest.id ? 'Copied' : 'Copy link'"
            :icon="copiedId === guest.id ? 'pi-check' : 'pi-link'"
            @click="copyLink(guest)"
          />
        </UiTooltip>
        <UiTooltip block label="Download invitation">
          <UiButton
            variant="secondary"
            size="sm"
            block
            aria-label="Download invitation"
            :icon="downloadingId === guest.id ? 'pi-spinner pi-spin' : 'pi-download'"
            :disabled="downloadingId === guest.id"
            @click="downloadCard(guest)"
          />
        </UiTooltip>
        <UiTooltip block label="Share invitation">
          <UiButton
            variant="secondary"
            size="sm"
            block
            aria-label="Share invitation"
            :icon="sharingId === guest.id ? 'pi-spinner pi-spin' : 'pi-share-alt'"
            :disabled="sharingId === guest.id"
            @click="shareCard(guest)"
          />
        </UiTooltip>
        <UiTooltip v-if="guest.email" block label="Send email invite">
          <UiButton
            variant="secondary"
            size="sm"
            block
            aria-label="Send email invite"
            icon="pi-envelope"
            @click="sendEmail(guest)"
          />
        </UiTooltip>
        <UiButton variant="danger-ghost" size="sm" block icon="pi-trash" @click="removeGuest(guest)"
          >Remove</UiButton
        >
      </div>
    </div>
  </div>

  <UiCard v-else>
    <p v-if="guests.length" class="py-6 text-center text-muted">No guests match “{{ search }}”.</p>
    <p v-else class="py-6 text-center text-muted">No guests yet. Add your first guest above.</p>
  </UiCard>
</template>
