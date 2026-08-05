<template>
  <div class="flex flex-col gap-2">
    <entity-element-w-y-s-i-w-y-g
      :key="scratchFormId"
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
      <base-button-new
        :label="submitLabel"
        :icon="DamsIcons.Check"
        button-style="accentAccent"
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
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import { extractTaggedRelations } from "@/composables/useComments";
import {
  DamsIcons,
  type BaseRelationValuesInput,
  type WysiwygElement,
} from "@/generated-types/queries";

const props = withDefaults(
  defineProps<{
    /**
     * Must be unique per mounted composer. EntityElementWYSIWYG derives its tagging
     * instance id from `${formId}-${metadataKey}`, and every composer shares the
     * metadataKey "body" — so a shared formId would make two composers collide on
     * injected CSS scope and on tagging-modal ownership. Callers pass e.g.
     * `comment-reply-${subjectId}`.
     */
    scratchFormId: string;
    composer: WysiwygElement;
    initialBody?: string;
    submitLabel: string;
    cancellable?: boolean;
  }>(),
  {
    initialBody: "",
    cancellable: false,
  },
);

const emit = defineEmits<{
  submit: [body: string, taggedRelations: BaseRelationValuesInput[]];
  cancel: [];
}>();

const { t } = useI18n();
const { createForm, getForm, deleteForm } = useFormHelper();
const editHelper = useEditMode(props.scratchFormId);

const isSubmitting = ref<boolean>(false);
const bodyKey = computed<string>(() => props.composer.metadataKey);

// The composer always edits, unlike a detail-page panel that toggles into edit mode.
const composerElement = computed<WysiwygElement>(() => props.composer);

const currentBody = computed<string>(
  () => getForm(props.scratchFormId)?.values?.intialValues?.[bodyKey.value] ?? "",
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

const submit = () => {
  if (!hasContent.value || isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const body = currentBody.value;
    emit(
      "submit",
      body,
      extractTaggedRelations(
        body,
        props.composer.taggingConfiguration?.taggableEntityConfiguration ?? [],
      ),
    );
  } finally {
    isSubmitting.value = false;
  }
};

// Created synchronously in setup, NOT in onMounted: EntityElementWYSIWYG reads this
// form in its own onMounted, and a child's onMounted runs before its parent's. Created
// too late, the editor would find no form, so setFieldValue would no-op on every
// keystroke and the composer could never report any content.
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
