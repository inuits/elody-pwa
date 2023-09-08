import type { ApolloClient } from "@apollo/client/core";
import {
  DamsIcons,
  GetTenantsDocument,
  type DropdownOption,
  type GetTenantsQuery,
} from "@/generated-types/queries";
import { isObject } from "chart.js/helpers";
import { ref, computed, watch } from "vue";

const tenants = ref<Array<{ id: string; name: string; }> | "no-tenants">(
  "no-tenants"
);
const selectedTenant = ref<DropdownOption | string | undefined>(undefined);

const useTenant = (apolloClient: ApolloClient<any>) => {
  const tenantsLoaded = ref<boolean>(false);
  const getTenants = () => {
    apolloClient
      .query<GetTenantsQuery>({
        query: GetTenantsDocument,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        const entities = result.data.Tenants;
        entities &&
          entities.results &&
          entities.results.forEach((entity) => {
            if (entity && entity.__typename === "Tenant") {
              const id = entity.intialValues.id as string;
              const name = entity.intialValues.name as string;
              if (tenants.value === "no-tenants") {
                tenants.value = [];
              }

              tenants.value.push({
                id,
                name,
              });
            }
          });

        fetch("/api/tenant").then(async (res) => {
          const result = await res.json();
          const filterResult =
            Array.isArray(tenants.value) &&
            tenants.value.filter((value) => {
              return value.id === result;
            });

          if (filterResult && filterResult.length === 1) {
            selectedTenant.value = {
              label: filterResult[0].name,
              value: filterResult[0].id,
              icon: DamsIcons.NoIcon,
            };
          }
        });

        tenantsLoaded.value = true;
      });
  };

  if (tenants.value === "no-tenants") {
    getTenants();
  }

  const tenantsAsDropdownOptions = computed<DropdownOption[]>(() => {
    const options: DropdownOption[] = [];
    tenants.value !== "no-tenants" &&
      tenants.value.forEach((tenant) => {
        options.push({
          value: tenant.id,
          label: tenant.name,
          icon: DamsIcons.NoIcon,
        });
      });

    return options;
  });

  watch(selectedTenant, (selectedTenantValue) => {
    selectedTenantValue &&
      isObject(selectedTenantValue) &&
      fetch("/api/tenant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenant: selectedTenantValue.value }),
      });
  });

  return {
    tenants,
    tenantsAsDropdownOptions,
    tenantsLoaded,
    selectedTenant,
  };
};

export default useTenant;
