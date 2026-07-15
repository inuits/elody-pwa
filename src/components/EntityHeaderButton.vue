<template>
  <div class="ml-2 mr-6">
    <BaseButtonNew
      v-if="deleteAvailable"
      :label="t(activeConfig.label)"
      :icon="activeConfig.icon ? DamsIcons[activeConfig.icon] : undefined"
      button-style="default"
      button-size="small"
      :loading="isLoading"
      :style="{
        backgroundColor: activeConfig.style?.background,
        color: activeConfig.style?.text,
      }"
      @click="doAction"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, inject } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { DefaultApolloClient } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";
import { DamsIcons } from "@/generated-types/queries";
import type { EntityButtonConfig } from "@/generated-types/queries";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useImport } from "@/composables/useImport";
import { useBaseNotification } from "@/composables/useBaseNotification";
import useEntitySingle from "@/composables/useEntitySingle";
import { useFormHelper } from "@/composables/useFormHelper";
import { isToggleButton } from "@/types/contextMenuRouteConfig";
import type { ToggleEntityButtonConfig } from "@/types/contextMenuRouteConfig";
import { useEditMode } from "@/composables/useEdit";

const props = defineProps<{
  config: EntityButtonConfig | ToggleEntityButtonConfig;
}>();

const entityFormData: any = inject("entityFormData");
const entityId = computed<string>(
  () =>
    entityFormData?.id ||
    useEntitySingle().getEntityUuid() ||
    route.params["id"],
);
const { t } = useI18n();
const route = useRoute();
const { loadDocument } = useImport();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();
const apolloClient = inject(DefaultApolloClient) as ApolloClient<any>;
const { getRefetch } = useEntitySingle();
const { getFormByRouteId } = useFormHelper();
const useEditHelper = computed(() => useEditMode(entityId.value));

const deleteAvailable = computed<boolean>(
  () =>
    useEditHelper.value.editMode === "edit-delete" ||
    useEditHelper.value.editMode === "delete",
);

const isLoading = ref(false);

const activeConfig = computed<EntityButtonConfig>(() => {
  if (!isToggleButton(props.config)) return props.config;
  const formValues = getFormByRouteId().form?.values;
  const val = props.config.metadataKey
    .split(".")
    .reduce((o: any, k) => o?.[k], formValues);
  return val ? props.config.whenTrue : props.config.whenFalse;
});

const doAction = async () => {
  isLoading.value = true;
  try {
    const document = await loadDocument(activeConfig.value.mutation);
    await apolloClient.mutate({
      mutation: document,
      variables: { id: String(route.params["id"]) },
    });
    getRefetch()?.();
    displaySuccessNotification(
      t("notifications.success.action-started.title"),
      t("notifications.success.action-started.description"),
    );
  } catch {
    displayErrorNotification(
      t("notifications.errors.validation-error.title"),
      "",
    );
  } finally {
    isLoading.value = false;
  }
};
</script>
