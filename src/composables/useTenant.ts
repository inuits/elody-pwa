import type { ApolloClient } from "@apollo/client/core";
import {
  DamsIcons,
  GetTenantsDocument,
  type DropdownOption,
  type GetTenantsQuery,
} from "@/generated-types/queries";
import { ref, computed } from "vue";
import {
  setPermissionsMappings,
  resetAdvancedPermissions,
} from "@/composables/usePermissions";
import { useRoute, useRouter } from "vue-router";

const TENANTS_ENDPOINT = "/api/tenants";

type tenant = { id: string; label: string; code: string };
const tenants = ref<tenant[] | "no-tenants">("no-tenants");
const selectedTenant = ref<string | undefined>(undefined);
const selectedTenantName = ref<string | undefined>(undefined);
const isAllTenantsLoaded = ref<boolean>(false);

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
  const route = useRoute();

  const initTenants = async () => {
    if (hasTenantSelect) {
      await apolloClient.cache.reset();
      await getTenants();
      if (route.params?.tenant) {
        const tenantInUrl = getIdFromCode(route.params?.tenant as string) || "";
        if (tenantInUrl) await setTennantInSession(tenantInUrl);
      }
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
      resetAdvancedPermissions();
      tenantsLoaded.value = "loaded";
    } else {
      await setPermissionsMappings();
      resetAdvancedPermissions();
      tenantsLoaded.value = "no-switcher";
    }
  };

  const getTenants = async () => {
    if (config && config?.features.hasTenantSelect) {
      try {
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
                  const code = entity.intialValues.code as string;
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
                      code,
                    });
                }
              });
            isAllTenantsLoaded.value = true;
          });
      } catch {
        await apolloClient.cache.reset();
      }
    } else {
      console.info("Tenants not fetched because no tenant selected.");
    }
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
    selectedTenantName.value = label;
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

    selectedTenantValue && (await setTennantInSession(selectedTenantValue));
    router.push({ name: "Home", force: true });
    tenantsLoaded.value = "switching";
  };

  const getLabelById = (idToFind: string) => {
    if (tenants.value !== "no-tenants") {
      const tenantResult = tenants.value.find(({ id }) => id === idToFind);
      return tenantResult && tenantResult.label;
    }
  };

  const getCodeById = (idToFind: string) => {
    if (tenants.value !== "no-tenants") {
      const tenantResult = tenants.value.find(({ id }) => id === idToFind);
      return tenantResult && tenantResult.code;
    }
  };

  const getIdFromCode = (codeToFind: string) => {
    if (tenants.value !== "no-tenants") {
      const tenantResult = tenants.value.find(
        ({ code }) => code === codeToFind
      );
      return tenantResult && tenantResult.id;
    }
  };

  return {
    getLabelById,
    getCodeById,
    getIdFromCode,
    getTenants,
    initTenants,
    selectedTenant,
    selectedTenantName,
    selectTenant,
    setTennantInSession,
    tenants,
    tenantsAsDropdownOptions,
    tenantsLoaded,
    isAllTenantsLoaded,
  };
};

export default useTenant;
