<template>
  <div
    class="flex justify-between rounded-2xl p-3 w-full h-full bg-neutral-white"
  >
    <div class="flex items-center">
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
          :disabled="disabled"
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

    <div>
      <BaseButtonNew
        class="font-bold"
        :label="$t('bulk-operations.delete')"
        :icon="DamsIcons.Trash"
        button-style="redDefault"
        button-size="small"
        @click="() => emit('delete')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { DamsIcons } from "@/generated-types/queries";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

withDefaults(
  defineProps<{
    buttonLabel?: string;
    buttonIcon?: DamsIcons;
    disabled?: boolean;
    selectedItemsCount?: number;
  }>(),
  {
    buttonLabel: "",
    buttonIcon: DamsIcons.Edit,
    disabled: false,
    selectedItemsCount: 0,
  }
);

const emit = defineEmits<{
  (event: "submit"): void;
  (event: "cancel"): void;
  (event: "delete"): void;
}>();
</script>
