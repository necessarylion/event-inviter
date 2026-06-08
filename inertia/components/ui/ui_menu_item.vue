<script setup lang="ts">
import { inject } from 'vue'
import { Link } from '@adonisjs/inertia/vue'

withDefaults(
  defineProps<{
    /** When set, the item navigates via Inertia <Link>; otherwise it's a button. */
    href?: string
    /** Leading PrimeIcons class (e.g. 'pi-pencil'). */
    icon?: string
    /** Render as a destructive action. */
    danger?: boolean
  }>(),
  { href: undefined, icon: undefined, danger: false }
)

// Dismiss the parent menu when this item is activated. A caller's own @click
// (e.g. @click="deleteEvent") falls through and runs alongside this handler.
const closeMenu = inject<() => void>('uiMenuClose', () => {})
</script>

<template>
  <component
    :is="href ? Link : 'button'"
    :href="href || undefined"
    :type="href ? undefined : 'button'"
    class="ui-menu__item"
    :class="{ 'ui-menu__item--danger': danger }"
    role="menuitem"
    @click="closeMenu"
  >
    <i v-if="icon" :class="['pi', icon]" />
    <slot />
  </component>
</template>
