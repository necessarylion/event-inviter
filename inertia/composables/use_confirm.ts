import { reactive, readonly } from 'vue'

export type ConfirmOptions = {
  title: string
  /** Supporting copy shown under the title. */
  message?: string
  /** Label for the confirming action. */
  confirmLabel?: string
  cancelLabel?: string
  /** Style the confirm button as a destructive action. */
  danger?: boolean
  /** Icon (pi class without the `pi-` prefix omitted — pass e.g. `pi-trash`). */
  icon?: string
}

type ConfirmState = ConfirmOptions & {
  open: boolean
}

const state = reactive<ConfirmState>({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: false,
  icon: undefined,
})

let resolver: ((value: boolean) => void) | null = null

/**
 * Imperative confirm dialog. Returns a promise that resolves to `true` when the
 * user confirms and `false` when they cancel or dismiss. A single `<UiConfirm>`
 * host (mounted in the default layout) renders the shared state.
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  // Settle any dialog already in flight as a cancel before opening the next.
  resolver?.(false)

  state.open = true
  state.title = options.title
  state.message = options.message ?? ''
  state.confirmLabel = options.confirmLabel ?? 'Confirm'
  state.cancelLabel = options.cancelLabel ?? 'Cancel'
  state.danger = options.danger ?? false
  state.icon = options.icon

  return new Promise<boolean>((resolve) => {
    resolver = resolve
  })
}

export function useConfirmState() {
  function settle(result: boolean) {
    if (!state.open) return
    state.open = false
    resolver?.(result)
    resolver = null
  }

  return {
    state: readonly(state),
    confirm: () => settle(true),
    cancel: () => settle(false),
  }
}
