<template>
  <!-- templates/elody-list-screen: "Items: 20 ▾" beside sort. -->
  <div
    v-if="isResolved && rawOptions.length > 0"
    v-show="total > smallestLimit"
    class="flex items-center"
  >
    <!-- small screen: chips in the sort sheet -->
    <div
      v-if="isCompact"
      role="group"
      :aria-label="t('pagination.page-size')"
      class="flex flex-col gap-2 px-2 pt-3"
    >
      <span class="text-label font-bold text-text-light uppercase">{{
        t("pagination.page-size")
      }}</span>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in rawOptions"
          :key="option.value"
          type="button"
          data-cy="page-size-chip"
          :aria-pressed="option.value === selectedOption ? 'true' : 'false'"
          class="min-h-9 min-w-(--touch-target-min) px-3.5 border rounded-pill font-bold cursor-pointer"
          :class="
            option.value === selectedOption
              ? 'bg-accent-wash text-accent-ink border-accent'
              : 'bg-surface border-border-default'
          "
          @click="selectedOption = option.value"
        >
          {{ t(option.label) }}
        </button>
      </div>
    </div>
    <label v-if="!isCompact" :for="inputId" class="sr-only">{{
      t("pagination.page-size")
    }}</label>
    <AdvancedDropdown
      v-if="!isCompact"
      v-model="selectedOption"
      data-cy="page-size"
      :input-id="inputId"
      :options="rawOptions"
      :label="t('library.items')"
      :add-label-to-value="true"
      :clearable="false"
      label-position="inline"
      style-type="defaultWithBorder"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, useId, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  type DropdownOption,
  type Entitytyping,
  GetPaginationLimitOptionsDocument,
  type GetPaginationLimitOptionsQuery,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { useStateManagement } from "@/composables/useStateManagement";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import { isCompact } from "@/composables/useNavMenu";

const props = withDefaults(
  defineProps<{
    setLimit: (limit: number, force?: boolean) => void;
    selectedPaginationLimitOption: number;
    // List total; a list that fits on the smallest page needs no page size.
    total?: number;
  }>(),
  { selectedPaginationLimitOption: 20, total: Infinity },
);

const emit = defineEmits<{
  (
    event: "paginationLimitOptionsPromise",
    paginationLimitOptionsPromise: (entityType: Entitytyping) => Promise<void>,
  ): void;
}>();

const { t } = useI18n();
const route = useRoute();
const { getStateForRoute } = useStateManagement();
const inputId = useId();

const rawOptions = ref<DropdownOption[]>([]);
const isResolved = ref<boolean>(false);
const selectedOption = ref<number | undefined>(
  props.selectedPaginationLimitOption,
);

// Config labels are bare numbers ("20"); anything else (e.g. "all") is a key.

const smallestLimit = computed(() =>
  Math.min(
    ...rawOptions.value
      .map((option) => Number(option.value))
      .filter((value) => value > 0),
  ),
);

const paginationLimitOptionsPromise = async () => {
  return apolloClient
    .query<GetPaginationLimitOptionsQuery>({
      query: GetPaginationLimitOptionsDocument,
    })
    .then((result) => {
      rawOptions.value = result.data?.PaginationLimitOptions.options || [];

      const state = getStateForRoute(route, true);
      const limit =
        state?.queryVariables?.limit || rawOptions.value?.[0].value || 20;

      selectedOption.value = rawOptions.value.find(
        (option) => option.value === limit,
      )?.value;
      props.setLimit(limit);
      isResolved.value = true;
    });
};

onMounted(() => {
  emit("paginationLimitOptionsPromise", paginationLimitOptionsPromise);
});

watch(
  () => selectedOption.value,
  async () =>
    await props.setLimit(
      selectedOption.value as number,
      selectedOption.value !== -1,
    ),
  { deep: true },
);
</script>
