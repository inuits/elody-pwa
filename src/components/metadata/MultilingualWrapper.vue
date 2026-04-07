<template>
  <div v-if="isMultilingualEnabled">
    <slot :localized-metadata="localizedMetadata" />
  </div>
  <slot v-else />
</template>

<script lang="ts" setup>
import {
  computed,
  inject,
  nextTick,
  onMounted,
  provide,
  ref,
  watch,
} from "vue";
import {
  useMultilingualField,
  getMultilingualProvideKey,
  type TranslationEntry,
} from "@/composables/useMultilingualField";
import { useFormHelper } from "@/composables/useFormHelper";
import { ValidationFields } from "@/generated-types/queries";

const props = withDefaults(
  defineProps<{
    metadata: Record<string, any>;
    formId: string;
    hideSelector?: boolean;
  }>(),
  { hideSelector: false },
);

const emit = defineEmits<{
  (event: "update:metadata", metadata: Record<string, any>): void;
}>();

const config = inject("config") as any;
const { getForm, setMultilingualTranslations } = useFormHelper();

const isMultilingualEnabled = computed(
  () =>
    !!config?.features?.supportsMultilingualMetadataEditing &&
    !!props.metadata.isMultilingual,
);

const translations = ref<TranslationEntry[]>([]);

const fieldKey = computed(
  () => props.metadata.key || props.metadata.metadataKey || "",
);

const getTranslationsSource = (): TranslationEntry[] => {
  const metadataValue = props.metadata.value;
  if (Array.isArray(metadataValue)) return metadataValue;

  const form = getForm(props.formId);
  const formValue =
    form?.values?.[ValidationFields.IntialValues]?.[fieldKey.value];
  if (Array.isArray(formValue)) return formValue;

  return [];
};

const initTranslations = () => {
  if (!isMultilingualEnabled.value) return;
  const source = getTranslationsSource();
  translations.value = source.map((entry: TranslationEntry) => ({
    ...entry,
  }));
};

initTranslations();

const { selectedLocale, currentValue, localeOptions } = useMultilingualField(
  translations,
  fieldKey.value,
);

const localizedMetadata = computed(() => ({
  ...props.metadata,
  value: currentValue.value,
}));

const setLocaleValueInForm = (value: string) => {
  const form = getForm(props.formId);
  if (!form) return;
  const formFieldKey = `${ValidationFields.IntialValues}.${fieldKey.value}`;
  form.setFieldValue(formFieldKey, value);
};

const persistTranslations = () => {
  if (!isMultilingualEnabled.value) return;
  setMultilingualTranslations(
    props.formId,
    fieldKey.value,
    translations.value.map((t) => ({ ...t })),
  );
};

const isUpdatingFromForm = ref(false);

const watchFormFieldChanges = () => {
  const form = getForm(props.formId);
  if (!form) return;
  watch(
    () => form.values?.[ValidationFields.IntialValues]?.[fieldKey.value],
    (newFormValue) => {
      if (!isMultilingualEnabled.value) return;
      if (typeof newFormValue !== "string") return;
      if (newFormValue === currentValue.value) return;
      isUpdatingFromForm.value = true;
      currentValue.value = newFormValue;
      isUpdatingFromForm.value = false;
    },
  );
};

onMounted(() => {
  persistTranslations();
  watchFormFieldChanges();
});

watch(currentValue, () => {
  persistTranslations();
  emit("update:metadata", {
    ...props.metadata,
    value: [...translations.value],
  });
});

watch(selectedLocale, () => {
  nextTick(() => {
    setLocaleValueInForm(currentValue.value);
    persistTranslations();
  });
});

provide(getMultilingualProvideKey(fieldKey.value), {
  currentValue,
  selectedLocale,
  localeOptions,
  isEnabled: isMultilingualEnabled,
  showSelector: !props.hideSelector,
  updateValue: (newValue: string) => (currentValue.value = newValue),
});
</script>
