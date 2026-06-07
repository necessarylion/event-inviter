<script setup lang="ts">
/*
 * A labeled on/off toggle that makes the current state obvious: the track turns
 * green when on and the label reads the active state (e.g. "Published" / "Draft").
 */
const model = defineModel<boolean>()
withDefaults(defineProps<{ onLabel?: string; offLabel?: string }>(), {
  onLabel: 'On',
  offLabel: 'Off',
})
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    class="inline-flex cursor-pointer items-center gap-2"
    @click="model = !model"
  >
    <span
      class="relative inline-flex h-5 w-9 flex-none items-center rounded-full transition-colors"
      :class="model ? 'bg-accent-500' : 'bg-line'"
    >
      <span
        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
        :class="model ? 'translate-x-[18px]' : 'translate-x-0.5'"
      />
    </span>
    <span class="text-[13px] font-medium" :class="model ? 'text-accent-600' : 'text-warn-700'">
      {{ model ? onLabel : offLabel }}
    </span>
  </button>
</template>
