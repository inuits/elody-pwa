<template>
  <div class="flex flex-col gap-2">
    <entity-element-w-y-s-i-w-y-g
      :key="`${scratchFormId}-${resetCount}`"
      :form-id="scratchFormId"
      :element="composerElement"
      :display-inline="true"
    />
    <div v-if="createFields.length" class="flex flex-col gap-2">
      <metadata-wrapper
        v-for="field in createFields"
        :key="`${scratchFormId}-${field.key}-${resetCount}`"
        :form-id="scratchFormId"
        :metadata="field"
        :is-edit="true"
        form-flow="create"
      />
    </div>
    <div class="flex items-center justify-end gap-2">
      <button
        v-if="cancellable"
        class="px-3 py-1 rounded-md text-text-body hover:bg-neutral-30 transition-colors"
        @click="emit('cancel')"
      >
        {{ t("comments.cancel") }}
      </button>
      <base-button-new
        :label="submitLabel"
        :icon="DamsIcons.Check"
        button-style="accentAccent"
        :disabled="!canSubmit"
        @click="submit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import EntityElementWYSIWYG from "@/components/entityElements/WYSIWYG/EntityElementWYSIWYG.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import {
  createFieldMetadataFrom,
  extractTaggedRelations,
} from "@/composables/useComments";
import {
  DamsIcons,
  ValidationFields,
  type BaseRelationValuesInput,
  type MetadataValuesInput,
  type PanelMetaData,
  type WysiwygElement,
} from "@/generated-types/queries";

const props = withDefaults(
  defineProps<{
    scratchFormId: string;
    composer: WysiwygElement;
    initialBody?: string;
    submitLabel: string;
    cancellable?: boolean;
    createFields?: PanelMetaData[];
    onSubmit: (
      body: string,
      taggedRelations: BaseRelationValuesInput[],
      metadata: MetadataValuesInput[],
    ) => unknown;
  }>(),
  {
    initialBody: "",
    cancellable: false,
    createFields: () => [],
  },
);

const emit = defineEmits<{
  cancel: [];
}>();

const { t } = useI18n();
const { createForm, getForm, deleteForm } = useFormHelper();
const editHelper = useEditMode(props.scratchFormId);

const isSubmitting = ref<boolean>(false);
const bodyKey = computed<string>(() => props.composer.metadataKey);

const composerElement = computed<WysiwygElement>(() => props.composer);

const currentValues = computed<Record<string, any>>(
  () => getForm(props.scratchFormId)?.values?.intialValues ?? {},
);

const currentBody = computed<string>(
  () => currentValues.value[bodyKey.value] ?? "",
);

const hasContent = computed<boolean>(() => {
  // TipTap always emits at least an empty paragraph, and the tagging extension may
  // add a zero-width space, so neither is treated as content.
  const text = currentBody.value
    .replace(/<[^>]*>/g, "")
    .replace(/​/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length > 0 || currentBody.value.includes("data-entity-id");
});

const isFormValid = computed<boolean>(
  () => getForm(props.scratchFormId)?.meta?.valid !== false,
);

const canSubmit = computed<boolean>(
  () => hasContent.value && isFormValid.value && !isSubmitting.value,
);

const resetCount = ref<number>(0);

const clear = () => {
  const form = getForm(props.scratchFormId);
  [bodyKey.value, ...props.createFields.map((field) => field.key)].forEach(
    (key) => form?.setFieldValue(`${ValidationFields.IntialValues}.${key}`, ""),
  );
  resetCount.value += 1;
};

const submit = async () => {
  if (!canSubmit.value) return;
  isSubmitting.value = true;
  try {
    const body = currentBody.value;
    await props.onSubmit(
      body,
      extractTaggedRelations(
        body,
        props.composer.taggingConfiguration?.taggableEntityConfiguration ?? [],
      ),
      createFieldMetadataFrom(props.createFields, currentValues.value),
    );
    if (!props.initialBody) clear();
  } finally {
    isSubmitting.value = false;
  }
};

createForm(props.scratchFormId, {
  intialValues: {
    [bodyKey.value]: props.initialBody,
    ...Object.fromEntries(props.createFields.map((field) => [field.key, ""])),
  },
  relationValues: {},
} as any);
editHelper.enableEdit();

onUnmounted(() => {
  useEditMode(props.scratchFormId, "delete");
  deleteForm(props.scratchFormId);
});
</script>
