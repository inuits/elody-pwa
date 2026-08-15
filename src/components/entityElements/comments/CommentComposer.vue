<template>
  <div class="flex flex-col gap-2">
    <entity-element-w-y-s-i-w-y-g
      :key="`${scratchFormId}-${resetCount}`"
      :form-id="scratchFormId"
      :element="composerElement"
      :display-inline="true"
    />
    <div class="flex items-center justify-end gap-2">
      <button
        v-if="cancellable"
        class="px-3 py-1 rounded-md text-text-body hover:bg-neutral-30 transition-colors"
        @click="emit('cancel')"
      >
        {{ t("comments.cancel") }}
      </button>
      <base-button
        :label="submitLabel"
        :icon="DamsIcons.Check"
        button-style="commit"
        :disabled="!hasContent || isSubmitting"
        @click="submit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import EntityElementWYSIWYG from "@/components/entityElements/WYSIWYG/EntityElementWYSIWYG.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import { extractTaggedRelations } from "@/composables/useComments";
import {
  DamsIcons,
  ValidationFields,
  type BaseRelationValuesInput,
  type WysiwygElement,
} from "@/generated-types/queries";

const props = withDefaults(
  defineProps<{
    scratchFormId: string;
    composer: WysiwygElement;
    initialBody?: string;
    submitLabel: string;
    cancellable?: boolean;
    onSubmit: (
      body: string,
      taggedRelations: BaseRelationValuesInput[],
    ) => unknown;
  }>(),
  {
    initialBody: "",
    cancellable: false,
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

const currentBody = computed<string>(
  () =>
    getForm(props.scratchFormId)?.values?.intialValues?.[bodyKey.value] ?? "",
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

const resetCount = ref<number>(0);

const clear = () => {
  getForm(props.scratchFormId)?.setFieldValue(
    `${ValidationFields.IntialValues}.${bodyKey.value}`,
    "",
  );
  resetCount.value += 1;
};

const submit = async () => {
  if (!hasContent.value || isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const body = currentBody.value;
    await props.onSubmit(
      body,
      extractTaggedRelations(
        body,
        props.composer.taggingConfiguration?.taggableEntityConfiguration ?? [],
      ),
    );
    if (!props.initialBody) clear();
  } finally {
    isSubmitting.value = false;
  }
};

createForm(props.scratchFormId, {
  intialValues: { [bodyKey.value]: props.initialBody },
  relationValues: {},
} as any);
editHelper.enableEdit();

onUnmounted(() => {
  useEditMode(props.scratchFormId, "delete");
  deleteForm(props.scratchFormId);
});
</script>
