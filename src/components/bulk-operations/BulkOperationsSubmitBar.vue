<template>
  <div class="flex items-center rounded-2xl p-3 h-full bg-neutral-white">
    <div class="min-w-[10rem]">
      <BaseButtonNew
        class="font-bold"
        :label="
          buttonLabel
            ? buttonLabel
            : `${$t('bulk-operations.edit')} ${selectedItemsCount} ${$t(
                'bulk-operations.items'
              )}`
        "
        :icon="buttonIcon"
        :disabled="isDisabledButton"
        button-style="accentAccent"
        button-size="small"
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
</template>

<script lang="ts" setup>
import { DamsIcons } from "@/generated-types/queries";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

withDefaults(
  defineProps<{
    selectedItemsCount: number;
    isDisabledButton: boolean;
    buttonIcon: DamsIcons;
    buttonLabel?: string;
  }>(),
  {
    selectedItemsCount: 0,
    buttonIcon: DamsIcons.Edit,
    buttonLabel: "",
  }
);

const emit = defineEmits<{
  (event: "submit"): void;
  (event: "cancel"): void;
}>();
</script>
