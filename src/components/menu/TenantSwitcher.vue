<template>
  <div>
    <BaseDropdownNew
      v-model="selectedTenant"
      :options="tenantsAsDropdownOptions"
      label="Tenant"
      dropdown-style="defaultWithBorder"
    />
  </div>
</template>

<script lang="ts" setup>
import { inject } from "vue";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import useTenant from "@/composables/useTenant";
import { DefaultApolloClient } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";

const apolloClient = inject(DefaultApolloClient);

const { tenantsAsDropdownOptions, selectedTenant } = useTenant(
  apolloClient as ApolloClient<any>
);
</script>
