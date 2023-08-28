<template>
  <div v-if="translationKey" class="h-full flex flex-col justify-between p-4">
    <div class="text-xl">{{ t(`confirm.${translationKey}.message`) }}</div>
    <div class="flex justify-between">
      <div>
        <div>
          <BaseButtonNew
            v-if="confirmFunction"
            :label="t(`confirm.${translationKey}.confirm`)"
            button-style="redDefault"
            button-size="small"
            @click="confirmFunction()"
          />
        </div>
      </div>
      <div>
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

const { t } = useI18n();
const { translationKey, confirmFunction, declineFunction } = useConfirmModal();
</script>
