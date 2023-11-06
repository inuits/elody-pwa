<template>
  <div :key="locale" class="float-right">
    <BaseDropdownNew
      v-if="languageOptions"
      v-model="selectedLanguageOption"
      :options="languageOptions"
      label-position="inline"
      dropdown-style="default"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import { DamsIcons, type DropdownOption } from "@/generated-types/queries";
import { updateLocalStorage } from "@/helpers";

const { availableLocales, locale, t } = useI18n();
const selectedLanguageOption = ref<DropdownOption | undefined>();

const createOptionsFromAvailableLanguages = (
  avilableLanguages: string[]
): DropdownOption[] => {
  return avilableLanguages.map((language) => ({
    icon: DamsIcons.NoIcon,
    label: t("language." + language),
    value: language,
  }));
};

const languageOptions = computed(() => {
  return createOptionsFromAvailableLanguages(availableLocales);
});

const displayPreferences = localStorage.getItem("_displayPreferences");
if (displayPreferences) {
  if (JSON.parse(displayPreferences).lang) {
    locale.value = JSON.parse(displayPreferences).lang;
  }
}

const setSelectedLanguageOption = (): void => {
  selectedLanguageOption.value = languageOptions.value.find(
    (language) => language.value === locale.value
  );
};

onMounted(() => {
  setSelectedLanguageOption();
});

watch(selectedLanguageOption, () => {
  if (selectedLanguageOption.value) {
    locale.value = selectedLanguageOption.value.value;
    updateLocalStorage("_displayPreferences", { lang: locale.value });
    createOptionsFromAvailableLanguages(availableLocales);
    setSelectedLanguageOption();
  }
});
</script>
