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
} from "@/generated-types/queries";
import { reactive, ref, watch } from "vue";
import { apolloClient } from "@/main";
import EventBus from "../EventBus";

const ignorePermissions = ref<boolean>(false);
const setIgnorePermissions = (value: boolean) => {
  ignorePermissions.value = value;
};

const permissionsMappings = ref<Map<string, Map<Permission, boolean>>>(
  new Map<string, Map<Permission, boolean>>()
);
const setPermissionsMappings = () => {
  if (ignorePermissions.value) return;
  permissionsMappings.value.clear();
  const { numberOfEntities } = usePermissions();
  Object.values(Entitytyping).forEach((entity, index) => {
    const permissions = new Map<Permission, boolean>();
    try {
      apolloClient
        .query<GetPermissionMappingPerEntityTypeQuery>({
          query: GetPermissionMappingPerEntityTypeDocument,
          variables: reactive<GetPermissionMappingPerEntityTypeQueryVariables>({
            type: entity,
          }),
        })
        .then((result) => {
          permissions.set(
            Permission.Canread,
            result.data?.PermissionMappingPerEntityType
          );
          permissionsMappings.value.set(entity, permissions);
          if (numberOfEntities - 1 <= index) {
            EventBus.emit("permissions_updated", permissionsMappings.value);
          }
        });
    } catch (e) {
      console.log(
        `Error in usePermissions set function for post entities/filter: ${e}`
      );
    }
  });
  try {
    apolloClient
      .query<GetPermissionMappingCreateQuery>({
        query: GetPermissionMappingCreateDocument,
      })
      .then((result) => {
        const permissions = new Map<Permission, boolean>();
        permissions.set(
          Permission.Cancreate,
          result.data?.PermissionMappingCreate
        );
        permissionsMappings.value.set("all_entities", permissions);
        EventBus.emit("permissions_updated", permissionsMappings.value);
      });
  } catch (e) {
    console.log(
      `Error in usePermissions set function for create entities: ${e}`
    );
  }
};

const usePermissions = () => {
  const numberOfEntities = Object.keys(Entitytyping).length;
  const can = (permission: Permission, entity: Entitytyping | undefined) => {
    if (ignorePermissions.value) return true;
    try {
      if (permissionsMappings.value.size < 1)
        throw Error("The mappings are not fetched yet. Wait a bit.");
      if (permission === Permission.Canread && entity != undefined) {
        const entityMapping = permissionsMappings.value!.get(entity);
        return entityMapping?.get(permission);
      }
      if (permission === Permission.Cancreate)
        return permissionsMappings.value!.get("all_entities")!.get(permission);
      throw Error("There is something wrong with how this function is used");
    } catch (e) {
      // console.log(e);
    }
  };

  const fetchUpdateAndDeletePermission = (id: string) => {
    const permissions = new Map<Permission, boolean>();
    try {
      return apolloClient
        .query<GetPermissionMappingEntityDetailQuery>({
          query: GetPermissionMappingEntityDetailDocument,
          variables: reactive<GetPermissionMappingEntityDetailQueryVariables>({
            id: id,
          }),
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
    EventBus.emit("permissions_updated", permissionsMappings.value);
  };

  return {
    can,
    fetchUpdateAndDeletePermission,
    numberOfEntities,
  };
};

export { usePermissions, setPermissionsMappings, setIgnorePermissions };
