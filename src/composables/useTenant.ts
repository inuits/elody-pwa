import type { ApolloClient } from "@apollo/client/core";
import {
  DamsIcons,
  GetTenantsDocument,
  type DropdownOption,
  type GetTenantsQuery,
} from "@/generated-types/queries";
import { isObject } from "chart.js/helpers";
import { ref, computed, watch, onMounted } from "vue";

type tenant = { id: string; label: string };
const tenants = ref<tenant[] | "no-tenants">("no-tenants");
const selectedTenant = ref<string | undefined>(undefined);

const useTenant = (
  apolloClient: ApolloClient<any>,
  config?: { features: { hasTenantSelect: boolean } }
) => {
  const tenantsLoaded = ref<
    "not-loaded" | "no-switcher" | "loaded" | "switching"
  >("not-loaded");
  const hasTenantSelect: boolean =
    config && config.features.hasTenantSelect
      ? (config.features.hasTenantSelect as boolean)
      : false;
  const initTenants = async () => {
    await getTenants();
    const tenantFromSession = await getTennantFromSession();
    console.log(tenants.value);
    if (
      tenants.value !== "no-tenants" &&
      tenantFromSession === "no-tenant-in-session"
    ) {
      await setTennant(tenants.value[0].label, tenants.value[0].id);
    }

    if (tenantFromSession !== "no-tenant-in-session") {
      await setTennant(tenantFromSession.label, tenantFromSession.id);
    }

    tenantsLoaded.value = "loaded";
  };

  onMounted(() => {
    if (tenants.value === "no-tenants") {
      if (hasTenantSelect) {
        initTenants();
      } else {
        tenantsLoaded.value = "no-switcher";
      }
    }
  });

  const getTenants = async () => {
    return apolloClient
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
              const label = entity.intialValues.label as string;
              if (tenants.value === "no-tenants") {
                tenants.value = [];
              }

              tenants.value.push({
                id,
                label,
              });
            }
          });
      });
  };

  const tenantsAsDropdownOptions = computed<DropdownOption[]>(() => {
    const options: DropdownOption[] = [];
    tenants.value !== "no-tenants" &&
      tenants.value.forEach((tenant) => {
        options.push({
          value: tenant.id,
          label: tenant.label,
          icon: DamsIcons.NoIcon,
        });
      });

    return options;
  });

  const getTennantFromSession = async (): Promise<
    tenant | "no-tenant-in-session"
  > => {
    return fetch("/api/tenant").then(async (res) => {
      const result = await res.json();
      const filterResult =
        Array.isArray(tenants.value) &&
        tenants.value.filter((value) => {
          return value.id === result;
        });

      if (filterResult && filterResult.length === 1) {
        return { id: filterResult[0].id, label: filterResult[0].label };
      } else {
        return "no-tenant-in-session";
      }
    });
  };

  const setTennant = async (label: string, id: string) => {
    setTennantInSession(id);
    selectedTenant.value = id;
  };

  const setTennantInSession = async (tenantId: string) => {
    fetch("/api/tenant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tenant: tenantId }),
    });
  };

  watch(selectedTenant, (selectedTenantValue) => {
    selectedTenantValue &&
      isObject(selectedTenantValue) &&
      setTennantInSession(selectedTenantValue);
    tenantsLoaded.value = "switching";
  });

  watch(tenantsLoaded, async (value) => {
    if (value === "switching") {
      await apolloClient.cache.reset();
      tenantsLoaded.value = "loaded";
    }
  });

  const getLabelById = (idToFind: string) => {
    if (tenants.value !== "no-tenants") {
      const tenantResult = tenants.value.find(({ id }) => id === idToFind);
      return tenantResult && tenantResult.label;
    }
  };

  return {
    tenants,
    tenantsAsDropdownOptions,
    tenantsLoaded,
    selectedTenant,
    getLabelById,
  };
};

export default useTenant;
