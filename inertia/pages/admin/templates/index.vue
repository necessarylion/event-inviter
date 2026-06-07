<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { toast } from 'vue-sonner'
import { ref } from 'vue'
import { UiPageHeader, UiButton, UiEmpty, UiSwitch } from '~/components/ui'
import CardTemplateThumb from '~/components/card_template_thumb.vue'

type Preset = {
  id: number
  name: string
  description: string | null
  isPublished: boolean
  width: number
  height: number
  template: Record<string, any>
  previewImage: string | null
}

defineProps<{ presets: Preset[] }>()

const importInput = ref<HTMLInputElement | null>(null)
const importing = ref(false)

/**
 * Import a template from a JSON file exported by the designer's Download button.
 * Accepts either our wrapper (`{ name, template }`) or a bare pdfme template
 * (`{ basePdf, schemas }`), then POSTs to the normal create route — which
 * validates the QR field and drops the admin into the designer on the new record.
 */
async function onImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const parsed = JSON.parse(await file.text())
    const template = parsed?.schemas ? parsed : parsed?.template
    if (!template || !Array.isArray(template.schemas)) {
      throw new Error('not a template file')
    }

    const fallback = file.name.replace(/\.json$/i, '').slice(0, 150)
    const name =
      (typeof parsed?.name === 'string' && parsed.name.trim()) || fallback || 'Imported template'

    importing.value = true
    router.post(
      '/admin/templates',
      { name, isPublished: false, template: JSON.stringify(template) },
      { onFinish: () => (importing.value = false) }
    )
  } catch {
    toast.error('That file is not a valid template export.')
  } finally {
    input.value = ''
  }
}

function togglePublish(preset: Preset) {
  router.put(`/admin/templates/${preset.id}/publish`, {}, { preserveScroll: true })
}

function destroy(preset: Preset) {
  if (!window.confirm(`Delete the "${preset.name}" template? This can't be undone.`)) return
  router.delete(`/admin/templates/${preset.id}`, { preserveScroll: true })
}
</script>

<template>
  <Head title="System templates" />

  <UiPageHeader
    title="System templates"
    subtitle="Card designs organizers can pick as a starting point."
  >
    <template #actions>
      <input
        ref="importInput"
        type="file"
        accept="application/json,.json"
        class="hidden"
        @change="onImport"
      />
      <UiButton
        variant="secondary"
        icon="pi-upload"
        :loading="importing"
        @click="importInput?.click()"
      >
        Import template
      </UiButton>
      <UiButton href="/admin/templates/new" icon="pi-plus">New template</UiButton>
    </template>
  </UiPageHeader>

  <UiEmpty
    v-if="!presets.length"
    icon="pi-clone"
    title="No templates yet"
    description="Create your first system template — organizers will be able to choose it when designing their event cards."
  >
    <UiButton href="/admin/templates/new" icon="pi-plus">New template</UiButton>
  </UiEmpty>

  <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
    <div
      v-for="preset in presets"
      :key="preset.id"
      class="flex flex-col overflow-hidden rounded-card border border-line bg-surface"
    >
      <Link
        :href="`/admin/templates/${preset.id}/edit`"
        class="grid h-60 place-items-center border-b border-line bg-surface-2 p-4 no-underline"
      >
        <div class="overflow-hidden rounded-md ring-1 ring-line">
          <CardTemplateThumb
            :template="preset.template"
            :image="preset.previewImage"
            :width="170"
            :max-height="192"
          />
        </div>
      </Link>

      <div class="flex flex-1 flex-col gap-1 p-4">
        <h3 class="truncate text-sm font-semibold text-ink">{{ preset.name }}</h3>
        <p v-if="preset.description" class="line-clamp-2 text-xs text-ink-2">
          {{ preset.description }}
        </p>
        <div class="mt-auto flex items-center justify-between gap-2 pt-3">
          <UiSwitch
            :model-value="preset.isPublished"
            on-label="Published"
            off-label="Draft"
            @update:model-value="togglePublish(preset)"
          />
          <span class="text-[11px] text-ink-2">{{ preset.width }} × {{ preset.height }} mm</span>
        </div>
      </div>

      <div class="flex items-center gap-2 border-t border-line px-4 py-3">
        <UiButton
          :href="`/admin/templates/${preset.id}/edit`"
          variant="secondary"
          size="sm"
          icon="pi-pencil"
        >
          Edit
        </UiButton>
        <button
          type="button"
          class="ml-auto grid h-8 w-8 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-danger-50 hover:text-danger-600"
          aria-label="Delete template"
          @click="destroy(preset)"
        >
          <i class="pi pi-trash" />
        </button>
      </div>
    </div>
  </div>
</template>
