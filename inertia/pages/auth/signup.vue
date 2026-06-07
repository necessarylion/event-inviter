<script setup lang="ts">
import { computed, ref } from 'vue'
import { Head } from '@inertiajs/vue3'
import { Link, Form } from '@adonisjs/inertia/vue'
import AuthLayout from '~/layouts/auth.vue'
import { UiButton, UiField, SocialAuth } from '~/components/ui'

defineOptions({ layout: AuthLayout })

const showPassword = ref(false)
const password = ref('')

const strength = computed(() => {
  const v = password.value
  let score = 0
  if (v.length >= 8) score++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++
  if (/\d/.test(v)) score++
  if (/[^A-Za-z0-9]/.test(v)) score++
  return score
})
const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['#e2e8f0', '#f59e0b', '#f59e0b', '#10b981', '#10b981']
</script>

<template>
  <Head title="Sign up" />

  <div>
    <div class="mb-7">
      <span
        class="mb-4 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-accent-500/20 bg-accent-50 px-3.5 py-1.75 text-[13px] font-semibold text-accent-700"
      >
        <span class="h-1.75 w-1.75 rounded-full bg-accent-500" /> Free to start
      </span>
      <h1 class="mb-2 text-2xl font-extrabold leading-tight tracking-tight text-ink">
        Create your account
      </h1>
      <p class="text-sm text-ink-2">
        Already have one?
        <Link route="session.create" class="font-semibold text-accent-600">Sign in</Link>
      </p>
    </div>

    <SocialAuth />

    <Form v-slot="{ processing, errors }" route="new_account.store" class="flex flex-col">
      <UiField label="Full name" for="fullName" :error="errors.fullName" class="mb-4">
        <div class="relative flex items-center">
          <i class="pi pi-user pointer-events-none absolute left-3.25 text-[15px] text-slate-400" />
          <input
            id="fullName"
            type="text"
            name="fullName"
            autocomplete="name"
            placeholder="Jordan Lee"
            class="input pl-10!"
            :class="{ invalid: errors.fullName }"
          />
        </div>
      </UiField>

      <UiField label="Email" for="email" :error="errors.email" class="mb-4">
        <div class="relative flex items-center">
          <i
            class="pi pi-envelope pointer-events-none absolute left-3.25 text-[15px] text-slate-400"
          />
          <input
            id="email"
            type="email"
            name="email"
            autocomplete="email"
            placeholder="you@example.com"
            class="input pl-10!"
            :class="{ invalid: errors.email }"
          />
        </div>
      </UiField>

      <UiField label="Password" for="password" :error="errors.password" class="mb-4">
        <div class="relative flex items-center">
          <i class="pi pi-lock pointer-events-none absolute left-3.25 text-[15px] text-slate-400" />
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            autocomplete="new-password"
            placeholder="At least 8 characters"
            class="input px-10!"
            :class="{ invalid: errors.password }"
          />
          <button
            type="button"
            class="absolute right-2 grid place-items-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-surface-2 hover:text-ink-2"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <i :class="['pi', showPassword ? 'pi-eye-slash' : 'pi-eye']" />
          </button>
        </div>
        <div v-if="password" class="mt-2.5">
          <div class="flex gap-1.5">
            <span
              v-for="n in 4"
              :key="n"
              class="h-[5px] flex-1 rounded-[3px] transition-colors"
              :style="{ background: n <= strength ? strengthColor[strength] : 'var(--line)' }"
            />
          </div>
          <p class="mt-1.5 text-xs text-muted">{{ strengthLabel[strength] }}</p>
        </div>
      </UiField>

      <UiField
        label="Confirm password"
        for="passwordConfirmation"
        :error="errors.passwordConfirmation"
        class="mb-5"
      >
        <div class="relative flex items-center">
          <i class="pi pi-lock pointer-events-none absolute left-3.25 text-[15px] text-slate-400" />
          <input
            id="passwordConfirmation"
            :type="showPassword ? 'text' : 'password'"
            name="passwordConfirmation"
            autocomplete="new-password"
            placeholder="Re-enter your password"
            class="input pl-10!"
            :class="{ invalid: errors.passwordConfirmation }"
          />
        </div>
      </UiField>

      <UiButton type="submit" :loading="processing" block size="lg">Create account</UiButton>

      <p class="mt-4 text-center text-xs text-muted">
        By creating an account you agree to our
        <a href="#" class="font-semibold text-ink-2">Terms</a> &amp;
        <a href="#" class="font-semibold text-ink-2">Privacy Policy</a>.
      </p>
    </Form>
  </div>
</template>
