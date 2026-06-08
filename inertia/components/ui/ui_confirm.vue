<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import UiButton from './ui_button.vue'
import { useConfirmState } from '~/composables/use_confirm'

const { state, confirm, cancel } = useConfirmState()

function onKeydown(e: KeyboardEvent) {
  if (!state.open) return
  if (e.key === 'Escape') cancel()
  if (e.key === 'Enter') confirm()
}

watch(
  () => state.open,
  (isOpen) => {
    if (typeof document === 'undefined') return
    if (isOpen) {
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  }
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
        v-if="state.open"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
        @click.self="cancel"
      >
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="translate-y-3 scale-[0.97] opacity-0"
          enter-to-class="translate-y-0 scale-100 opacity-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="translate-y-0 scale-100 opacity-100"
          leave-to-class="translate-y-3 scale-[0.97] opacity-0"
        >
          <div
            v-if="state.open"
            class="w-full max-w-md rounded-[20px] border border-line bg-surface p-7 shadow-2xl"
            role="alertdialog"
            aria-modal="true"
            :aria-label="state.title"
          >
            <div class="flex items-start gap-4">
              <div
                v-if="state.icon"
                class="grid h-11 w-11 flex-none place-items-center rounded-full"
                :class="
                  state.danger ? 'bg-danger-50 text-danger-500' : 'bg-accent-50 text-accent-600'
                "
              >
                <i :class="['pi', state.icon, 'text-lg']" />
              </div>
              <div class="min-w-0 flex-1">
                <h2 class="text-[22px] font-extrabold leading-tight tracking-tight text-ink">
                  {{ state.title }}
                </h2>
                <p v-if="state.message" class="mt-2 text-[15px] leading-relaxed text-muted">
                  {{ state.message }}
                </p>
              </div>
            </div>

            <div class="mt-6 flex items-center justify-end gap-3">
              <UiButton variant="secondary" @click="cancel">{{ state.cancelLabel }}</UiButton>
              <UiButton :variant="state.danger ? 'danger' : 'primary'" @click="confirm">
                {{ state.confirmLabel }}
              </UiButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
