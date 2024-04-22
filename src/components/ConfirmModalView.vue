<template>
  <div v-if="translationKey" class="h-full flex flex-col justify-between p-4">
    <div class="text-xl">{{ t(`confirm.${translationKey}.message`) }}</div>
    <div class="flex justify-between pt-8">
      <div :class="[{ 'w-3/4': secondaryConfirmFunction }]">
        <div class="flex items-center gap-4">
          <BaseButtonNew
            v-if="confirmFunction"
            :label="t(`confirm.${translationKey}.confirm`)"
            button-style="redDefault"
            button-size="small"
            @click="performConfirmFunction(confirmFunction)"
          />
          <BaseButtonNew
            v-if="secondaryConfirmFunction"
            :label="t(`confirm.${translationKey}.secondary-confirm`)"
            button-style="redDefault"
            button-size="small"
            @click="performConfirmFunction(secondaryConfirmFunction)"
          />
        </div>
      </div>
      <div class="flex items-center">
        <BaseButtonNew
          v-if="declineFunction"
          :label="t(`confirm.${translationKey}.cancel`)"
          button-style="default"
          button-size="small"
          @click="declineFunction()"
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

const { t } = useI18n();
const {
  translationKey,
  confirmFunction,
  declineFunction,
  secondaryConfirmFunction,
} = useConfirmModal();
const { closeModal } = useBaseModal();

const performConfirmFunction = (callback: Function) => {
  callback();
  closeModal(TypeModals.Confirm);
};
</script>
