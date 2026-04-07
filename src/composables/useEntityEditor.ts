import { ref, inject } from "vue";
import { useI18n } from "vue-i18n";
import { ApolloError } from "@apollo/client/core";
import { useMutation } from "@vue/apollo-composable";
import { apolloClient } from "@/main";
import {
  GetEntityByIdDocument,
  MutateEntityValuesDocument,
  Collection,
  type Entity,
  type PanelMetaData,
} from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useImport } from "@/composables/useImport";
import { getChildrenOfHomeRoutes, deepToRaw } from "@/helpers";
import { useVeeValidate } from "@/components/metadata/useVeeValidate";

export function useEntityEditor() {
  const { t } = useI18n();
  const { createForm, parseFormValuesToFormInput, addEditableMetadataKeys } =
    useFormHelper();
  const { displaySuccessNotification } = useBaseNotification();
  const { loadDocument } = useImport();
  const { getVeeValidateKey } = useVeeValidate();
  const config: any = inject("config");

  const entity = ref<Entity | null>(null);
  const editableFields = ref<PanelMetaData[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const form = ref<any>(null);

  const { mutate } = useMutation(MutateEntityValuesDocument);

  const determineCollection = (entityType: string | null): Collection => {
    if (!entityType) return Collection.Entities;
    const childRoutes = getChildrenOfHomeRoutes(config).map((r: any) => r.meta);
    return (
      childRoutes.find(
        (r: any) => r.entityType?.toLowerCase() === entityType.toLowerCase(),
      )?.type || Collection.Entities
    );
  };

  const initialize = async (
    entityId: string,
    entityType: string,
    formQuery?: string,
  ) => {
    isLoading.value = true;
    try {
      const { data } = await apolloClient.query({
        query: GetEntityByIdDocument,
        variables: { id: entityId, type: entityType },
        fetchPolicy: "no-cache",
      });
      entity.value = data.Entity;

      if (entity.value) {
        form.value = createForm(`${entityId}_editing`, {
          intialValues: structuredClone(deepToRaw(entity.value.intialValues)),
          relationValues: structuredClone(
            deepToRaw(entity.value.relationValues),
          ),
        });
      }

      if (formQuery) {
        const document = await loadDocument(formQuery);
        const queryRes = await apolloClient.query({ query: document });
        const rawFields = Object.values(
          queryRes.data.GetDynamicForm?.formTab?.formFields || {},
        ) as PanelMetaData[];

        editableFields.value = rawFields.filter(
          (f: any) => f.inputField && !f.nonEditableField,
        );
        addEditableMetadataKeys(
          editableFields.value.map((f) => f.key),
          entityId,
        );
      }
    } catch (error) {
      console.log("Error while initializing form:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const save = async (
    entityId: string,
    entityType: string,
    callback?: () => void,
    saveEmptyMetadata: boolean = false,
  ) => {
    if (!form.value) return;

    isSaving.value = true;
    try {
      const { valid } = await form.value.validate();
      if (!valid) return;

      const metadataMap = editableFields.value.reduce(
        (acc, f) => ({ ...acc, [f.key]: f }),
        {},
      );

      const formInput = parseFormValuesToFormInput(
        entityId,
        form.value.values,
        false,
        config.locale || "en",
        metadataMap,
      );

      if (saveEmptyMetadata) {
        formInput.metadata.forEach((item) => (item.value = ""));
      }

      const result = await mutate({
        id: entityId,
        collection: determineCollection(entityType),
        formInput,
      });

      if (result?.data?.mutateEntityValues) {
        displaySuccessNotification(
          t("notifications.success.entityUpdated.title"),
          t("notifications.success.entityUpdated.description"),
        );
        if (callback) callback();
        return true;
      }
    } catch (error) {
      console.log("Error while saving entity:", error);
    } finally {
      isSaving.value = false;
    }
    return false;
  };

  const handleManualMetadataUpdate = (field: PanelMetaData, formId: string) => {
    if (!form.value) return;
    const path = getVeeValidateKey({ metadata: field, isEdit: true });
    form.value.setFieldValue(path, field.value);
  };

  return {
    entity,
    editableFields,
    isLoading,
    isSaving,
    form,
    initialize,
    save,
    handleManualMetadataUpdate,
  };
}
