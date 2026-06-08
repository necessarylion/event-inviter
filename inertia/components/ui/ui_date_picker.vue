<script setup lang="ts">
/*
 * Themed wrapper around @vuepic/vue-datepicker. Binds a plain wall-clock string
 * in `yyyy-MM-dd'T'HH:mm` form — the same value a native datetime-local input
 * produces — so the existing forms and the VineJS date validator are unchanged.
 * Empty selection is surfaced as '' (not null) to match the string form fields.
 */
import { computed } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { useTheme } from '~/composables/use_theme'

const props = withDefaults(
  defineProps<{
    invalid?: boolean
    placeholder?: string
    enableTimePicker?: boolean
    clearable?: boolean
  }>(),
  { enableTimePicker: true, clearable: true, placeholder: '' }
)

const model = defineModel<string>()
const { isDark } = useTheme()

// vue-datepicker emits null when cleared; keep the bound form field a string.
const inner = computed<string | null>({
  get: () => model.value || null,
  set: (value) => (model.value = value ?? ''),
})
</script>

<template>
  <VueDatePicker
    v-model="inner"
    :dark="isDark"
    model-type="yyyy-MM-dd'T'HH:mm"
    format="EEE, dd MMM yyyy, HH:mm"
    :enable-time-picker="props.enableTimePicker"
    :clearable="props.clearable"
    :placeholder="props.placeholder"
    :input-class-name="props.invalid ? 'dp-invalid' : ''"
    :teleport="true"
    :month-change-on-scroll="false"
    auto-apply
    text-input
  />
</template>
