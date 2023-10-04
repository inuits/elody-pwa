<template>
  <div class="min-height-custom block">
    <div v-show="computedIsVisible">
      <BaseDropdownNew
        v-show="tenantsLoaded === 'loaded'"
        v-model="computedValue"
        :options="tenantsAsDropdownOptions"
        :label="t('navigation.tenant')"
        dropdown-style="defaultWithBorder"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, computed } from "vue";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import useTenant from "@/composables/useTenant";
import { DefaultApolloClient } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";
import type { DropdownOption } from "@/generated-types/queries";
import { DamsIcons } from "@/generated-types/queries";
import { useI18n } from "vue-i18n";

const apolloClient = inject(DefaultApolloClient);
const config = inject<{ features: { hasTenantSelect: boolean } }>("config");
const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    isVisible: boolean;
  }>(),
  { isVisible: false }
);

const computedIsVisible = computed(
  () => config?.features.hasTenantSelect === true && props.isVisible
);
const {
  tenantsAsDropdownOptions,
  selectedTenant,
  tenantsLoaded,
  getLabelById,
} = useTenant(apolloClient as ApolloClient<any>, config);

const computedValue = computed<DropdownOption>({
  get() {
    return selectedTenant.value
      ? {
          value: selectedTenant.value,
          label: getLabelById(selectedTenant.value),
          icon: DamsIcons.NoIcon,
        }
      : undefined;
  },
  set(value) {
    selectedTenant.value = value.value;
  },
});
</script>
<style scoped>
.min-height-custom {
  min-height: 2rem;
}
</style>
