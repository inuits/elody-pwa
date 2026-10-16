<template>
  <!-- entity-list-element.md: the list header count chip, the single source of the total. -->
  <span role="status" class="inline-flex items-center gap-1 whitespace-nowrap">
    <button
      v-if="revealable"
      type="button"
      data-cy="list-count-chip"
      :class="chipClasses"
      class="underline decoration-dotted cursor-pointer disabled:cursor-wait"
      :disabled="exactCountLoading"
      :title="t('bulk-operations.reveal-exact-count')"
      @click="emit('revealExactCount')"
    >
      {{ label }}
    </button>
    <span v-else data-cy="list-count-chip" :class="chipClasses">{{
      label
    }}</span>
    <SpinnerLoader v-if="exactCountLoading" theme="accent" :dimensions="12" />
    <BaseTooltip
      v-else-if="revealable"
      position="top-end"
      :tooltip-offset="8"
    >
      <template #activator="{ on, describedBy }">
        <span
          v-on="on"
          :aria-describedby="describedBy"
          class="flex items-center text-text-light"
        >
          <Unicon :name="Unicons.QuestionCircle.name" height="14" />
        </span>
      </template>
      <span>{{ t("bulk-operations.capped-items-tooltip") }}</span>
    </BaseTooltip>
  </span>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  canRevealExactCount,
  formatDisplayCount,
} from "@/composables/useResultCount";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { Unicons } from "@/types";

const props = withDefaults(
  defineProps<{
    count: number;
    exactCount?: number | null;
    exactCountLoading?: boolean;
  }>(),
  { exactCount: null, exactCountLoading: false },
);

const emit = defineEmits<{ (event: "revealExactCount"): void }>();

const { t, locale } = useI18n();

const chipClasses =
  "inline-flex items-center p-(--chip-padding) rounded-chip text-chip font-bold bg-chip-neutral-bg text-chip-neutral-text";

const revealable = computed(() =>
  canRevealExactCount(props.count, props.exactCount),
);
const label = computed(() =>
  t(
    "library.result-count",
    { count: formatDisplayCount(props.count, props.exactCount, locale.value) },
    props.exactCount ?? props.count,
  ),
);
</script>
