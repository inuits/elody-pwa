<template>
  <div class="ml-2 mr-6">
    <BaseButtonNew
      :label="t(label)"
      :icon="icon ? DamsIcons[icon] : undefined"
      button-style="default"
      button-size="small"
      :loading="isLoading"
      :style="{ backgroundColor: customStyle?.background, color: customStyle?.text }"
      @click="doAction"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, inject } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { DefaultApolloClient } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";
import { DamsIcons } from "@/generated-types/queries";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useImport } from "@/composables/useImport";
import { useBaseNotification } from "@/composables/useBaseNotification";
import useEntitySingle from "@/composables/useEntitySingle";

const props = defineProps<{
  label: string;
  icon?: string;
  mutation: string;
  customStyle?: { background?: string; text?: string };
}>();

const { t } = useI18n();
const route = useRoute();
const { loadDocument } = useImport();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();
const apolloClient = inject(DefaultApolloClient) as ApolloClient<any>;
const { getRefetch } = useEntitySingle();

const isLoading = ref(false);

const doAction = async () => {
  isLoading.value = true;
  try {
    const document = await loadDocument(props.mutation);
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
