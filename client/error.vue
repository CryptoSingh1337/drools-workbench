<template>
  <div
    class="mx-auto flex h-screen flex-col items-center justify-center px-4 sm:px-12 xl:max-w-6xl xl:px-0"
  >
    <div>
      <div class="text-center">
        <h1 class="mt-5 text-3xl font-bold text-slate-800 lg:text-[50px]">
          <span class="text-secondary">{{ error.statusCode }}</span> - {{ error.statusMessage }}
        </h1>
        <UButton class="mt-4" @click="handleError">Go back to home</UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{
  error: NuxtError;
}>();

const handleError = () => clearError({ redirect: "/" });
</script>
