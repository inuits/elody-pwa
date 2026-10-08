<template>
  <!-- Per-field editing of a value on a list row that lives on the relation
       between the row's entity and the page's entity (e.g. a contact
       person's role in an organization). The row is a link: clicks on the
       value and in its editor are kept from it.
       See docs/design-system/components/field-row.md. -->
  <div
    v-if="isEditing"
    ref="editorRef"
    data-cy="list-item-inline-editor"
    @click="keepClickInEditor"
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
    @keydown.enter="onActivateKey"
    @keydown.space="onActivateKey"
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
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  unref,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import { validate } from "vee-validate";
import {
  Collection,
  InputFieldTypes,
  ValidationRules,
  type Metadata,
} from "@/generated-types/queries";
import InlineFieldEditor from "@/components/metadata/InlineFieldEditor.vue";
import { canEditFieldInPlace } from "@/components/metadata/fieldEditability";
import { useFieldValidation } from "@/components/metadata/useFieldValidation";
import { useEditMode } from "@/composables/useEdit";
import {
  canUpdateEntity,
  isInnerControlClick,
  useInPlaceScope,
} from "@/composables/useInPlaceScope";
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

const { t } = useI18n();
const { displaySuccessNotification } = useBaseNotification();
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
  canUpdateEntity(pageEditState as any),
);
const canEdit = computed<boolean>(
  () =>
    !!props.parentEntityId &&
    !!props.linkedEntityId &&
    !!relationType.value &&
    canEditFieldInPlace({
      inputFieldType: inputFieldType.value,
      nonEditableField: !!(props.metadata as any).nonEditableField,
      editableByUser: !(props.metadata as any).readOnly,
      // Locks belong to the page entity's own fields, not to the relation.
      locked: false,
      masked: !!(props.metadata as any).masked,
      entityCanUpdate: entityCanUpdate.value,
      pageInEditMode: !!unref((pageEditState as any).isEdit),
    }),
);
const editableAttrs = computed(() =>
  canEdit.value
    ? {
        role: "button",
        tabindex: 0,
        "aria-label": `${label.value}, ${inPlaceScope.messages.editField()}`,
      }
    : {},
);

// What the relation stores for this key now. Its shape decides how a new
// value is sent: a key stored as a list (podiumnet's roles) gets a single
// choice as a one-item list, as the whole-form save did.
const storedValue = computed<unknown>(() => {
  const relations = (props.linkedEntityRelations ?? {}) as Record<
    string,
    any[]
  >;
  const relation = relations[relationType.value ?? ""]?.find?.(
    (candidate) => candidate?.key === props.parentEntityId,
  );
  return relation?.metadata?.find?.(
    (entry: { key: string }) => entry?.key === props.metadata.key,
  )?.value;
});
const toStoredShape = (value: unknown): unknown => {
  if (!Array.isArray(storedValue.value) || Array.isArray(value)) return value;
  return value === "" ? [] : [value];
};

// A pill shows the stored value as its label.
const isMultiple = computed<boolean>(
  () => inputFieldType.value === InputFieldTypes.DropdownMultiselectMetadata,
);
const currentValue = computed<unknown>(() => {
  const raw = props.metadata.value as any;
  const value =
    storedValue.value !== undefined
      ? storedValue.value
      : raw && typeof raw === "object" && "formatter" in raw
        ? raw.label
        : raw;
  // A single choice stored as a one-item list starts as that one value.
  if (!isMultiple.value && Array.isArray(value)) return value[0] ?? "";
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
const inPlaceScope = useInPlaceScope(() => scopeId.value);

const close = () => {
  isEditing.value = false;
  dirty.value = false;
  errorMessage.value = undefined;
  inPlaceScope.release();
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
        toStoredShape(toMetadataValue(value)),
      ),
    });
    displaySuccessNotification(
      "notifications.success.entityUpdated.title",
      "notifications.success.entityUpdated.description",
    );
    savedAnnouncement.value = inPlaceScope.messages.saved();
    close();
    await props.refetchEntities?.();
    focusValue();
  } catch {
    errorMessage.value = inPlaceScope.messages.saveFailed();
  } finally {
    saving.value = false;
  }
};

const start = () => {
  if (!canEdit.value || isEditing.value) return;
  const opened = inPlaceScope.open({
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

// The row is a link: an editable value keeps the click to itself, except a
// click on a link or button inside the value.
const onValueClick = (event: MouseEvent) => {
  if (!canEdit.value) return;
  if (isInnerControlClick(event, valueRef.value)) return;
  event.preventDefault();
  event.stopPropagation();
  start();
};

// Enter and Space open the editor only when the value itself has focus.
const onActivateKey = (event: KeyboardEvent) => {
  if (!canEdit.value || event.target !== event.currentTarget) return;
  event.preventDefault();
  event.stopPropagation();
  start();
};

// Clicks in the editor never reach the row's link. Only a checkbox or radio
// (and its label) keeps its default action, so it can toggle; everything
// else, buttons included, would otherwise follow the link it sits in.
const TOGGLE_SELECTOR =
  "input[type='checkbox'], input[type='radio'], label";
const keepClickInEditor = (event: MouseEvent) => {
  event.stopPropagation();
  if (!(event.target as Element | null)?.closest?.(TOGGLE_SELECTOR))
    event.preventDefault();
};

// While the editor is open its row's link doesn't navigate: a click
// elsewhere on the row (or one that lands there after a dropdown menu
// closed under the pointer) is stopped before the link handles it. Clicks
// inside the editor still reach the editor, but lose the link's default
// action up front, since a control may stop its own click before the
// editor's wrapper sees it (a dropdown's X); only toggles keep theirs.
const editorRef = ref<HTMLElement | null>(null);
let rowLink: HTMLElement | null = null;
const holdRowLink = (event: MouseEvent) => {
  const target = event.target as Element | null;
  if (target && editorRef.value?.contains(target)) {
    if (!target.closest?.(TOGGLE_SELECTOR)) event.preventDefault();
    return;
  }
  event.preventDefault();
  event.stopPropagation();
};
const releaseRowLink = () => {
  rowLink?.removeEventListener("click", holdRowLink, true);
  rowLink = null;
};
watch(
  isEditing,
  (editing) => {
    releaseRowLink();
    if (!editing) return;
    rowLink = editorRef.value?.closest("a") ?? null;
    rowLink?.addEventListener("click", holdRowLink, true);
  },
  { flush: "post" },
);
onBeforeUnmount(releaseRowLink);
</script>
