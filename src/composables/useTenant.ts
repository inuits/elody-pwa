import type { ApolloClient } from "@apollo/client/core";
import {
  DamsIcons,
  GetTenantsDocument,
  type DropdownOption,
  type GetTenantsQuery,
} from "@/generated-types/queries";
import { ref, computed, watch } from "vue";
import { setPermissionsMappings } from "@/composables/usePermissions";
import { useRouter } from "vue-router";

const TENANTS_ENDPOINT = "/api/tenants";

type tenant = { id: string; label: string };
const tenants = ref<tenant[] | "no-tenants">("no-tenants");
const selectedTenant = ref<string | undefined>(undefined);

const useTenant = (
  apolloClient: ApolloClient<any>,
  config?: { features: { hasTenantSelect: boolean; hideSuperTenant: boolean } }
) => {
  const tenantsLoaded = ref<
    "not-loaded" | "no-switcher" | "loaded" | "switching"
  >("not-loaded");
  const hasTenantSelect: boolean =
    config && config.features.hasTenantSelect
      ? (config.features.hasTenantSelect as boolean)
      : false;
  const hideSuperTenant: boolean =
    (config && config.features.hideSuperTenant) || false;
  const router = useRouter();

  const initTenants = async () => {
    if (hasTenantSelect) {
      window.localStorage.clear();
      await getTenants();
      const tenantFromSession = await getTennantFromSession();
      if (
        tenants.value !== "no-tenants" &&
        tenantFromSession === "no-tenant-in-session"
      ) {
        try {
          await setTennant(tenants.value[0].label, tenants.value[0].id);
        } catch {
          console.warn("Failed to set tenant");
        }
      }

      if (tenantFromSession !== "no-tenant-in-session") {
        await setTennant(tenantFromSession.label, tenantFromSession.id);
      }

      await setPermissionsMappings();
      tenantsLoaded.value = "loaded";
    } else {
      await setPermissionsMappings();
      tenantsLoaded.value = "no-switcher";
    }
  };

  const getTenants = async () => {
    await apolloClient
      .query<GetTenantsQuery>({
        query: GetTenantsDocument,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        tenants.value = [];
        const entities = result.data.Tenants;
        entities &&
          entities.results &&
          entities.results.forEach((entity) => {
            if (entity && entity.__typename === "Tenant") {
              const id = entity.uuid as string;
              const label = entity.intialValues.label as string;
              if (tenants.value === "no-tenants") {
                tenants.value = [];
              }

              if (
                !hideSuperTenant ||
                (hideSuperTenant && id !== "tenant:super")
              )
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
    return fetch(TENANTS_ENDPOINT).then(async (res) => {
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
    await setTennantInSession(id);
    selectedTenant.value = id;
  };

  const setTennantInSession = async (tenantId: string) => {
    await fetch(TENANTS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tenant: tenantId }),
    });
  };

  const selectTenant = async (selectedTenantValue: string) => {
    selectedTenant.value = selectedTenantValue;
    if (selectedTenantValue !== (await getTennantFromSession()).id)
      router.push({ name: "Home" });

    selectedTenantValue && await setTennantInSession(selectedTenantValue);
    tenantsLoaded.value = "switching";
  };

  watch(tenantsLoaded, async (value) => {
    if (value === "switching") {
      window.localStorage.clear();
      await apolloClient.cache.reset();
      await setPermissionsMappings();
      tenantsLoaded.value = "loaded";
      router.push({ name: "Home", force: true });
    }
  });

  const getLabelById = (idToFind: string) => {
    if (tenants.value !== "no-tenants") {
      const tenantResult = tenants.value.find(({ id }) => id === idToFind);
      return tenantResult && tenantResult.label;
    }
  };

  return {
    getLabelById,
    getTenants,
    initTenants,
    selectedTenant,
    selectTenant,
    tenants,
    tenantsAsDropdownOptions,
    tenantsLoaded,
  };
};

export default useTenant;
