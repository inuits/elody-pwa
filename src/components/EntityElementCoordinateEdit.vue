<template>
  <div
    data-cy="metadata-wrapper"
    v-if="inputField && isPermitted"
    class="py-2 px-2 text-text-light text-sm"
  >
    <MetadataTitle :metadata="{ label: label || 'metadata.no-label' } as any" />
    <div
      v-if="useEditHelper.isEdit"
      data-cy="metadata-value"
      class="flex justify-between"
    >
      <div class="h-10 block">
        <BaseInputTextNumberDatetime
          v-model="computedLatitude"
          label="Latitude"
          :type="inputField.type as any"
          :step="decimalPointStep"
          input-style="defaultWithBorder"
          :disabled="coordinateEditIsDisabled"
        />
        <p class="text-red-default">{{ errorMessage }}</p>
      </div>
      <div class="h-10 block">
        <BaseInputTextNumberDatetime
          v-model="computedLongitude"
          label="Longitude"
          :type="inputField.type as any"
          :step="decimalPointStep"
          input-style="defaultWithBorder"
          :disabled="coordinateEditIsDisabled"
        />
        <p class="text-red-default">{{ errorMessage }}</p>
      </div>
    </div>
    <!-- Per-field editing (field-row.md, inline-editor.md): the value reads
         as text and opens its own inline editor. -->
    <InlineFieldEditor
      v-else-if="isEditingInPlace"
      :type="inputField.type"
      :model-value="value"
      :label="t(label)"
      :saving="saving"
      :error-message="inlineError"
      :dirty="isDirty"
      @save="saveInPlace"
      @cancel="cancelInPlace"
    >
      <template #input>
        <div class="flex gap-1.5">
          <div data-cy="coordinate-latitude" class="grow min-w-0">
            <BaseInputTextNumberDatetime
              v-model="draftLatitude"
              :type="inputField.type as any"
              :step="decimalPointStep"
              input-style="defaultWithBorder"
              aria-label="Latitude"
              :invalid="!!inlineError"
              :disabled="saving"
            />
          </div>
          <div data-cy="coordinate-longitude" class="grow min-w-0">
            <BaseInputTextNumberDatetime
              v-model="draftLongitude"
              :type="inputField.type as any"
              :step="decimalPointStep"
              input-style="defaultWithBorder"
              aria-label="Longitude"
              :invalid="!!inlineError"
              :disabled="saving"
            />
          </div>
        </div>
      </template>
    </InlineFieldEditor>
    <div
      v-else
      ref="fieldValueRef"
      data-cy="field-value"
      class="flex items-center gap-2 min-h-(--field-value-min-height) text-value text-text-secondary"
      :class="
        canEditInPlace
          ? 'cursor-pointer rounded-input px-(--field-value-pad-x) -mx-(--field-value-pad-x) hover:bg-surface-editable-hover'
          : undefined
      "
      v-bind="editableValueAttrs"
      @click="startEditing"
      @keydown.enter.prevent="startEditing"
      @keydown.space.prevent="startEditing"
    >
      <span
        v-if="displayValue"
        :class="{
          'border-b border-dashed border-border-dashed': canEditInPlace,
        }"
        >{{ displayValue }}</span
      >
      <span v-else class="opacity-[var(--opacity-empty)]">{{
        emptyValueLabel
      }}</span>
      <span
        v-if="canEditInPlace"
        data-cy="field-edit-pencil"
        aria-hidden="true"
        class="ml-auto flex shrink-0 text-text-subtle"
      >
        <unicon :name="Unicons.EditAlt.name" height="12" />
      </span>
    </div>
    <p role="status" class="sr-only">{{ savedAnnouncement }}</p>
  </div>
</template>

