<template>
  <div class="float-right">
    <BaseDropdownNew v-if="languageOptions" v-model="selectedLanguageOption" :options="languageOptions"
      dropdown-style="default" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import { DamsIcons, DropdownOption } from "@/generated-types/queries";
import { updateLocalStorage } from "@/helpers";

const { availableLocales, locale, t } = useI18n();
const selectedLanguageOption = ref<DropdownOption | undefined>();

const languageOptions: DropdownOption[] = availableLocales.map((language) => ({
  icon: DamsIcons.NoIcon,
  label: t("language." + language),
  value: language,
}));

const displayPreferences = localStorage.getItem("_displayPreferences");
if (displayPreferences) {
  if (JSON.parse(displayPreferences).lang) {
    locale.value = JSON.parse(displayPreferences).lang;
  }
}

onMounted(() => {
  selectedLanguageOption.value = languageOptions.find(
    (language) => language.value === locale.value
  );
});

watch(selectedLanguageOption, () => {
  locale.value = selectedLanguageOption.value.value;
  updateLocalStorage("_displayPreferences", { lang: locale.value });
});
</script>
