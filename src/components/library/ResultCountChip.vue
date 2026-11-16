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
      :aria-label="numberOnly ? label : undefined"
      @click="emit('revealExactCount')"
    >
      {{ shownLabel }}
    </button>
    <span
      v-else
      data-cy="list-count-chip"
      :class="chipClasses"
      :aria-label="numberOnly ? label : undefined"
      >{{ shownLabel }}</span
    >
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
    // A badge next to a panel title: the title says what is counted.
    numberOnly?: boolean;
  }>(),
  { exactCount: null, exactCountLoading: false, numberOnly: false },
);

const emit = defineEmits<{ (event: "revealExactCount"): void }>();

const { t, locale } = useI18n();

const chipClasses =
  "inline-flex items-center p-(--chip-padding) rounded-chip text-chip font-bold bg-surface text-text-panel-header";

const revealable = computed(() =>
  canRevealExactCount(props.count, props.exactCount),
);
const displayCount = computed(() =>
  formatDisplayCount(props.count, props.exactCount, locale.value),
);
const label = computed(() =>
  t(
    "library.result-count",
    { count: displayCount.value },
    props.exactCount ?? props.count,
  ),
);
const shownLabel = computed(() =>
  props.numberOnly ? displayCount.value : label.value,
);
</script>
