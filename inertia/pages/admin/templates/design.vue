<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { toast } from 'vue-sonner'
import { computed, ref } from 'vue'
import type { Template } from '@pdfme/common'
import CardDesigner from '~/components/card_designer.vue'
import { UiSwitch } from '~/components/ui'

type Preset = { id: number; name: string; isPublished: boolean }

const props = defineProps<{ preset: Preset | null; template: Record<string, any> }>()

const name = ref(props.preset?.name ?? '')
const isPublished = ref(props.preset?.isPublished ?? true)
const saving = ref(false)

// Auto-save (schema only) once the template exists — a brand-new template needs
// one explicit save first to be named and created (which sets `preset`).
const autosaveUrl = computed(() =>
  props.preset ? `/admin/templates/${props.preset.id}/autosave` : undefined
)

function onSave(template: Template) {
  if (!name.value.trim()) {
    toast.error('Give the template a name first.')
    return
  }

  saving.value = true
  const payload = {
    name: name.value.trim(),
    isPublished: isPublished.value,
    template: JSON.stringify(template),
  }
  // Keep the editor mounted (both routes render this same page component) so saving
  // doesn't reset the design — the new-template POST redirects to its edit URL.
  const opts = {
    preserveScroll: true,
    preserveState: true,
    onFinish: () => (saving.value = false),
  }

  if (props.preset) {
    router.put(`/admin/templates/${props.preset.id}`, payload, opts)
  } else {
    router.post('/admin/templates', payload, opts)
  }
}
</script>

<template>
  <Head :title="preset ? 'Edit template' : 'New template'" />

  <CardDesigner
    :initial-template="template"
    :saving="saving"
    :autosave-url="autosaveUrl"
    :download-name="name || 'template'"
    @save="onSave"
  >
    <template #toolbar-start>
      <Link
        href="/admin/templates"
        class="inline-flex flex-none items-center gap-2 text-sm font-medium text-ink-2 no-underline transition-colors hover:text-ink"
      >
        <i class="pi pi-arrow-left" /> Templates
      </Link>

      <span class="mx-1 h-5 w-px flex-none bg-line" />

      <input
        v-model="name"
        type="text"
        placeholder="Template name"
        aria-label="Template name"
        class="h-9 w-48 min-w-0 rounded-[9px] border border-line bg-surface px-3 text-[13px] font-medium text-ink outline-none transition-colors placeholder:text-ink-2 focus:border-accent-500"
      />

      <UiSwitch
        v-model="isPublished"
        class="ml-1 flex-none"
        on-label="Published"
        off-label="Draft"
      />
    </template>
  </CardDesigner>
</template>
