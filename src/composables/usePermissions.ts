import {
  GetPermissionMappingPerEntityTypeDocument,
  GetPermissionMappingCreateDocument,
  GetPermissionMappingEntityDetailDocument,
  type GetPermissionMappingPerEntityTypeQuery,
  type GetPermissionMappingPerEntityTypeQueryVariables,
  type GetPermissionMappingCreateQuery,
  type GetPermissionMappingEntityDetailQuery,
  type GetPermissionMappingEntityDetailQueryVariables,
  Permission,
  Entitytyping,
  type GetPermissionMappingCreateQueryVariables,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { reactive, ref } from "vue";

const ignorePermissions = ref<boolean>(false);
const setIgnorePermissions = (value: boolean) => {
  ignorePermissions.value = value;
};
const permittedEntitiesToCreate = ref<Entitytyping[]>([]);

const permissionsMappings = ref<Map<string, Map<Permission, boolean>>>(
  new Map<string, Map<Permission, boolean>>()
);

const setPermissionsMappings = async () => {
  if (ignorePermissions.value) return;
  const promises: Promise<void>[] = [];

  for (const entity of Object.values(Entitytyping)) {
    const permissions = new Map<Permission, boolean>();

    const mappingPerEntityTypePromise = apolloClient
      .query<GetPermissionMappingPerEntityTypeQuery>({
        query: GetPermissionMappingPerEntityTypeDocument,
        variables: reactive<GetPermissionMappingPerEntityTypeQueryVariables>({
          type: entity,
        }),
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        permissions.set(
          Permission.Canread,
          result.data?.PermissionMappingPerEntityType
        );
        permissionsMappings.value.set(entity, permissions);
      });

    const mappingCreatePromise = apolloClient
      .query<GetPermissionMappingCreateQuery>({
        query: GetPermissionMappingCreateDocument,
        variables: reactive<GetPermissionMappingCreateQueryVariables>({
          entityType: entity,
        }),
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        permissionsMappings.value
          .get(entity)
          ?.set(Permission.Cancreate, result.data?.PermissionMappingCreate);
      });

    promises.push(mappingPerEntityTypePromise);
    promises.push(mappingCreatePromise);
  }

  await Promise.all(promises);
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
  };
};

export {
  ignorePermissions,
  permittedEntitiesToCreate,
  setIgnorePermissions,
  setPermissionsMappings,
  usePermissions,
};
