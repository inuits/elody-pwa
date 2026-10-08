<template>
  <!-- Per-field editing of a value on a list row that lives on the relation
       between the row's entity and the page's entity (e.g. a contact
       person's role in an organization). The row is a link: clicks on the
       value and in its editor are kept from it.
       See docs/design-system/components/field-row.md. -->
  <div
    v-if="isEditing"
    data-cy="list-item-inline-editor"
    @click.stop.prevent
  >
    <InlineFieldEditor
      :type="inputFieldType"
      :model-value="currentValue"
      :label="label"
      :options="(metadata.inputField?.options as any) ?? []"
      :required="isRequired"
      :saving="saving"
      :error-message="errorMessage"
      @save="save"
      @cancel="cancel"
      @dirty-change="dirty = $event"
      @draft-change="latestDraft = $event"
    />
  </div>
  <div
    v-else
    ref="valueRef"
    data-cy="list-item-inline-value"
    class="flex items-center gap-2"
    :class="
      canEdit
        ? 'cursor-pointer rounded-input px-(--field-value-pad-x) -mx-(--field-value-pad-x) hover:bg-surface-editable-hover'
        : undefined
    "
    v-bind="editableAttrs"
    @click="onValueClick"
    @keydown.enter.prevent.stop="start"
    @keydown.space.prevent.stop="start"
  >
    <div class="min-w-0"><slot /></div>
    <span
      v-if="canEdit"
      data-cy="field-edit-pencil"
      aria-hidden="true"
      class="ml-auto flex shrink-0 text-text-subtle"
    >
      <unicon :name="Unicons.EditAlt.name" height="12" />
    </span>
  </div>
  <p role="status" class="sr-only">{{ savedAnnouncement }}</p>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, unref } from "vue";
import { useI18n } from "vue-i18n";
import { validate } from "vee-validate";
import {
  Collection,
  ValidationRules,
  type Metadata,
} from "@/generated-types/queries";
import InlineFieldEditor from "@/components/metadata/InlineFieldEditor.vue";
import { canEditFieldInPlace } from "@/components/metadata/fieldEditability";
import { useFieldValidation } from "@/components/metadata/useFieldValidation";
import { useEditMode } from "@/composables/useEdit";
import { useEditScope } from "@/composables/useEditScope";
import { useBaseNotification } from "@/composables/useBaseNotification";
import {
  buildRelationMetadataInput,
  saveScope,
  toMetadataValue,
} from "@/composables/useScopedSave";
import { Unicons } from "@/types";

const props = defineProps<{
  metadata: Metadata;
  // The page's entity (e.g. the organization) and the row's entity (a user).
  parentEntityId: string;
  linkedEntityId: string;
  // The row entity's relations: the one pointing back to the page's entity
  // holds the value.
  linkedEntityRelations?: Record<string, any[]> | object;
  refetchEntities?: () => Promise<void>;
}>();

const { t, te } = useI18n();
const translated = (key: string, fallback: string): string =>
  te(key) ? t(key) : fallback;
const { displaySuccessNotification } = useBaseNotification();
const { requestOpen, release } = useEditScope();
const pageEditState = useEditMode(props.parentEntityId);

const label = computed<string>(() => t(props.metadata.label ?? ""));
const inputFieldType = computed<string>(
  () => (props.metadata.inputField as any)?.type ?? "",
);

// The relation type on the row's entity that points to the page's entity.
const relationType = computed<string | undefined>(() => {
  const relations = (props.linkedEntityRelations ?? {}) as Record<
    string,
    any[]
  >;
  return Object.keys(relations).find((type) =>
    relations[type]?.some?.((relation) => relation?.key === props.parentEntityId),
  );
});

const entityCanUpdate = computed<boolean>(() =>
  ["edit", "edit-delete"].includes(
    unref((pageEditState as any).permittedEditMode) as string,
  ),
);
const canEdit = computed<boolean>(
  () =>
    !!props.parentEntityId &&
    !!props.linkedEntityId &&
    !!relationType.value &&
    canEditFieldInPlace({
      inputFieldType: inputFieldType.value,
      editableByUser: !(props.metadata as any).readOnly,
      locked: false,
      masked: false,
      entityCanUpdate: entityCanUpdate.value,
      pageInEditMode: !!unref((pageEditState as any).isEdit),
    }),
);
const editableAttrs = computed(() =>
  canEdit.value
    ? {
        role: "button",
        tabindex: 0,
        "aria-label": `${label.value}, ${translated("inline-edit.edit-field", "edit")}`,
      }
    : {},
);

// A pill shows the stored value as its label.
const currentValue = computed<unknown>(() => {
  const value = props.metadata.value as any;
  if (value && typeof value === "object" && "formatter" in value)
    return value.label;
  return value;
});

const { getValidationRules } = useFieldValidation(
  () => (props.metadata.inputField as any)?.validation,
);
const isRequired = computed<boolean>(() =>
  ((props.metadata.inputField as any)?.validation?.value ?? []).includes(
    ValidationRules.Required,
  ),
);

const isEditing = ref<boolean>(false);
const dirty = ref<boolean>(false);
const saving = ref<boolean>(false);
const errorMessage = ref<string | undefined>(undefined);
const savedAnnouncement = ref<string>("");
const valueRef = ref<HTMLElement | null>(null);
const scopeId = computed(
  () =>
    `${props.parentEntityId}:${props.linkedEntityId}:${props.metadata.key}`,
);

const close = () => {
  isEditing.value = false;
  dirty.value = false;
  errorMessage.value = undefined;
  release(scopeId.value);
};
const focusValue = async () => {
  await nextTick();
  valueRef.value?.focus();
};
const cancel = () => {
  close();
  focusValue();
};

// The draft the leave prompt saves.
const latestDraft = ref<unknown>(undefined);
const save = async (value: unknown) => {
  const result = await validate(
    value,
    getValidationRules(true, isRequired.value),
    { name: label.value, label: label.value },
  );
  if (!result.valid) {
    errorMessage.value = result.errors[0];
    return;
  }
  saving.value = true;
  errorMessage.value = undefined;
  try {
    await saveScope({
      entityId: props.linkedEntityId,
      collection: Collection.Entities,
      formInput: buildRelationMetadataInput(
        { key: props.parentEntityId, type: relationType.value! },
        props.metadata.key,
        toMetadataValue(value),
      ),
    });
    displaySuccessNotification(
      "notifications.success.entityUpdated.title",
      "notifications.success.entityUpdated.description",
    );
    savedAnnouncement.value = translated("inline-edit.saved", "Saved");
    close();
    await props.refetchEntities?.();
    focusValue();
  } catch {
    errorMessage.value = translated(
      "inline-edit.save-failed",
      "Saving failed, try again",
    );
  } finally {
    saving.value = false;
  }
};

const start = () => {
  if (!canEdit.value || isEditing.value) return;
  const opened = requestOpen({
    id: scopeId.value,
    isDirty: () => dirty.value,
    close,
    save: async () => {
      await save(latestDraft.value ?? currentValue.value);
      return !isEditing.value;
    },
    discard: cancel,
  });
  if (!opened) return;
  latestDraft.value = undefined;
  savedAnnouncement.value = "";
  isEditing.value = true;
};

// The row is a link: an editable value keeps the click to itself.
const onValueClick = (event: MouseEvent) => {
  if (!canEdit.value) return;
  event.preventDefault();
  event.stopPropagation();
  start();
};
</script>
