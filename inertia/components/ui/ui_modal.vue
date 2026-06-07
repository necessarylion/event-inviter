<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    title?: string
    /** Tailwind max-width class for the panel. */
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  { title: undefined, size: 'md' }
)

const open = defineModel<boolean>({ default: false })

const maxWidth = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

function close() {
  open.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(
  open,
  (isOpen) => {
    if (typeof document === 'undefined') return
    if (isOpen) {
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm sm:p-6"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="translate-y-3 scale-[0.98] opacity-0"
          enter-to-class="translate-y-0 scale-100 opacity-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="translate-y-0 scale-100 opacity-100"
          leave-to-class="translate-y-3 scale-[0.98] opacity-0"
        >
          <div
            v-if="open"
            :class="[
              'my-8 w-full rounded-card border border-line bg-surface shadow-2xl',
              maxWidth[size],
            ]"
            role="dialog"
            aria-modal="true"
          >
            <div
              v-if="title || $slots.header"
              class="flex items-center justify-between gap-3 border-b border-line px-6 py-4"
            >
              <h2 v-if="title" class="text-lg font-bold tracking-tight text-ink">{{ title }}</h2>
              <slot name="header" />
              <button
                type="button"
                class="-mr-1 grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                aria-label="Close"
                @click="close"
              >
                <i class="pi pi-times" />
              </button>
            </div>

            <div class="px-6 py-5">
              <slot />
            </div>

            <div
              v-if="$slots.footer"
              class="flex items-center justify-end gap-3 border-t border-line px-6 py-4"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
