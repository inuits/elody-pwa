<template>
  <div class="min-height-custom block">
    <div>
      <BaseDropdownNew
        v-model="computedValue"
        :options="tenantsAsDropdownOptions"
        :label="t('navigation.tenant')"
        :disable="isEdit"
        label-position="inline"
        dropdown-style="neutralLight"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ApolloClient } from "@apollo/client/core";
import type { DropdownOption } from "@/generated-types/queries";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import useEditMode from "@/composables/useEdit";
import useTenant from "@/composables/useTenant";
import { DamsIcons } from "@/generated-types/queries";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { inject, computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const apolloClient = inject(DefaultApolloClient);
const config = inject<{
  features: { hasTenantSelect: boolean; hideSuperTenant: boolean };
}>("config");

const { t } = useI18n();
const { isEdit } = useEditMode();
const { tenantsAsDropdownOptions, selectTenant, selectedTenant, getLabelById } = useTenant(
  apolloClient as ApolloClient<any>,
  config
);

const tenant = ref<string | undefined>(selectedTenant.value);

const computedValue = computed<DropdownOption>({
  get() {
    return tenant.value
      ? {
          value: tenant.value,
          label: getLabelById(tenant.value),
          icon: DamsIcons.NoIcon,
        }
      : undefined;
  },
  set(value) {
    tenant.value = value.value;
  },
});

watch(
  () => tenant.value,
  async () => {
    if (tenant.value)
      await selectTenant(tenant.value);
  }
)
</script>

<style scoped>
.min-height-custom {
  min-height: 2rem;
}
</style>
