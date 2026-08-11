<template>
  <div
    v-if="isBlocking"
    :class="[
      // 'fixed' for the app-wide overlay; native <dialog> is in the top layer,
      // so modals need their own 'absolute' copy inside the dialog.
      fixed ? 'fixed' : 'absolute',
      'inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background-light/80',
    ]"
    role="alert"
    aria-busy="true"
    data-testid="modal-blocking-overlay"
  >
    <SpinnerLoader theme="accent" :dimensions="16" />
    <p v-if="blockingMessage">{{ blockingMessage }}</p>
  </div>
</template>

<script lang="ts" setup>
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useBlockingLoader } from "@/composables/useBlockingLoader";

defineProps<{ isBlocking: boolean; fixed?: boolean }>();

const { blockingMessage } = useBlockingLoader();
</script>
