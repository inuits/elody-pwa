<template>
  <!-- small screen: the preview covers the page. Not a showModal()
       dialog: the top layer would hide the dropdowns and tooltips
       that teleport to body. Teleported, since the container queries'
       layout containment would hold a fixed overlay in the list. -->
  <Teleport to="body" :disabled="!isCompact">
    <div
      data-cy="preview-host"
      :role="isCompact ? 'dialog' : undefined"
      :aria-modal="isCompact || undefined"
      :class="previewHostClasses"
    >
      <slot />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { isCompact } from "@/composables/useNavMenu";

// PreviewWrapper handles Escape and focus in both.
const previewHostClasses = computed(() => {
  const styles = {
    fullScreen: "fixed inset-0 z-overlay overflow-y-auto overscroll-contain bg-surface",
    inline: "my-2 h-fit max-h-[80vh] overflow-y-auto rounded-card",
  };
  return isCompact.value ? styles.fullScreen : styles.inline;
});
</script>
