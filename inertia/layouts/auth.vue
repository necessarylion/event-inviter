<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { usePage } from '@inertiajs/vue3'
import { toast, Toaster } from 'vue-sonner'
import type { Data } from '@generated/data'
import { BrandMark } from '~/components/ui'
import { useTheme } from '~/composables/use_theme'

const page = usePage<Data.SharedProps>()
const { sync } = useTheme()
onMounted(sync)

watch(
  () => page.props.flash,
  (flash) => {
    if (flash?.error) toast.error(flash.error)
    if (flash?.success) toast.success(flash.success)
  },
  { immediate: true }
)

const points = [
  { icon: 'pi-send', text: 'Invite by email, link, or printable card' },
  { icon: 'pi-qrcode', text: 'A unique QR code for every guest' },
  { icon: 'pi-mobile', text: 'Scan to check in — no app for guests' },
]
</script>

<template>
  <div class="grid h-screen bg-surface md:grid-cols-[1fr_1.05fr]">
    <!-- form column — scrollable -->
    <div class="relative flex flex-col overflow-y-auto px-6 py-8 sm:px-10">
      <div class="flex items-center justify-between">
        <!-- "/" is an Edge-rendered page, not an Inertia page — use a plain <a>
             so Inertia does a full page load instead of an XHR visit. -->
        <a href="/" class="btn btn-ghost btn-sm"> <i class="pi pi-arrow-left" /> Home </a>
        <slot name="topbar" />
      </div>

      <div class="flex flex-1 flex-col items-center justify-center py-7">
        <div class="w-full max-w-[396px]">
          <slot />
        </div>
      </div>

      <p class="pt-2.5 text-center text-[13px] text-muted">
        © Guest Invite — QR invitations &amp; guest check-in
      </p>
    </div>

    <!-- brand column -->
    <div
      class="relative hidden flex-col justify-between overflow-hidden p-12 text-white md:flex"
      style="
        background: linear-gradient(
          155deg,
          var(--accent-600) 0%,
          var(--accent-500) 55%,
          color-mix(in srgb, var(--accent-500), #000 12%) 100%
        );
      "
    >
      <div
        class="pointer-events-none absolute -right-32 -top-44 h-[460px] w-[460px] rounded-full bg-white/10"
      />
      <div
        class="pointer-events-none absolute -bottom-48 -left-40 h-[380px] w-[380px] rounded-full bg-white/[0.08]"
      />

      <BrandMark tone="soft" :size="34" class="relative text-white!" />

      <div class="relative flex flex-col items-center gap-9">
        <h2
          class="max-w-[380px] text-white text-center text-[clamp(22px,2.2vw,28px)] font-extrabold leading-tight tracking-tight text-balance"
        >
          From invitation to front door, in one simple flow.
        </h2>

        <!-- floating invite card -->
        <div
          class="relative w-[320px] -rotate-2 rounded-[20px] bg-white p-[22px] text-ink shadow-float"
        >
          <span
            class="absolute -right-5 -top-[18px] inline-flex items-center gap-[7px] rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-accent-700 shadow-[0_18px_40px_-16px_rgba(0,0,0,.4)]"
          >
            <i class="pi pi-check-circle" /> Checked in
          </span>
          <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-700">
            You're invited
          </div>
          <h3 class="my-3 text-[22px] font-extrabold leading-tight tracking-tight text-slate-900">
            Aria's Rooftop Birthday
          </h3>
          <div class="mb-4 flex flex-col gap-[5px] text-[13px] text-slate-600">
            <span class="flex items-center gap-2"
              ><i class="pi pi-calendar w-4 text-accent-600" /> Sat, 28 Jun · 7:00 PM</span
            >
            <span class="flex items-center gap-2"
              ><i class="pi pi-map-marker w-4 text-accent-600" /> Sky Lounge, Downtown</span
            >
          </div>
          <div class="flex items-end justify-between border-t border-slate-200 pt-3.5">
            <div>
              <b class="block text-sm text-slate-900">Jordan Lee</b>
              <span class="text-xs text-slate-500">Admits one</span>
            </div>
            <div
              class="grid h-[76px] w-[76px] place-items-center rounded-[10px] border border-slate-200 bg-white p-1.5"
            >
              <i class="pi pi-qrcode text-5xl text-slate-900" />
            </div>
          </div>
        </div>
      </div>

      <div class="relative flex flex-col gap-3.5">
        <div
          v-for="p in points"
          :key="p.text"
          class="flex items-center gap-3 text-[14.5px] text-white/90"
        >
          <span class="grid h-7 w-7 flex-none place-items-center rounded-lg bg-white/20">
            <i :class="['pi', p.icon, 'text-[13px]']" />
          </span>
          {{ p.text }}
        </div>
      </div>
    </div>
  </div>

  <Toaster position="top-center" rich-colors />
</template>
