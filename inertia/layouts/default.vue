<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { usePage } from '@inertiajs/vue3'
import { toast, Toaster } from 'vue-sonner'
import type { Data } from '@generated/data'
import { Link, Form } from '@adonisjs/inertia/vue'
import { BrandMark } from '~/components/ui'
import { useTheme } from '~/composables/use_theme'

const page = usePage<Data.SharedProps>()
const { isDark, sync, toggleDark } = useTheme()

// Full-bleed pages hide the chrome and let their content own the whole viewport
// (e.g. the card designer, which is a self-contained editor with its own toolbar).
const isFullBleed = computed(() =>
  ['events/card_designer', 'admin/templates/design'].includes(page.component)
)

onMounted(sync)

watch(
  () => page.url,
  () => toast.dismiss()
)

watch(
  () => page.props.flash,
  (flash) => {
    if (flash?.error) toast.error(flash.error)
    if (flash?.success) toast.success(flash.success)
  },
  { immediate: true }
)

function isActive(prefix: string) {
  return page.url.startsWith(prefix)
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-2">
    <header
      v-if="!isFullBleed"
      class="sticky top-0 z-50 border-b border-line bg-[color-mix(in_srgb,var(--bg),transparent_12%)] backdrop-blur-md backdrop-saturate-150"
    >
      <div class="mx-auto flex max-w-[1180px] items-center gap-2 px-7 py-3.5">
        <!-- Logged-in → Inertia dashboard; logged-out → Edge home (plain <a>). -->
        <Link v-if="page.props.user" route="dashboard" class="mr-4 no-underline">
          <BrandMark :size="32" />
        </Link>
        <a v-else href="/" class="mr-4 no-underline">
          <BrandMark :size="32" />
        </a>

        <nav v-if="page.props.user" class="flex items-center gap-1">
          <Link
            route="dashboard"
            class="rounded-[9px] px-3 py-2 text-[15px] font-medium no-underline transition-colors"
            :class="
              isActive('/dashboard') || isActive('/events')
                ? 'bg-surface-2 text-ink'
                : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
            "
          >
            Events
          </Link>
          <Link
            route="email_settings.edit"
            class="rounded-[9px] px-3 py-2 text-[15px] font-medium no-underline transition-colors"
            :class="
              isActive('/settings/email')
                ? 'bg-surface-2 text-ink'
                : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
            "
          >
            Email
          </Link>
          <Link
            v-if="page.props.user?.isAdmin"
            route="admin.templates.index"
            class="rounded-[9px] px-3 py-2 text-[15px] font-medium no-underline transition-colors"
            :class="
              isActive('/admin')
                ? 'bg-surface-2 text-ink'
                : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
            "
          >
            Templates
          </Link>
        </nav>

        <div class="flex-1" />

        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-[10px] border border-line bg-surface text-ink-2 transition-colors hover:text-ink"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDark"
        >
          <i :class="['pi', isDark ? 'pi-sun' : 'pi-moon']" />
        </button>

        <template v-if="page.props.user">
          <Link route="events.create" class="btn btn-primary btn-sm hidden sm:inline-flex">
            <i class="pi pi-plus" /> New event
          </Link>
          <span
            class="grid h-9 w-9 flex-none place-items-center rounded-full bg-accent-500 text-[13px] font-bold text-accent-contrast"
            :title="page.props.user.email ?? undefined"
          >
            {{ page.props.user.initials }}
          </span>
          <Form route="session.destroy">
            <button type="submit" class="btn btn-secondary btn-sm">Logout</button>
          </Form>
        </template>
        <template v-else>
          <Link route="session.create" class="btn btn-ghost btn-sm">Login</Link>
          <Link route="new_account.create" class="btn btn-primary btn-sm">Sign up</Link>
        </template>
      </div>
    </header>

    <main
      :class="
        isFullBleed
          ? 'flex w-full flex-1 flex-col'
          : 'mx-auto w-full max-w-[1180px] flex-1 px-7 pb-20 pt-10'
      "
    >
      <slot />
    </main>
  </div>

  <Toaster position="top-center" rich-colors />
</template>
