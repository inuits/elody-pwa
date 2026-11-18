<template>
  <div class="w-full">
    <BaseInputAutocomplete
      autocomplete-style="defaultWithBorder"
      :options="options"
      select-type="single"
      :model-value="selectedOptions"
      :disabled="disabled"
      :loading="isLoading"
      :create-option-config="{
        canCreateOption: inputField.canCreateEntityFromOption ?? false,
      }"
      :disable-virtual-keyboard-context="true"
      :search-filter="(option: unknown) => option"
      :replace-on-tag-click="isChoosingCandidate"
      @search-change="handleSearchChange"
      @update:model-value="handleSelect"
      @add-option="handleCreateFromTag"
    />
    <p
      v-if="isChoosingCandidate"
      data-testid="candidate-warning"
      class="mt-0.5 text-xs text-orange-default"
    >
      {{ t("autocomplete.choose-candidate") }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
  toRef,
  watch,
} from "vue";
import debounce from "lodash.debounce";
import { useI18n } from "vue-i18n";
import type { ApolloError } from "@apollo/client/core";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import {
  type DropdownOption,
  type Entitytyping,
  type InputField,
  GetEntityByIdDocument,
} from "@/generated-types/queries";
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";
import { useManageEntities } from "@/composables/useManageEntities";
import { apolloClient } from "@/main";
import { getEntityTitle, looksLikeEntityId } from "@/helpers";
import { createEntityFromOptionMetadata } from "@/composables/createEntityFromOptionMetadata";

const props = defineProps<{
  modelValue: string | undefined;
  inputField: InputField;
  formId: string;
  cellKey?: string;
  disabled?: boolean;
  candidateIds?: string[];
}>();

const { t } = useI18n();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | undefined): void;
  (e: "linked-entity-missing", value: boolean): void;
}>();

const allEntitiesHelper = ref<ReturnType<typeof useGetDropdownOptions>>();
const selectedOptions = ref<DropdownOption[]>([]);
const isCreatingEntity = ref(false);
const { createEntity } = useManageEntities();

const hasSearched = ref(false);
const candidateSearchLabel = ref<string>();

const currentKey = computed(() =>
  Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue,
);

const isChoosingCandidate = computed(
  () =>
    !!props.candidateIds?.length &&
    !looksLikeEntityId(currentKey.value as string),
);

const options = computed<DropdownOption[]>(() => {
  const all = allEntitiesHelper.value?.entityDropdownOptions ?? [];
  if (!isChoosingCandidate.value || hasSearched.value) return all;
  return all.filter((option) =>
    props.candidateIds!.includes(option.value as string),
  );
});

const handleSearchChange = (query: string) => {
  hasSearched.value = !!query;
  if (!query && isChoosingCandidate.value && candidateSearchLabel.value) {
    debouncedSearch(candidateSearchLabel.value);
    return;
  }
  debouncedSearch(query);
};

const isLoading = computed(
  () =>
    allEntitiesHelper.value?.entitiesLoading.value || isCreatingEntity.value,
);

const stateKey = computed(
  () =>
    `${props.formId}-${props.inputField.relationType}-${props.cellKey ?? ""}-fetchAll`,
);

const handleSelect = (
  options: DropdownOption[] | DropdownOption | undefined,
) => {
  if (!options) {
    selectedOptions.value = [];
    emit("update:modelValue", undefined);
    return;
  }
  const arr = Array.isArray(options) ? options : [options];
  selectedOptions.value = arr;
  emit("update:modelValue", arr[0]?.value as string | undefined);
};

const syncSelectedFromModelValue = async () => {
  const key = Array.isArray(props.modelValue)
    ? props.modelValue[0]
    : props.modelValue;
  if (!key) {
    selectedOptions.value = [];
    return;
  }
  if (
    selectedOptions.value[0]?.value === key &&
    selectedOptions.value[0]?.label &&
    selectedOptions.value[0]?.label !== key
  )
    return;

  const label = await resolveEntityLabel(key);
  selectedOptions.value = [{ label, value: key }];
};

const isNotFoundError = (error: unknown): boolean =>
  (error as ApolloError)?.graphQLErrors?.some(
    (graphQLError) =>
      (graphQLError.extensions?.response as { status?: number } | undefined)
        ?.status === 404,
  ) ?? false;

const resolveEntityLabel = async (key: string): Promise<string> => {
  const entityType = props.inputField.entityType as Entitytyping | undefined;
  if (!entityType) return key;
  if (!looksLikeEntityId(key)) return key;
  try {
    const result = await apolloClient.query({
      query: GetEntityByIdDocument,
      variables: { id: key, type: entityType },
      fetchPolicy: "no-cache",
    });
    const entity = result.data?.Entity;
    emit("linked-entity-missing", false);
    return entity ? getEntityTitle(entity) : key;
  } catch (error) {
    emit("linked-entity-missing", isNotFoundError(error));
    return key;
  }
};

const debouncedSearch = debounce((query: string) => {
  allEntitiesHelper.value?.getAutocompleteOptions(query);
}, 250);

const handleCreateFromTag = async (option: DropdownOption) => {
  if (!props.inputField.canCreateEntityFromOption) return;
  if (props.inputField.deferEntityCreation) {
    selectedOptions.value = [{ value: option.label, label: option.label }];
    emit("update:modelValue", option.label);
    return;
  }
  isCreatingEntity.value = true;
  try {
    const newEntity = await createEntity({
      entityType: props.inputField.entityType as any,
      metadata: createEntityFromOptionMetadata(
        props.inputField.metadataKeyToCreateEntityFromOption,
        option.label,
        props.inputField.metadataToCreateEntityFromOption,
      ),
    });
    const newOption: DropdownOption = {
      value: newEntity.uuid,
      label: option.label,
      icon: undefined,
    };
    selectedOptions.value = [newOption];
    emit("update:modelValue", newEntity.uuid);
  } finally {
    isCreatingEntity.value = false;
  }
};

onBeforeMount(() => {
  allEntitiesHelper.value = useGetDropdownOptions(
    stateKey.value,
    "get",
    props.inputField.entityType as any,
    toRef("fetchAll"),
    props.inputField.relationType ?? "",
    "",
    props.inputField.advancedFilterInputForSearchingOptions ?? undefined,
    props.inputField.advancedFilterInputForRetrievingAllOptions?.length
      ? (props.inputField.advancedFilterInputForRetrievingAllOptions as any)
      : (props.inputField.advancedFilterInputForRetrievingOptions as any),
    props.formId,
    undefined,
    undefined,
    props.inputField.optionLabelKeys ?? undefined,
  );
});

onMounted(async () => {
  if (!props.disabled) await allEntitiesHelper.value?.initialize();
  if (!props.disabled && isChoosingCandidate.value) {
    candidateSearchLabel.value = currentKey.value as string;
    await allEntitiesHelper.value?.getAutocompleteOptions(
      candidateSearchLabel.value,
    );
  }
  syncSelectedFromModelValue();
});

onBeforeUnmount(() => {
  debouncedSearch.cancel();
});

watch(() => props.modelValue, syncSelectedFromModelValue);
</script>