<script lang="ts" setup>
import type { FormContext } from "vee-validate";
import {
  Collection,
  type Conditional,
  type InputField as InputFieldType,
} from "@/generated-types/queries";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import InlineFieldEditor from "@/components/metadata/InlineFieldEditor.vue";
import MetadataTitle from "@/components/metadata/MetadataTitle.vue";
import {
  type PropType,
  computed,
  onMounted,
  inject,
  nextTick,
  ref,
} from "vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useField } from "vee-validate";
import { useEditMode } from "@/composables/useEdit";
import { useI18n } from "vue-i18n";
import { useConditionalValidation } from "@/composables/useConditionalValidation";
import { useFieldLock } from "@/composables/useFieldLock";
import {
  canUpdateEntity,
  useInPlaceScope,
} from "@/composables/useInPlaceScope";
import { useEmptyValueLabel } from "@/composables/useEmptyValueLabel";
import { buildMetadataInput, saveScope } from "@/composables/useScopedSave";
import { canEditFieldInPlace } from "@/components/metadata/fieldEditability";
import { Unicons } from "@/types";

export type Location = {
  latitude: string;
  longitude: string;
};

const props = defineProps({
  fieldKey: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: Object as PropType<Location>, required: false },
  inputField: { type: Object as PropType<InputFieldType>, required: false },
  entityUuid: { type: String, required: true },
  permitted: { type: Boolean, required: false, default: undefined },
  nonEditableField: { type: Boolean, required: false, default: false },
  readOnly: { type: Boolean, required: false, default: false },
});

const emit = defineEmits<{
  (event: "update:value", value: Location | { latitude: number; longitude: number } | ""): void;
}>();

const mediafileViewerContext: any = inject("mediafileViewerContext", "");

const useEditHelper = ref(useEditMode(props.entityUuid));
const decimalPointStep = 0.000001;
const { getForm } = useFormHelper();
const form: FormContext | undefined = getForm(props.entityUuid);
const { errorMessage } = useField("intialValues." + props.fieldKey);
const { conditionalFieldIsAvailable } = useConditionalValidation();
const isAvailable = computed<boolean>(() => {
  if (!props.inputField?.validation?.available_if) return true;
  return conditionalFieldIsAvailable(
    props.inputField.validation.available_if as Conditional,
    props.entityUuid,
    mediafileViewerContext,
  );
});
const coordinateEditIsDisabled = computed(
  () => !useEditHelper.value.isEdit || !isAvailable.value,
);
const { t, te } = useI18n();
const translated = (key: string, fallback: string): string =>
  te(key) ? t(key) : fallback;
const emptyValueLabel = useEmptyValueLabel();

const isPermitted = computed(() => props.permitted !== false);

onMounted(() => {
  if (props.value) setFormValues(computedLatitude.value, computedLongitude.value);
  useEditHelper.value = useEditMode(props.entityUuid);
});

const setFormValues = (latitude: string, longitude: string) => {
  if (form) {
    form.setFieldValue(`intialValues.${props.fieldKey}`, {
      latitude: Number(latitude),
      longitude: Number(longitude),
    });
  }
};

const computedLongitude = computed<any>({
  get() {
    return props.value?.longitude;
  },
  set(value) {
    if (form) setFormValues(computedLatitude.value, value);
  },
});

const computedLatitude = computed<any>({
  get() {
    return props.value?.latitude;
  },
  set(value) {
    if (form) setFormValues(value, computedLongitude.value);
  },
});

// --- Per-field editing ------------------------------------------------------
const isFilled = (value: unknown): boolean =>
  value !== undefined && value !== null && String(value).trim() !== "";
const displayValue = computed<string>(() =>
  isFilled(props.value?.latitude) && isFilled(props.value?.longitude)
    ? `${props.value!.latitude}, ${props.value!.longitude}`
    : "",
);

const entityFormData = inject<
  | {
      id?: string;
      collection?: Collection;
      onSaved?: (savedEntity: unknown) => void;
    }
  | undefined
