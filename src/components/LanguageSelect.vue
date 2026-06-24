<template>
  <div data-cy="language-select" :key="locale" class="float-right">
    <AdvancedDropdown
      v-model:model-value="selectedLanguageOption"
      @update:model-value="setLanguage"
      :options="languageOptions"
      :label="t('library.language')"
      :clearable="false"
      label-position="inline"
      style-type="defaultWithLightBorder"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, inject, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import {
  DamsIcons,
  type DropdownOption,
} from "@/generated-types/queries";
import { useStateManagement } from "@/composables/useStateManagement";
import { useEditMode } from "@/composables/useEdit";
import { useConfirmModal } from "@/composables/useConfirmModal";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import { setLocale } from "@vee-validate/i18n";

const { availableLocales, locale, t } = useI18n();
const { updateGlobalState, getGlobalState } = useStateManagement();
const { confirm } = useConfirmModal();
const selectedLanguageOption = ref<string | undefined>();
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
  )?.value;
  setLanguageDirection(locale.value);
  setLocale(locale.value);
};

const setLanguageDirection = (languageKey: string): void => {
  const rtlLanguages = ["ar"];

  if (rtlLanguages.includes(languageKey)) {
    document.dir = "rtl";
    return;
  }
  document.dir = "ltr";
};

onBeforeMount(() => {
  setSelectedLanguageOption();
});

watch(selectedLanguageOption, () => {
  if (selectedLanguageOption.value) {
    locale.value = selectedLanguageOption.value;

    updateGlobalState("_displayPreferences", { lang: locale.value });
    createOptionsFromAvailableLanguages(availableLocales);
    setSelectedLanguageOption();
  }
});

const setLanguage = (option: string) => {
  const id = String(route.params["id"]);
  if (!id) return;

  const editState = useEditMode(id);
  if (config.features.supportsMultilingualMetadataEditing && editState.isEdit) {
    return openChangeLocaleConfirmationModal(option);
  }

  selectedLanguageOption.value = option;
};

const openChangeLocaleConfirmationModal = async (
  option: DropdownOption | DropdownOption[],
) => {
  const choice = await confirm({
    title: t("confirm.discard-edit-change-locale.title"),
    message: t("confirm.discard-edit-change-locale.message"),
    confirmLabel: t("confirm.discard-edit-change-locale.confirm"),
    cancelLabel: t("confirm.discard-edit-change-locale.cancel"),
  });
  if (choice !== "confirm") return;
  selectedLanguageOption.value = Array.isArray(option)
    ? option[0].value
    : option.value;
};
</script>
