<template>
  <BaseModal
    :modal-type="TypeModals.RelationPicker"
    modal-height-style="max-h-[75vh] my-[12.5vh]"
    class="md:w-(--relation-picker-width) md:!min-w-0"
    :title="title"
    @hide-modal="close"
  >
    <template #headerExtra>
      <span
        v-if="isOpen"
        role="status"
        class="p-(--chip-padding) rounded-overlay bg-surface text-hint font-bold text-text-panel-header whitespace-nowrap"
      >
        {{ t("inline-edit.picker-count", [count]) }}
      </span>
    </template>
    <div v-if="isOpen" ref="body" class="flex flex-col">
      <div class="p-(--modal-body-pad) flex flex-col gap-2">
        <BaseSearchPill
          v-model="query"
          :label="title"
          :placeholder="t('inline-edit.picker-search')"
          :loading="loading"
          @keydown.down.prevent="focusRow(0)"
        />
        <!-- fixed height: the dialog keeps its size while results come and go -->
        <div
          data-cy="relation-picker-results"
          class="h-(--relation-picker-results-height) overflow-auto"
        >
          <ul
            v-if="results.length"
            role="listbox"
            :aria-label="title"
            :aria-multiselectable="!single"
          >
            <li
              v-for="(option, index) in results"
              :key="option.value"
              role="option"
              tabindex="-1"
              :aria-selected="isSelected(option)"
              :data-cy="`relation-picker-option-${option.value}`"
              class="grid grid-cols-[1rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 px-2 py-2 border-b border-border-subtle rounded-input cursor-pointer text-table"
              :class="
                isSelected(option)
                  ? 'bg-accent-wash'
                  : 'hover:bg-surface-row-hover'
              "
              @click="choose(option)"
              @keydown.enter.prevent="choose(option)"
              @keydown.space.prevent="choose(option)"
              @keydown.down.prevent="focusRow(index + 1)"
              @keydown.up.prevent="focusRow(index - 1)"
            >
              <unicon
                v-if="isSelected(option)"
                :name="Unicons.Check.name"
                height="14"
                aria-hidden="true"
                class="fill-commit"
              />
              <span v-else />
              <span class="font-bold text-text-strong truncate">
                {{ option.label }}
              </span>
              <span
                v-if="option.secondaryLabel"
                class="text-text-secondary truncate"
              >
                {{ option.secondaryLabel }}
              </span>
            </li>
          </ul>
          <p
            v-else-if="!loading"
            class="flex items-center gap-2 py-2 text-table text-text-muted"
          >
            {{ t("inline-edit.picker-no-results") }}
            <BaseButtonNew
              v-if="canCreate && query.trim()"
              data-cy="relation-picker-create"
              class="w-auto!"
              button-style="primary"
              button-size="sm"
              :label="t('inline-edit.picker-create', [query.trim()])"
              @click="create"
            />
          </p>
        </div>
      </div>
      <div
        v-if="!single"
        class="flex items-center justify-end gap-2 p-(--modal-footer-pad) border-t border-border-subtle"
      >
        <BaseButtonNew
          data-cy="relation-picker-cancel"
          class="w-auto!"
          button-style="ghost"
          :label="t('inline-edit.cancel')"
          @click="close"
        />
        <BaseButtonNew
          data-cy="relation-picker-add"
          class="w-auto!"
          button-style="commit"
          :label="t('inline-edit.picker-add')"
          :disabled="selected.length === 0"
          @click="commit(selected)"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, unref, watch } from "vue";
import { useI18n } from "vue-i18n";
import debounce from "lodash.debounce";
import {
  type DropdownOption,
  type Entitytyping,
  TypeModals,
} from "@/generated-types/queries";
import { Unicons } from "@/types";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseSearchPill from "@/components/base/BaseSearchPill.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useGetDropdownOptionsState } from "@/composables/useGetDropdownOptionsState";
import type { UseGetDropdownOptionsParams } from "@/composables/useGetDropdownOptions";

const props = defineProps<{
  acceptedType: string;
  // the inline autocomplete's "fetchAll" config: the picker searches the same way
  optionsConfig: UseGetDropdownOptionsParams;
  single: boolean;
  canCreate?: boolean;
}>();

const emit = defineEmits<{
  (event: "picked", options: DropdownOption[]): void;
  (event: "create", label: string): void;
}>();

const { t, te } = useI18n();
const { closeModal, getModalInfo } = useBaseModal();

// its own state, not the autocomplete's: typing here must not change the
// inline dropdown's options
const search = useGetDropdownOptionsState(
  props.optionsConfig.entityType as Entitytyping,
  props.optionsConfig.parent!,
  props.optionsConfig.relationType,
  props.optionsConfig.fromRelationType,
  props.optionsConfig.searchFilterInput,
  props.optionsConfig.advancedFilterInputForRetrievingOptions as any,
  props.optionsConfig.formId,
  props.optionsConfig.relationFilter,
  props.optionsConfig.optionsOrderByKey,
  props.optionsConfig.optionLabelKeys,
);
const results = computed<DropdownOption[]>(() =>
  unref(search.entityDropdownOptions),
);
const count = computed<number>(() => unref(search.entitiesCount));
const loading = computed<boolean>(() => unref(search.entitiesLoading));

const isOpen = computed<boolean>(
  () => getModalInfo(TypeModals.RelationPicker).open,
);
// entity-picker.md: "Kies persoon", the type in words, sentence case
const title = computed<string>(() => {
  const key = `entity-translations.${props.acceptedType.toLowerCase()}`;
  const type = te(key) ? t(key, 1).toLocaleLowerCase() : props.acceptedType;
  return t("inline-edit.browse-title", [type]);
});

const query = ref<string>("");
const selected = ref<DropdownOption[]>([]);
const body = ref<HTMLElement>();

const debouncedSearch = debounce(
  (value: string) => search.getAutocompleteOptions(value),
  250,
);
watch(query, (value) => debouncedSearch(value));
onBeforeUnmount(() => debouncedSearch.cancel());

watch(isOpen, async (open) => {
  if (!open) return;
  query.value = "";
  selected.value = [];
  debouncedSearch.cancel();
  search.getAutocompleteOptions("");
  await nextTick();
  body.value?.querySelector("input")?.focus();
});

const isSelected = (option: DropdownOption): boolean =>
  selected.value.some((entry) => entry.value === option.value);

const focusRow = (index: number) => {
  if (index < 0) return body.value?.querySelector("input")?.focus();
  const rows = body.value?.querySelectorAll<HTMLElement>("[role='option']");
  rows?.[Math.min(index, rows.length - 1)]?.focus();
};

const toPicked = ({ label, value }: DropdownOption): DropdownOption => ({
  label,
  value,
});

// entity-picker.md: multi select keeps the modal open, single commits
const choose = (option: DropdownOption) => {
  if (props.single) return commit([option]);
  selected.value = isSelected(option)
    ? selected.value.filter((entry) => entry.value !== option.value)
    : [...selected.value, option];
};

const close = () => closeModal(TypeModals.RelationPicker);

const commit = (options: DropdownOption[]) => {
  emit("picked", options.map(toPicked));
  close();
};

// closes first: the create flow opens a confirm, and modals never stack
const create = () => {
  const label = query.value.trim();
  close();
  emit("create", label);
};
</script>
