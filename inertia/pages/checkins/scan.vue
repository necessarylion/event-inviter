<script setup lang="ts">
import { computed, ref } from 'vue'
import { Head } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import { UiPageHeader } from '~/components/ui'

interface ScanResult {
  status: 'ok' | 'already' | 'invalid' | 'error' | 'camera-error'
  guest?: { name: string; rsvpStatus: string }
  message?: string
}

const props = defineProps<{ event: { id: number; title: string } }>()

const result = ref<ScanResult | null>(null)
const busy = ref(false)
let lastCode = ''
let cooldownUntil = 0

function xsrfToken() {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

async function onDetect(codes: { rawValue: string }[]) {
  const code = codes[0]?.rawValue
  if (!code || busy.value) return
  if (code === lastCode && Date.now() < cooldownUntil) return

  lastCode = code
  cooldownUntil = Date.now() + 3000
  busy.value = true

  try {
    const response = await fetch(`/events/${props.event.id}/check-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': xsrfToken(),
      },
      credentials: 'same-origin',
      body: JSON.stringify({ code }),
    })
    result.value = await response.json()
  } catch {
    result.value = { status: 'error' }
  } finally {
    busy.value = false
  }
}

function onError(error: Error) {
  result.value = { status: 'camera-error', message: error.message }
}

const banner: Record<ScanResult['status'], { tone: string; icon: string; title: string }> = {
  'ok': { tone: 'ok', icon: 'pi-check-circle', title: 'Checked in' },
  'already': { tone: 'warn', icon: 'pi-exclamation-triangle', title: 'Already checked in' },
  'invalid': { tone: 'bad', icon: 'pi-times-circle', title: 'Invalid code' },
  'error': { tone: 'bad', icon: 'pi-times-circle', title: 'Something went wrong' },
  'camera-error': { tone: 'bad', icon: 'pi-video', title: 'Camera error' },
}

const toneClass = computed(() => {
  if (!result.value) return ''
  return {
    ok: 'border-accent-500 bg-accent-50 text-accent-700',
    warn: 'border-warn-500 bg-warn-50 text-warn-700',
    bad: 'border-danger-500 bg-danger-50 text-danger-600',
  }[banner[result.value.status].tone]
})
</script>

<template>
  <Head :title="`Scan · ${event.title}`" />

  <div class="mx-auto max-w-[560px]">
    <UiPageHeader title="Check-in scanner" :subtitle="event.title">
      <template #actions>
        <Link :href="`/events/${event.id}`" class="btn btn-secondary">
          <i class="pi pi-check" /> Done
        </Link>
      </template>
    </UiPageHeader>

    <div class="rounded-card-lg border border-line bg-surface p-6">
      <div class="relative aspect-square overflow-hidden rounded-[18px] bg-slate-900">
        <QrcodeStream @detect="onDetect" @error="onError" />
        <!-- viewfinder corners -->
        <span
          class="pointer-events-none absolute left-[18px] top-[18px] h-9 w-9 rounded-tl-[10px] border-l-[3px] border-t-[3px] border-white/85"
        />
        <span
          class="pointer-events-none absolute right-[18px] top-[18px] h-9 w-9 rounded-tr-[10px] border-r-[3px] border-t-[3px] border-white/85"
        />
        <span
          class="pointer-events-none absolute bottom-[18px] left-[18px] h-9 w-9 rounded-bl-[10px] border-b-[3px] border-l-[3px] border-white/85"
        />
        <span
          class="pointer-events-none absolute bottom-[18px] right-[18px] h-9 w-9 rounded-br-[10px] border-b-[3px] border-r-[3px] border-white/85"
        />
      </div>

      <p class="mt-4 text-center text-[13px] text-muted">
        Point the camera at a guest's invitation QR code.
      </p>
    </div>

    <div
      v-if="result"
      class="mt-5 flex items-start gap-3 rounded-card border p-[18px]"
      :class="toneClass"
    >
      <i :class="['pi', banner[result.status].icon, 'mt-0.5 text-xl']" />
      <div>
        <strong class="text-base">{{ banner[result.status].title }}</strong>
        <div v-if="result.guest" class="mt-1 text-[15px] text-ink">
          {{ result.guest.name }}
          <span class="ml-1 text-muted">· RSVP: {{ result.guest.rsvpStatus }}</span>
        </div>
        <div v-if="result.message" class="mt-1 text-sm opacity-80">{{ result.message }}</div>
      </div>
    </div>
  </div>
</template>
