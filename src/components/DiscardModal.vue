<template>
  <div class="h-full flex flex-col justify-between p-4">
    <div class="text-xl">{{ t("confirm.discard-create") }}</div>
    <div class="flex justify-between">
      <div>
        <div>
          <BaseButtonNew
            :label="t('discard')"
            :icon="DamsIcons.Trash"
            button-style="redDefault"
            button-size="small"
            @click="confirmClose"
          />
        </div>
      </div>
      <div>
        <BaseButtonNew
          :label="t('cancel')"
          button-style="default"
          button-size="small"
          @click="declineClose"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import BaseButtonNew from "./base/BaseButtonNew.vue";
import { DamsIcons } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";

const { t } = useI18n();
const { confirmClose, declineClose } = useBaseModal();
</script>
