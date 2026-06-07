<script setup lang="ts">
import { DateTime } from 'luxon'
import { Head, router, useForm } from '@inertiajs/vue3'
import {
  UiButton,
  UiCard,
  UiField,
  UiInput,
  UiSelect,
  UiCheckbox,
  UiBadge,
  UiPageHeader,
} from '~/components/ui'

type Setting = {
  provider: string
  fromEmail: string
  fromName: string | null
  isVerified: boolean
  lastTestedAt: string | null
}
type Config = {
  host: string
  port: number
  secure: boolean
  username: string
  region: string
  accessKeyId: string
  hasSecret: boolean
}

const props = defineProps<{ setting: Setting | null; config: Config | null }>()

const form = useForm({
  provider: props.setting?.provider ?? 'smtp',
  fromEmail: props.setting?.fromEmail ?? '',
  fromName: props.setting?.fromName ?? '',
  host: props.config?.host ?? '',
  port: props.config?.port ?? 587,
  secure: props.config?.secure ?? false,
  username: props.config?.username ?? '',
  password: '',
  apiKey: '',
  region: props.config?.region ?? '',
  accessKeyId: props.config?.accessKeyId ?? '',
  secretAccessKey: '',
})

const secretPlaceholder = props.config?.hasSecret ? '•••••••• (leave blank to keep)' : ''

function save() {
  form.put('/settings/email', { preserveScroll: true })
}

function sendTest() {
  router.post('/settings/email/test', {}, { preserveScroll: true })
}

function formatDate(iso: string | null) {
  return iso ? DateTime.fromISO(iso).toFormat('dd LLL yyyy, t') : null
}
</script>

<template>
  <Head title="Email settings" />

  <div class="mx-auto max-w-[680px]">
    <UiPageHeader
      title="Email settings"
      subtitle="Send invitations from your own email provider. Leave blank to use the system default."
    >
      <template #actions>
        <UiBadge v-if="setting" :variant="setting.isVerified ? 'accent' : 'warn'">
          {{ setting.isVerified ? 'Verified' : 'Not verified' }}
        </UiBadge>
      </template>
    </UiPageHeader>

    <UiCard>
      <form class="flex flex-col gap-[18px]" @submit.prevent="save">
        <UiField label="Provider" for="provider">
          <UiSelect id="provider" v-model="form.provider">
            <option value="smtp">SMTP</option>
            <option value="resend">Resend</option>
            <option value="ses">Amazon SES</option>
          </UiSelect>
        </UiField>

        <div class="grid gap-[18px] sm:grid-cols-2">
          <UiField label="From email" for="fromEmail" :error="form.errors.fromEmail">
            <UiInput
              id="fromEmail"
              v-model="form.fromEmail"
              type="email"
              :invalid="!!form.errors.fromEmail"
            />
          </UiField>
          <UiField label="From name" for="fromName" optional>
            <UiInput id="fromName" v-model="form.fromName" />
          </UiField>
        </div>

        <!-- SMTP -->
        <template v-if="form.provider === 'smtp'">
          <div class="grid gap-[18px] sm:grid-cols-2">
            <UiField label="SMTP host" for="host" :error="form.errors.host">
              <UiInput id="host" v-model="form.host" :invalid="!!form.errors.host" />
            </UiField>
            <UiField label="Port" for="port" :error="form.errors.port">
              <UiInput
                id="port"
                v-model.number="form.port"
                type="number"
                :invalid="!!form.errors.port"
              />
            </UiField>
          </div>
          <div class="grid gap-[18px] sm:grid-cols-2">
            <UiField label="Username" for="username" optional>
              <UiInput id="username" v-model="form.username" autocomplete="off" />
            </UiField>
            <UiField label="Password" for="password">
              <UiInput
                id="password"
                v-model="form.password"
                type="password"
                autocomplete="new-password"
                :placeholder="secretPlaceholder"
              />
            </UiField>
          </div>
          <UiCheckbox v-model="form.secure">Use TLS/SSL (secure connection)</UiCheckbox>
        </template>

        <!-- Resend -->
        <template v-else-if="form.provider === 'resend'">
          <UiField label="Resend API key" for="apiKey" :error="form.errors.apiKey">
            <UiInput
              id="apiKey"
              v-model="form.apiKey"
              type="password"
              autocomplete="off"
              :placeholder="secretPlaceholder"
              :invalid="!!form.errors.apiKey"
            />
          </UiField>
        </template>

        <!-- SES -->
        <template v-else-if="form.provider === 'ses'">
          <div class="grid gap-[18px] sm:grid-cols-2">
            <UiField label="AWS region" for="region" :error="form.errors.region">
              <UiInput
                id="region"
                v-model="form.region"
                placeholder="us-east-1"
                :invalid="!!form.errors.region"
              />
            </UiField>
            <UiField label="Access key ID" for="accessKeyId">
              <UiInput id="accessKeyId" v-model="form.accessKeyId" autocomplete="off" />
            </UiField>
          </div>
          <UiField label="Secret access key" for="secretAccessKey">
            <UiInput
              id="secretAccessKey"
              v-model="form.secretAccessKey"
              type="password"
              autocomplete="off"
              :placeholder="secretPlaceholder"
            />
          </UiField>
        </template>

        <div class="mt-2 flex flex-wrap items-center gap-3">
          <UiButton type="submit" :loading="form.processing" icon="pi-check"
            >Save settings</UiButton
          >
          <UiButton v-if="setting" variant="secondary" icon="pi-send" @click="sendTest"
            >Send test email</UiButton
          >
          <span v-if="setting?.lastTestedAt" class="text-sm text-muted">
            Last tested {{ formatDate(setting.lastTestedAt) }}
          </span>
        </div>
      </form>
    </UiCard>
  </div>
</template>
