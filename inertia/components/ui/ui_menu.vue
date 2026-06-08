<script setup lang="ts">
import { onBeforeUnmount, provide, ref, watch } from 'vue'

withDefaults(
  defineProps<{
    /** Trigger label. */
    label?: string
    /** Leading PrimeIcons class on the trigger (e.g. 'pi-ellipsis-h'). */
    icon?: string
    /** Which edge the panel aligns to. */
    align?: 'left' | 'right'
    /** Trigger button variant. */
    variant?: 'primary' | 'secondary' | 'ghost' | 'ink'
  }>(),
  { label: '', icon: undefined, align: 'right', variant: 'secondary' }
)

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const close = () => (open.value = false)
const toggle = () => (open.value = !open.value)

// Let nested <UiMenuItem>s dismiss the menu when activated.
provide('uiMenuClose', close)

function onPointerDown(e: PointerEvent) {
  if (root.value && !root.value.contains(e.target as Node)) close()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(open, (isOpen) => {
  const bind = isOpen ? document.addEventListener : document.removeEventListener
  bind.call(document, 'pointerdown', onPointerDown as EventListener)
  bind.call(document, 'keydown', onKey as EventListener)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown as EventListener)
  document.removeEventListener('keydown', onKey as EventListener)
})
</script>

<template>
  <div ref="root" class="ui-menu" :data-open="open">
    <!-- Custom trigger (e.g. an avatar). Falls back to the default button. -->
    <button
      v-if="$slots.trigger"
      type="button"
      class="ui-menu__trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="toggle"
    >
      <slot name="trigger" :open="open" />
    </button>
    <button
      v-else
      type="button"
      class="btn"
      :class="`btn-${variant}`"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="toggle"
    >
      <i v-if="icon" :class="['pi', icon]" />
      <span v-if="label">{{ label }}</span>
      <i class="pi pi-chevron-down ui-menu__chev" />
    </button>

    <Transition name="ui-menu-pop">
      <div v-if="open" class="ui-menu__panel" :class="`ui-menu__panel--${align}`" role="menu">
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>
