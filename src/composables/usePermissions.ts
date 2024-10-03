import {
  GetPermissionMappingDocument,
  GetPermissionMappingEntityDetailDocument,
  GetAdvancedPermissionDocument,
  type GetPermissionMappingEntityDetailQuery,
  type GetPermissionMappingEntityDetailQueryVariables,
  Permission,
  Entitytyping,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { reactive, ref } from "vue";

const ignorePermissions = ref<boolean>(false);
const setIgnorePermissions = (value: boolean) => {
  ignorePermissions.value = value;
};
const permittedEntitiesToCreate = ref<Entitytyping[]>([]);
const advancedPermissions: { [key: string]: boolean } = {};

const permissionsMappings = ref<Map<string, Map<Permission, boolean>>>(
  new Map<string, Map<Permission, boolean>>()
);

const setPermissionsMappings = async () => {
  return await apolloClient
    .query({
      query: GetPermissionMappingDocument,
      variables: {
        entities: Object.values(Entitytyping),
      },
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    })
    .then((result) => {
      permissionsMappings.value = normalizePermissions(
        result.data.PermissionMapping
      );
    });
};

const normalizePermissions = (response: {
  [key: string]: { [key: string]: boolean };
}): Map<string, Map<Permission, boolean>> => {
  const normalizedData: { [key: string]: Map<Permission, boolean> } = {};
  for (const property in response) {
    normalizedData[property] = new Map(
      Object.entries(response[property])
    ) as Map<Permission, boolean>;
  }

  return new Map(Object.entries(normalizedData));
};

const usePermissions = () => {
  const numberOfEntities = Object.keys(Entitytyping).length;

  const can = (permission: Permission, entity: Entitytyping | undefined) => {
    if (ignorePermissions.value) return true;
    try {
      if (permissionsMappings.value.size < 1)
        throw Error("The mappings are not fetched yet. Wait a bit.");
      if (
        (permission === Permission.Canread ||
          permission === Permission.Cancreate) &&
        entity != undefined
      ) {
        const entityMapping = permissionsMappings.value!.get(entity);
        return entityMapping?.get(permission);
      }
      throw Error("There is something wrong with how this function is used");
    } catch (e) {
      // console.log(e);
    }
  };

  const fetchAdvancedPermission = (permission: string) => {
    if (permission in advancedPermissions) {
      return advancedPermissions[permission];
    }

    try {
      return apolloClient
        .query({
          query: GetAdvancedPermissionDocument,
          variables: { permission },
          fetchPolicy: "no-cache",
          notifyOnNetworkStatusChange: true,
        })
        .then((result) => {
          const isPermitted = result.data.AdvancedPermission;
          advancedPermissions[permission] = isPermitted;
          return isPermitted;
        });
    } catch (e) {
      console.log(
        `Error in usePermissions fetch advanced permissions function: ${e}`
      );
    }
  };

  const fetchUpdateAndDeletePermission = (id: string, entityType: string) => {
    const permissions = new Map<Permission, boolean>();
    try {
      return apolloClient
        .query<GetPermissionMappingEntityDetailQuery>({
          query: GetPermissionMappingEntityDetailDocument,
          variables: reactive<GetPermissionMappingEntityDetailQueryVariables>({
            id: id,
            entityType: entityType,
          }),
          fetchPolicy: "no-cache",
          notifyOnNetworkStatusChange: true,
        })
        .then((result) => {
          for (
            let i = 0;
            i < result.data?.PermissionMappingEntityDetail.length;
            i++
          )
            permissions.set(
              result.data?.PermissionMappingEntityDetail[i].permission,
              result.data?.PermissionMappingEntityDetail[i].hasPermission
            );
          return permissions;
        });
    } catch (e) {
      console.log(
        `Error in usePermissions fetch function for update & delete entities/id: ${e}`
      );
    }
  };

  return {
    can,
    fetchUpdateAndDeletePermission,
    numberOfEntities,
    fetchAdvancedPermission,
  };
};

export {
  ignorePermissions,
  permittedEntitiesToCreate,
  setIgnorePermissions,
  setPermissionsMappings,
  usePermissions,
};
