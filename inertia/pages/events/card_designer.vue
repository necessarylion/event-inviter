<script setup lang="ts">
import { Head, router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { ref } from 'vue'
import type { Template } from '@pdfme/common'
import CardDesigner from '~/components/card_designer.vue'
import CardTemplateThumb from '~/components/card_template_thumb.vue'

type Preset = { id: number; name: string; template: Record<string, any> }

// `template` arrives as a plain JSON object (Inertia prop); cast to pdfme's Template.
const props = defineProps<{
  event: { id: number; title: string }
  template: Record<string, any>
  presets: Preset[]
}>()

const designerRef = ref<InstanceType<typeof CardDesigner> | null>(null)
const saving = ref(false)
const drawerOpen = ref(false)

function applyTemplate(choice: Preset) {
  const ok = window.confirm(
    `Replace the current design with the "${choice.name}" template? Unsaved changes will be lost.`
  )
  if (!ok) return
  designerRef.value?.applyTemplate(choice.template)
  drawerOpen.value = false
}

function onSave(template: Template) {
  saving.value = true
  router.put(
    `/events/${props.event.id}/card`,
    { template: JSON.stringify(template) },
    { preserveScroll: true, preserveState: true, onFinish: () => (saving.value = false) }
  )
}
</script>

<template>
  <Head title="Card designer" />

  <CardDesigner ref="designerRef" :initial-template="template" :saving="saving" @save="onSave">
    <template #toolbar-start>
      <Link
        :href="`/events/${event.id}`"
        class="inline-flex items-center gap-2 text-sm font-medium text-ink-2 no-underline transition-colors hover:text-ink"
      >
        <i class="pi pi-arrow-left" /> Back to event
      </Link>
    </template>

    <template #toolbar-extra>
      <!-- Pre-defined templates -->
      <button
        type="button"
        class="inline-flex h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded-[9px] border border-line bg-surface px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface-2"
        @click="drawerOpen = true"
      >
        <i class="pi pi-clone text-ink-2" /> Templates
      </button>

      <span class="mx-1 h-5 w-px bg-line" />
    </template>
  </CardDesigner>

  <!-- Template picker: right slide-over drawer -->
  <Transition name="drawer">
    <div v-if="drawerOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/30" @click="drawerOpen = false" />
      <aside
        class="absolute inset-y-0 right-0 flex w-[360px] max-w-[90vw] flex-col border-l border-line bg-surface shadow-2xl"
      >
        <div class="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <h2 class="text-sm font-semibold text-ink">Templates</h2>
            <p class="text-xs text-ink-2">Pick a starter design for this card.</p>
          </div>
          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label="Close"
            @click="drawerOpen = false"
          >
            <i class="pi pi-times" />
          </button>
        </div>

        <div v-if="presets.length" class="grid grid-cols-2 gap-4 overflow-y-auto p-4">
          <button
            v-for="t in presets"
            :key="t.id"
            type="button"
            class="group flex flex-col items-center gap-2"
            @click="applyTemplate(t)"
          >
            <div
              class="overflow-hidden rounded-md ring-1 ring-line transition group-hover:ring-2 group-hover:ring-accent-500"
            >
              <CardTemplateThumb :template="t.template" :width="150" />
            </div>
            <span class="text-xs font-medium text-ink-2 group-hover:text-ink">{{ t.name }}</span>
          </button>
        </div>

        <div v-else class="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <i class="pi pi-clone text-2xl text-ink-2" />
          <p class="text-sm font-medium text-ink">No templates yet</p>
          <p class="text-xs text-ink-2">
            System templates appear here once an admin publishes them.
          </p>
        </div>
      </aside>
    </div>
  </Transition>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-active aside,
.drawer-leave-active aside {
  transition: transform 0.25s ease;
}
.drawer-enter-from aside,
.drawer-leave-to aside {
  transform: translateX(100%);
}
</style>
