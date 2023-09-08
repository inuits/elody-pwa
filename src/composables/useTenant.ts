import { ref, computed, watch } from "vue";
import type { ApolloClient } from "@apollo/client/core";
import {
  GetEntitiesDocument,
  SearchInputType,
  DamsIcons,
  type DropdownOption,
  type GetEntitiesQuery,
} from "@/generated-types/queries";
import { isObject } from "chart.js/helpers";

const TENANT_ENTITY_TYPE = "tenant";
const tenants = ref<Array<{ name: string; id: string }> | "no-tenants">(
  "no-tenants"
);
const selectedTenant = ref<DropdownOption | string | undefined>(undefined);

const useTenant = (apolloClient: ApolloClient<any>) => {
  const tenantsLoaded = ref<boolean>(false);
  const getTenants = () => {
    apolloClient
      .query<GetEntitiesQuery>({
        query: GetEntitiesDocument,
        variables: {
          limit: 9999,
          skip: 1,
          searchValue: {
            value: "",
            isAsc: false,
            key: "title",
            order_by: "",
          },
          advancedSearchValue: [],
          advancedFilterInputs: [
            {
              type: "type",
              key: "type",
              value: TENANT_ENTITY_TYPE,
              match_exact: true,
            },
          ],
          searchInputType: SearchInputType.AdvancedInputType,
        },
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        const entities = result.data.Entities;
        entities &&
          entities.results &&
          entities.results.forEach((entity) => {
            if (entity && entity.__typename === "Tenant") {
              const name = entity.intialValues.name as string;
              const id = entity.intialValues.id as string;
              if (tenants.value === "no-tenants") {
                tenants.value = [];
              }

              tenants.value.push({
                name,
                id,
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
          // 'Content-Type': 'application/x-www-form-urlencoded',
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
