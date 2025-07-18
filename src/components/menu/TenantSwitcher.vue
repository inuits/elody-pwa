<template>
  <div data-cy="tenant-switcher" class="min-height-custom block">
    <div>
      <AdvancedDropdown
        v-model="computedValue"
        :options="tenantsAsDropdownOptions"
        :label="t('navigation.tenant')"
        :clearable="false"
        :disable="isEdit"
        label-position="inline"
        style-type="defaultWithLightBorder"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ApolloClient } from "@apollo/client/core";
import { useEditMode } from "@/composables/useEdit";
import useTenant from "@/composables/useTenant";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { inject, computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";

const apolloClient = inject(DefaultApolloClient);
const config = inject<{
  features: { hasTenantSelect: boolean; hideSuperTenant: boolean };
}>("config");

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { isEdit } = useEditMode();
const {
  getCodeById,
  getIdFromCode,
  getLabelById,
  isAllTenantsLoaded,
  selectedTenant,
  selectTenant,
  tenantsAsDropdownOptions,
} = useTenant(apolloClient as ApolloClient<any>, config);

const tenant = ref<string | undefined>();

const computedValue = computed<string | undefined>({
  get() {
    return tenant.value;
  },
  set(value) {
    tenant.value = value;
  },
});

watch(
  () => tenant.value,
  async (newTenant?: string, oldTenant?: string) => {
    if (!oldTenant && newTenant) return;
    if (newTenant) await selectTenant(newTenant);
  },
);

const normalizeTenantMetadataToId = (tenant: string): string => {
  return getIdFromCode(tenant) || tenant;
};

const normalizeTenantIdToMetadata = (tenant: string): string => {
  return getCodeById(tenant) || tenant;
};

watch(
  () => isAllTenantsLoaded.value,
  (loaded: boolean) => {
    if (!loaded) return;
    const tenantParam = route.params?.tenant as string;
    tenant.value =
      (tenantParam && normalizeTenantMetadataToId(tenantParam)) ||
      selectedTenant.value;
    router.replace({
      name: route.name as string,
      params: {
        ...route.params,
        tenant:
          tenantParam ||
          normalizeTenantIdToMetadata(selectedTenant.value || ""),
      },
      query: route.query,
    });
  },
  { immediate: true },
);
</script>

<style scoped>
.min-height-custom {
  min-height: 2rem;
}
</style>
