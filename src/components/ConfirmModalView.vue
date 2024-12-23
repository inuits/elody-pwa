<template>
  <div
    v-if="confirmModalConfiguration?.translationKey"
    class="h-full flex flex-col justify-between p-4"
  >
    <div class="title">
      {{ t(`confirm.${confirmModalConfiguration?.translationKey}.title`, [confirmModalConfiguration?.titleLabelVariable]) }}
    </div>
    <div class="pt-4">
      {{ t(`confirm.${confirmModalConfiguration?.translationKey}.message`, [confirmModalConfiguration?.messageLabelVariable]) }}
    </div>
    <div class="flex justify-between pt-8">
      <div
        :class="[
          { 'w-3/4': confirmModalConfiguration?.secondaryConfirmButton },
        ]"
      >
        <div class="flex items-center gap-4">
          <BaseButtonNew
            v-if="confirmModalConfiguration?.confirmButton.buttonCallback"
            :label="
              t(`confirm.${confirmModalConfiguration.translationKey}.confirm`, [confirmModalConfiguration?.confirmLabelVariable])
            "
            :button-style="buttonStyles.confirm"
            :button-size="buttonSizes.confirm"
            @click="
              performConfirmFunction(
                confirmModalConfiguration.confirmButton.buttonCallback
              )
            "
          />
          <BaseButtonNew
            v-if="
              confirmModalConfiguration?.secondaryConfirmButton?.buttonCallback
            "
            :label="
              t(
                `confirm.${confirmModalConfiguration.translationKey}.secondary-confirm`
              )
            "
            :button-style="buttonStyles.secondaryConfirm"
            :button-size="buttonSizes.secondaryConfirm"
            @click="
              performConfirmFunction(
                confirmModalConfiguration.secondaryConfirmButton.buttonCallback
              )
            "
          />
        </div>
      </div>
      <div class="flex items-center">
        <BaseButtonNew
          v-if="confirmModalConfiguration?.declineButton.buttonCallback"
          :label="
            t(`confirm.${confirmModalConfiguration.translationKey}.cancel`)
          "
          :button-style="buttonStyles.decline"
          :button-size="buttonSizes.decline"
          @click="confirmModalConfiguration.declineButton.buttonCallback()"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import BaseButtonNew from "./base/BaseButtonNew.vue";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useBaseModal } from "@/composables/useBaseModal";
import { TypeModals } from "@/generated-types/queries";
import { computed } from "vue";

const { t } = useI18n();
const { confirmModalConfiguration } = useConfirmModal();
const { closeModal } = useBaseModal();

const buttonStyles = computed(() => {
  return {
    confirm:
      confirmModalConfiguration.value?.confirmButton.buttonStyle ||
      "redDefault",
    secondaryConfirm:
      confirmModalConfiguration.value?.secondaryConfirmButton?.buttonStyle ||
      "redDefault",
    decline:
      confirmModalConfiguration.value?.declineButton.buttonStyle || "default",
  };
});

const buttonSizes = computed(() => {
  return {
    confirm:
      confirmModalConfiguration.value?.confirmButton.buttonSize || "small",
    secondaryConfirm:
      confirmModalConfiguration.value?.secondaryConfirmButton?.buttonSize ||
      "small",
    decline:
      confirmModalConfiguration.value?.declineButton.buttonSize || "small",
  };
});

const performConfirmFunction = (callback: Function) => {
  callback();
  closeModal(TypeModals.Confirm);
};
</script>
