<template>
  <div>
    <div class="px-6 pt-0 pb-20 bg-neutral-white">
      <form v-if="result">
        <div
          class="py-2"
          v-for="(metadata, index) in getMetadataFields(
            formFields,
            PanelType.Metadata,
            'createEntity'
          )"
          :key="index"
        >
          <entity-element-metadata-edit
            class="-ml-4"
            v-model:value="metadata.value"
            :label="metadata.label"
            :field="metadata.field"
            :fieldKey="metadata.key"
            form-id="createEntity"
          />
        </div>
        <div class="absolute left-0 bottom-6 w-full px-6">
          <BaseButtonNew
            :label="t('form.create')"
            :icon="DamsIcons.Create"
            :disabled="cannotCreate"
            button-style="accentAccent"
            @click="create"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { FormContext } from "vee-validate";
import {
  CreateEntityDocument,
  DamsIcons,
  Entitytyping,
  GetCreateEntityFormDocument,
  PanelType,
  TypeModals,
  type CreateEntityForm,
  type CreateEntityMutation,
  type GetCreateEntityFormQuery,
  type PanelMetaData,
} from "@/generated-types/queries";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import EntityElementMetadataEdit from "@/components/EntityElementMetadataEdit.vue";
import urlSlug from "url-slug";
import { computed, inject, ref, watch } from "vue";
import { getMetadataFields } from "@/helpers";
import { NotificationType } from "@/components/base/BaseNotification.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { useNotification } from "@/components/base/BaseNotification.vue";
import { useRouter } from "vue-router";
import { useBaseModal } from "@/composables/useBaseModal";
import { useConfirmModal } from "@/composables/useConfirmModal";

const props = defineProps<{
  entityType: Entitytyping;
}>();

const { t } = useI18n();
const { createNotification } = useNotification();
const { createForm, createEntityValues, formContainsValues } = useFormHelper();
const { changeCloseConfirmation, closeModal, updateModal } = useBaseModal();
const { initializeConfirmModal } = useConfirmModal();
const validationSchema = inject("validationSchema") as Object;
const router = useRouter();
const formId: string = "createEntity";

const form = ref<FormContext<any>>();
const formFields = ref<PanelMetaData[]>([]);
const idPrefix = ref<string>("");
const formHasValues = computed(() => formContainsValues(formId));

initializeConfirmModal(
  () => {
    changeCloseConfirmation(TypeModals.Create, false);
    closeModal(TypeModals.Confirm);
    closeModal(TypeModals.Create);
  },
  undefined,
  () => closeModal(TypeModals.Confirm),
  "discard-create"
);

const type = computed(() => props.entityType);
const id = computed(
  () =>
    `${idPrefix.value}${urlSlug(
      form.value?.values.intialValues["alternate_name"]
    )}`
);
const cannotCreate = computed(() => {
  if (!form.value) return true;
  const values = Object.values(form.value?.values.intialValues);
  return values.length <= 0 || values.includes("");
});

const { mutate } = useMutation<CreateEntityMutation>(CreateEntityDocument);
const { result, onResult, refetch } = useQuery<GetCreateEntityFormQuery>(
  GetCreateEntityFormDocument,
  { type },
  {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
  }
);
onResult((result) => {
  const createEntityForm = result.data?.CreateEntityForm as CreateEntityForm;
  idPrefix.value = createEntityForm?.idPrefix || "";
  formFields.value = createEntityForm?.formFields.createFormFields || [];
  const entityValues = createEntityValues(formFields.value);
  form.value = createForm(formId, entityValues, validationSchema);
});

const create = async () => {
  const createResult = await mutate({
    data: {
      id: id.value,
      identifiers: [
        id.value,
        form.value?.values.intialValues["alternate_name"],
      ],
      metadata: Object.keys(form.value?.values.intialValues)
        .filter((key) => key !== "__typename")
        .map((key) => {
          return { key, value: form.value?.values.intialValues[key] };
        }),
      type: props.entityType,
    },
  });

  if (createResult && createResult.data?.createEntity?.id) {
    updateModal(TypeModals.Create, {
      closeConfirmation: false,
    });
    closeModal(TypeModals.Create);
    createNotification({
      displayTime: 10,
      type: NotificationType.default,
      title: t("notifications.success.entityCreated.title"),
      description: t("notifications.success.entityCreated.description"),
      shown: true,
    });
    router.push({
      name: "SingleEntity",
      params: { id: id.value },
    });
  }
};

watch(
  () => type.value,
  () => refetch()
);

watch(
  () => formHasValues.value,
  () => {
    if (formHasValues.value) {
      changeCloseConfirmation(TypeModals.Create, true);
    } else {
      changeCloseConfirmation(TypeModals.Create, false);
    }
  }
);
</script>
