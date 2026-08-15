<template>
  <div
    data-cy="bulk-operation-submit-bar"
    class="flex justify-between rounded-2xl p-3 w-full h-full bg-background-light"
  >
    <div class="flex items-center">
      <div v-if="disabled" class="h-auto mt-1">
        <base-tooltip position="top-right" :tooltip-offset="8">
          <template #activator="{ on }">
            <div v-on="on">
              <unicon :name="Unicons.QuestionCircle.name" height="20" />
            </div>
          </template>
          <template #default>
            <span class="text-sm text-text-placeholder">
              <div>
                {{ t(`tooltip.buttons.disabled-${tooltipLabel}-button`) }}
              </div>
            </span>
          </template>
        </base-tooltip>
      </div>
      <div class="min-w-[10rem]">
        <BaseButton
          :label="
            buttonLabel
              ? buttonLabel
              : `${$t('bulk-operations.edit')} ${selectedItemsCount} ${$t(
                  'bulk-operations.items',
                )}`
          "
          :icon="buttonIcon"
          :disabled="disabled"
          :loading="loading"
          button-style="commit"
          button-size="sm"
          @click="() => emit('submit')"
        />
      </div>
      <div class="ml-5">
        <span
          class="text-text-body underline cursor-pointer select-none"
          @click="() => emit('cancel')"
        >
          {{ $t("bulk-operations.cancel") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { DamsIcons } from "@/generated-types/queries";
import BaseButton from "@/components/base/BaseButton.vue";
import { Unicons } from "@/types";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

withDefaults(
  defineProps<{
    buttonLabel?: string;
    tooltipLabel?: string;
    buttonIcon?: DamsIcons;
    disabled?: boolean;
    loading?: boolean;
    showDeleteButton?: boolean;
    selectedItemsCount?: number;
  }>(),
  {
    buttonLabel: "",
    buttonIcon: DamsIcons.Edit,
    disabled: false,
    loading: false,
    showDeleteButton: false,
    selectedItemsCount: 0,
  },
);

const emit = defineEmits<{
  (event: "submit"): void;
  (event: "cancel"): void;
  (event: "delete"): void;
}>();
</script>
