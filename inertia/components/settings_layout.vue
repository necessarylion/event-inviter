<script setup lang="ts">
/*
 * Shell for the global (per-user) settings area: a left sidebar of sections
 * plus a content slot. Add a new section by appending to `sections` and giving
 * it a page that renders inside this layout.
 */
import { usePage } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'

const page = usePage()

const sections = [{ label: 'Email', icon: 'pi-envelope', href: '/settings/email' }]

function isActive(href: string) {
  return page.url.startsWith(href)
}
</script>

<template>
  <div class="mx-auto max-w-[920px]">
    <h1 class="mb-6 text-[26px] font-extrabold tracking-tight text-ink">Settings</h1>

    <div class="grid gap-6 md:grid-cols-[200px_1fr]">
      <aside class="md:sticky md:top-24 md:self-start">
        <nav class="flex gap-1 overflow-x-auto md:flex-col">
          <Link
            v-for="section in sections"
            :key="section.href"
            :href="section.href"
            class="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium no-underline transition-colors"
            :class="
              isActive(section.href)
                ? 'bg-surface-2 text-ink'
                : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
            "
          >
            <i :class="['pi', section.icon, 'text-[15px]']" />
            {{ section.label }}
          </Link>
        </nav>
      </aside>

      <div class="min-w-0">
        <slot />
      </div>
    </div>
  </div>
</template>
