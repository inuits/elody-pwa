<template>
  <div
    data-cy="pipeline-ghost-node"
    :class="[
      'border-2 border-dashed border-text-light rounded flex flex-col gap-2 p-4 bg-transparent',
      variant === 'empty' ? 'w-[420px] items-center text-center' : 'w-[272px] items-start',
    ]"
  >
    <span class="text-sm text-text-subtitle">
      {{
        variant === "empty"
          ? t("pipeline.empty-title")
          : t("pipeline.suggested-next-step")
      }}
    </span>
    <span v-if="name" class="font-bold text-text-body">{{ name }}</span>
    <span
      v-if="consumes"
      class="rounded-full bg-tag-neutral px-2 py-0.5 text-sm w-fit"
    >
      {{ t("pipeline.consumes") }}: {{ consumes }}
    </span>
    <span v-if="variant === 'empty'" class="text-sm text-text-subtitle">
      {{ t("pipeline.empty-subtitle") }}
    </span>
    <button
      data-cy="pipeline-add-component"
      class="border border-dashed border-text-light rounded px-3 py-1 text-sm text-text-body hover:bg-background-light cursor-pointer"
      @click.stop="emit('add')"
    >
      {{ t("pipeline.add-component") }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";

// Dashed-border ghost card: the shape-matching catalog suggestion at the end
// of the chain, or the empty-pipeline invitation. The suggestion is passed in
// by the host — this component does no querying, and its add button hands off
// to the existing add-component flow.
withDefaults(
  defineProps<{
    variant: "suggestion" | "empty";
    name?: string;
    consumes?: string;
  }>(),
  { name: "", consumes: "" },
);

const emit = defineEmits<{ (event: "add"): void }>();

const { t } = useI18n();
</script>
