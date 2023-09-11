<template>
  <div v-show="tenantsLoaded === 'loaded'">
    <BaseDropdownNew
      v-model="computedValue"
      :options="tenantsAsDropdownOptions"
      label="Tenant"
      dropdown-style="defaultWithBorder"
    />
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

const apolloClient = inject(DefaultApolloClient);
const config = inject<{ features: { hasTenantSelect: boolean } }>("config");

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
