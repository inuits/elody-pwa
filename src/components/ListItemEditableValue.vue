<template>
  <ListItemInlineField
    v-if="inputField"
    :metadata="{ ...metadata, inputField } as Metadata"
    parent-entity-id=""
    :linked-entity-id="entityId"
    :refetch-entities="refetchEntities"
    own-field
  >
    <slot />
  </ListItemInlineField>
  <slot v-else />
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import type { InputField, Metadata } from "@/generated-types/queries";
import ListItemInlineField from "@/components/ListItemInlineField.vue";
import { useImport } from "@/composables/useImport";
import { apolloClient } from "@/main";

const props = defineProps<{
  editFormQuery?: string;
  metadata: Metadata;
  entityId: string;
  refetchEntities?: () => Promise<void>;
}>();

const { loadDocument } = useImport();
const inputField = ref<InputField | undefined>(undefined);

const findInputField = (form: any): InputField | undefined => {
  const tabs = Object.values(form ?? {}).filter(
    (tab: any) => tab && typeof tab === "object" && tab.formFields,
  );
  for (const tab of tabs as any[]) {
    const field = Object.entries(tab.formFields).find(
      ([alias, value]: [string, any]) =>
        (value?.key ?? alias) === props.metadata.key,
    )?.[1] as any;
    if (field?.inputField?.type) return field.inputField;
  }
  return undefined;
};

onMounted(async () => {
  if (!props.editFormQuery) return;
  const document = await loadDocument(props.editFormQuery);
  if (!document) return;
  const response = await apolloClient.query({ query: document });
  inputField.value = findInputField(response.data?.GetDynamicForm);
});
</script>
