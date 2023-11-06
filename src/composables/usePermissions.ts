import {
  GetUserPermissionsDocument,
  GetPermissionMappingPerEntityDocument,
  GetPermissionMappingEntitiesDocument,
  type GetPermissionMappingPerEntityQuery,
  type GetPermissionMappingPerEntityQueryVariables,
  type GetPermissionMappingEntitiesQuery,
  Permission,
  Entitytyping,
} from "@/generated-types/queries";
import { useQuery } from "@vue/apollo-composable";
import { reactive, ref } from "vue";
import { apolloClient } from "@/main";

const ignorePermissions = ref<boolean>(false);
const setIgnorePermissions = (value: boolean) => {
  ignorePermissions.value = value;
};

const permissionsMappings = ref<Map<string, Map<Permission, boolean>>>(
  new Map<string, Map<Permission, boolean>>()
);
const setPermissionsMappings = () => {
  if (ignorePermissions.value) return;
  permissionsMappings.value = new Map<string, Map<Permission, boolean>>();
  for (const entity in Entitytyping) {
    const permissions = new Map<Permission, boolean>();
    try {
      apolloClient
        .query<GetPermissionMappingPerEntityQuery>({
          query: GetPermissionMappingPerEntityDocument,
          variables: reactive<GetPermissionMappingPerEntityQueryVariables>({
            type: entity,
          }),
        })
        .then((result) => {
          permissions.set(
            Permission.Canget,
            result.data?.PermissionMappingPerEntity
          );
        });
      permissionsMappings.value.set(entity, permissions);
    } catch (e) {
      console.log(
        `Error in usePermissions set function for post entities/filter: ${e}`
      );
    }
  }
  try {
    apolloClient
      .query<GetPermissionMappingEntitiesQuery>({
        query: GetPermissionMappingEntitiesDocument,
      })
      .then((result) => {
        const permissions = new Map<Permission, boolean>();
        for (let i = 0; i < result.data?.PermissionMappingEntities.length; i++)
          permissions.set(
            result.data?.PermissionMappingEntities[i].permission,
            result.data?.PermissionMappingEntities[i].hasPermission
          );
        permissionsMappings.value.set("all_entities", permissions);
      });
  } catch (e) {
    console.log(
      `Error in usePermissions set function for put, patch & delete entities/id: ${e}`
    );
  }
};

const usePermissions = () => {
  const { result, loading } = useQuery(GetUserPermissionsDocument);
  const determinePermission = (perm: string) => {
    if (ignorePermissions.value) {
      return true;
    }
    if (result.value?.UserPermissions?.payload) {
      return ["read-saved-search"].includes(perm);
    }
    return false;
  };

  const can = (permission: Permission, entity: Entitytyping | undefined) => {
    if (ignorePermissions.value) return true;
    try {
      if (entity === undefined && permission === Permission.Canget)
        throw Error("For the canGet permission you have to specify an entity");
      if (entity === undefined)
        return permissionsMappings.value!.get("all_entities")!.get(permission);
      if (permission !== Permission.Canget) entity = "all_entities";
      return permissionsMappings.value!.get(entity)?.get(permission);
    } catch (e) {
      console.log(e);
    }
  };

  return {
    determinePermission,
    loading,
    setIgnorePermissions,
    can,
  };
};

export { usePermissions, setIgnorePermissions, setPermissionsMappings };