>("entityFormData", undefined);
const entityCanUpdate = computed<boolean>(() =>
  canUpdateEntity(useEditHelper.value as any),
);
const { isLocked } = useFieldLock(
  () => props.entityUuid,
  () => props.fieldKey,
);
const canEditInPlace = computed<boolean>(
  () =>
    isAvailable.value &&
    canEditFieldInPlace({
      inputFieldType: props.inputField?.type,
      nonEditableField: props.nonEditableField,
      editableByUser: !props.readOnly && !(props.inputField as any)?.readOnly,
      locked: isLocked.value,
      masked: false,
      entityCanUpdate: entityCanUpdate.value,
      pageInEditMode: !!useEditHelper.value.isEdit,
    }),
);
const editableValueAttrs = computed(() =>
  canEditInPlace.value
    ? {
        role: "button",
        tabindex: 0,
        "aria-label": `${t(props.label)}, ${inPlaceScope.messages.editField()}`,
      }
    : {},
);

const scopeId = computed(() => `${props.entityUuid}:${props.fieldKey}`);
const inPlaceScope = useInPlaceScope(() => scopeId.value);
const isEditingInPlace = ref<boolean>(false);
const saving = ref<boolean>(false);
const inlineError = ref<string | undefined>(undefined);
const savedAnnouncement = ref<string>("");
const draftLatitude = ref<string>("");
const draftLongitude = ref<string>("");
const fieldValueRef = ref<HTMLElement | null>(null);

const asText = (value: unknown): string => (isFilled(value) ? String(value) : "");
const isDirty = computed<boolean>(
  () =>
    asText(draftLatitude.value) !== asText(props.value?.latitude) ||
    asText(draftLongitude.value) !== asText(props.value?.longitude),
);

const focusValue = async () => {
  await nextTick();
  fieldValueRef.value?.focus();
};
const close = () => {
  isEditingInPlace.value = false;
  inlineError.value = undefined;
  inPlaceScope.release();
};
const cancelInPlace = () => {
  close();
  focusValue();
};

// Both coordinates or neither; each within its range.
const validationError = (): string | undefined => {
  const latitude = asText(draftLatitude.value);
  const longitude = asText(draftLongitude.value);
  if (!latitude && !longitude) return undefined;
  if (!latitude || !longitude)
    return translated(
      "inline-edit.coordinates-both",
      "Fill in both latitude and longitude",
    );
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90)
    return translated(
      "inline-edit.latitude-range",
      "Latitude must be between -90 and 90",
    );
  if (!Number.isFinite(lon) || lon < -180 || lon > 180)
    return translated(
      "inline-edit.longitude-range",
      "Longitude must be between -180 and 180",
    );
  return undefined;
};

const saveInPlace = async () => {
  if (saving.value) return;
  if (!isDirty.value) {
    cancelInPlace();
    return;
  }
  const error = validationError();
  if (error) {
    inlineError.value = error;
    return;
  }
  const cleared = !asText(draftLatitude.value);
  const value = cleared
    ? ""
    : {
        latitude: Number(draftLatitude.value),
        longitude: Number(draftLongitude.value),
      };
  saving.value = true;
  inlineError.value = undefined;
  try {
    const savedEntity = await saveScope({
      entityId: entityFormData?.id || props.entityUuid,
      collection: entityFormData?.collection ?? Collection.Entities,
      formInput: buildMetadataInput(props.fieldKey, value),
    });
    form?.resetField(`intialValues.${props.fieldKey}`, { value });
    emit("update:value", value);
    if (savedEntity) entityFormData?.onSaved?.(savedEntity);
    savedAnnouncement.value = inPlaceScope.messages.saved();
    close();
    focusValue();
  } catch {
    inlineError.value = inPlaceScope.messages.saveFailed();
  } finally {
    saving.value = false;
  }
};

const startEditing = () => {
  if (!canEditInPlace.value || isEditingInPlace.value) return;
  const opened = inPlaceScope.open({
    isDirty: () => isDirty.value,
    close,
    save: async () => {
      await saveInPlace();
      return !isEditingInPlace.value;
    },
    discard: cancelInPlace,
  });
  if (!opened) return;
  draftLatitude.value = asText(props.value?.latitude);
  draftLongitude.value = asText(props.value?.longitude);
  savedAnnouncement.value = "";
  inlineError.value = undefined;
  isEditingInPlace.value = true;
};
</script>
