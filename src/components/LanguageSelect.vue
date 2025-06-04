<template>
  <div data-cy="language-select" :key="locale" class="float-right">
    <BaseDropdownNew
      v-if="languageOptions"
      :model-value="selectedLanguageOption"
      @update:model-value="setLanguage"
      :options="languageOptions"
      label-position="inline"
      dropdown-style="default"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import {
  DamsIcons,
  TypeModals,
  type DropdownOption,
} from "@/generated-types/queries";
import { useStateManagement } from "@/composables/useStateManagement";
import { useEditMode } from "@/composables/useEdit";
import { useBaseModal } from "@/composables/useBaseModal";
import { useConfirmModal } from "@/composables/useConfirmModal";

const { closeModal } = useBaseModal();
const { availableLocales, locale, t } = useI18n();
const { updateGlobalState, getGlobalState } = useStateManagement();
const { initializeConfirmModal } = useConfirmModal();
const selectedLanguageOption = ref<DropdownOption | undefined>();
const config = inject("config") as any;
const route = useRoute();

const createOptionsFromAvailableLanguages = (
  availableLanguages: string[],
): DropdownOption[] => {
  return availableLanguages.map((language) => ({
    icon: DamsIcons.NoIcon,
    label: t("language." + language),
    value: language,
  }));
};

const languageOptions = computed(() => {
  return createOptionsFromAvailableLanguages(availableLocales);
});

const displayPreferences = getGlobalState("_displayPreferences");
if (displayPreferences?.lang) {
  locale.value = displayPreferences.lang;
}

const setSelectedLanguageOption = (): void => {
  selectedLanguageOption.value = languageOptions.value.find(
    (language) => language.value === locale.value,
  );
};

onMounted(() => {
  setSelectedLanguageOption();
});

watch(selectedLanguageOption, () => {
  if (selectedLanguageOption.value) {
    locale.value = selectedLanguageOption.value.value;

    updateGlobalState("_displayPreferences", { lang: locale.value });
    createOptionsFromAvailableLanguages(availableLocales);
    setSelectedLanguageOption();
  }
});

const setLanguage = (option: DropdownOption | DropdownOption[]) => {
  const id = String(route.params["id"]);
  if (!id) return;

  const editState = useEditMode(id);
  if (config.features.supportsMultilingualMetadataEditing && editState.isEdit) {
    return openChangeLocaleConfirmationModal(option);
  }

  selectedLanguageOption.value = option as DropdownOption;
};

const openChangeLocaleConfirmationModal = (
  option: DropdownOption | DropdownOption[],
) => {
  initializeConfirmModal({
    confirmButton: {
      buttonCallback: () => {
        selectedLanguageOption.value = option as DropdownOption;
        closeModal(TypeModals.Confirm);
      },
    },
    declineButton: {
      buttonCallback: () => {
        selectedLanguageOption.value = {
          ...selectedLanguageOption.value,
        } as DropdownOption;
        closeModal(TypeModals.Confirm);
      },
    },
    translationKey: "discard-edit-change-locale",
    openImmediately: true,
  });
};
</script>
