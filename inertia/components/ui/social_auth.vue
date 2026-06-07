<script setup lang="ts">
/*
 * Social sign-in buttons (Google). Presentational for now — wire them to OAuth
 * routes when a provider is configured. The `dividerLabel` shows the
 * "or continue with email" separator beneath the buttons.
 */
withDefaults(defineProps<{ dividerLabel?: string }>(), {
  dividerLabel: 'or continue with email',
})
</script>

<template>
  <div>
    <div class="grid gap-2.5">
      <button type="button" class="social-btn">
        <i class="pi pi-google text-[#ea4335]" />
        Continue with Google
      </button>
    </div>

    <div class="my-[22px] flex items-center gap-3.5 text-[13px] text-muted">
      <span class="h-px flex-1 bg-line" />
      {{ dividerLabel }}
      <span class="h-px flex-1 bg-line" />
    </div>
  </div>
</template>

<style scoped>
.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--ink);
  cursor: pointer;
  transition: 0.18s;
}
.social-btn:hover {
  background: var(--bg-2);
  border-color: var(--slate-300);
}
.social-btn i {
  font-size: 16px;
}
</style>
