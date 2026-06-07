<script setup lang="ts">
import { ref } from 'vue'
import { Head } from '@inertiajs/vue3'
import { Link, Form } from '@adonisjs/inertia/vue'
import AuthLayout from '~/layouts/auth.vue'
import { UiButton, UiField, SocialAuth } from '~/components/ui'

defineOptions({ layout: AuthLayout })

const showPassword = ref(false)
</script>

<template>
  <Head title="Login" />

  <div>
    <div class="mb-7">
      <span
        class="mb-4 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-accent-500/20 bg-accent-50 px-3.5 py-[7px] text-[13px] font-semibold text-accent-700"
      >
        <span class="h-[7px] w-[7px] rounded-full bg-accent-500" /> Welcome back
      </span>
      <h1 class="mb-2 text-2xl font-extrabold leading-tight tracking-tight text-ink">
        Sign in to your account
      </h1>
      <p class="text-sm text-ink-2">
        New here?
        <Link route="new_account.create" class="font-semibold text-accent-600"
          >Create an account</Link
        >
      </p>
    </div>

    <SocialAuth />

    <Form v-slot="{ processing, errors }" route="session.store" class="flex flex-col">
      <UiField label="Email" for="email" :error="errors.email" class="mb-4">
        <div class="relative flex items-center">
          <i
            class="pi pi-envelope pointer-events-none absolute left-[13px] text-[15px] text-slate-400"
          />
          <input
            id="email"
            type="email"
            name="email"
            autocomplete="username"
            placeholder="you@example.com"
            class="input pl-10!"
            :class="{ invalid: errors.email }"
          />
        </div>
      </UiField>

      <UiField label="Password" for="password" :error="errors.password" class="mb-5">
        <div class="relative flex items-center">
          <i
            class="pi pi-lock pointer-events-none absolute left-[13px] text-[15px] text-slate-400"
          />
          <input
            id="password"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            autocomplete="current-password"
            placeholder="••••••••"
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
      </UiField>

      <UiButton type="submit" :loading="processing" block size="lg">Sign in</UiButton>
    </Form>
  </div>
</template>
