<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost' | 'ink'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
    disabled?: boolean
    block?: boolean
    /** When set, renders an <a> instead of a <button>. */
    href?: string
    icon?: string
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    loading: false,
    disabled: false,
    block: false,
    href: undefined,
    icon: undefined,
  }
)

const classes = computed(() => [
  'btn',
  `btn-${props.variant}`,
  props.size === 'sm' && 'btn-sm',
  props.size === 'lg' && 'btn-lg',
  props.block && 'btn-block',
])
</script>

<template>
  <a v-if="href" :href="href" :class="classes" :aria-disabled="disabled || undefined">
    <span v-if="loading" class="spin" />
    <i v-else-if="icon" :class="['pi', icon]" />
    <slot />
  </a>
  <button v-else :type="type" :class="classes" :disabled="disabled || loading">
    <span v-if="loading" class="spin" />
    <i v-else-if="icon" :class="['pi', icon]" />
    <slot />
  </button>
</template>
