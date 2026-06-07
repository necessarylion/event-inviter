import { ref } from 'vue'

/**
 * App theme controls. Colour + fonts live in inertia/css/theme.css — this only
 * toggles the runtime switches it exposes:
 *   • dark mode  → <html data-theme="dark">
 *   • accent     → <html data-accent="violet|rose|sky">  (omit for the emerald default)
 * Both persist to localStorage and are re-applied on boot (see inertia_layout.edge).
 */
export type Accent = 'emerald' | 'violet' | 'rose' | 'sky'

const isDark = ref(false)
const accent = ref<Accent>('emerald')

function apply() {
  const root = document.documentElement
  root.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  if (accent.value === 'emerald') root.removeAttribute('data-accent')
  else root.setAttribute('data-accent', accent.value)
}

export function useTheme() {
  function sync() {
    isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
    accent.value = (document.documentElement.getAttribute('data-accent') as Accent) || 'emerald'
  }

  function toggleDark() {
    isDark.value = !isDark.value
    localStorage.setItem('ei-theme', isDark.value ? 'dark' : 'light')
    apply()
  }

  function setAccent(value: Accent) {
    accent.value = value
    localStorage.setItem('ei-accent', value)
    apply()
  }

  return { isDark, accent, sync, toggleDark, setAccent }
}
