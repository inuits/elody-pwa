<template>
  <div class="ml-0 min-[880px]:ml-6">
    <BaseButtonNew
      :label="t('history.view-history')"
      :icon="DamsIcons.History"
      button-style="accentNormal"
      button-size="small"
      @click="viewHistory"
    />
  </div>
</template>

<script lang="ts" setup>
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { DamsIcons } from "@/generated-types/queries";

const props = defineProps<{
  entityType: string;
  entityId: string;
}>();

const { t } = useI18n();
const router = useRouter();

const viewHistory = () => {
  router.push({
    name: "HistoryComparison",
    params: { type: props.entityType, id: props.entityId },
  });
};
</script>

<style scoped></style>
