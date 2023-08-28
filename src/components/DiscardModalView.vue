<template>
  <div v-if="translationKey" class="h-full flex flex-col justify-between p-4">
    <div class="text-xl">{{ t(`confirm.${translationKey}.message`) }}</div>
    <div class="flex justify-between">
      <div>
        <div>
          <BaseButtonNew
            :label="t(`confirm.${translationKey}.confirm`)"
            button-style="redDefault"
            button-size="small"
            @click="confirmClose()"
          />
        </div>
      </div>
      <div>
        <BaseButtonNew
          :label="t(`confirm.${translationKey}.cancel`)"
          button-style="default"
          button-size="small"
          @click="declineClose()"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import BaseButtonNew from "./base/BaseButtonNew.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { computed } from "vue";

const { t } = useI18n();
const { confirmClose, declineClose, getModalInfo, modalToCloseAfterConfirm } =
  useBaseModal();

const translationKey = computed(() => {
  if (!modalToCloseAfterConfirm.value) return "";
  return getModalInfo(modalToCloseAfterConfirm.value).closeConfirmation
    ?.confirmTranslationKey;
});
</script>
