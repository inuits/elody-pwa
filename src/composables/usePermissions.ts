import {
  GetPermissionMappingDocument,
  GetPermissionMappingEntityDetailDocument,
  GetAdvancedPermissionDocument,
  type GetPermissionMappingEntityDetailQuery,
  type GetPermissionMappingEntityDetailQueryVariables,
  Permission,
  Entitytyping,
  type DropdownOption,
  type ContextMenuActions,
  type ContextMenuElodyAction,
  type ContextMenuGeneralAction,
  type ContextMenuLinkAction,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { reactive, ref } from "vue";

const ignorePermissions = ref<boolean>(false);
const setIgnorePermissions = (value: boolean) => {
  ignorePermissions.value = value;
};
const permittedEntitiesToCreate = ref<Entitytyping[]>([]);
let advancedPermissions: { [key: string]: boolean } = {};

const permissionsMappings = ref<Map<string, Map<Permission, boolean>>>(
  new Map<string, Map<Permission, boolean>>(),
);

type ContextMenuActionType =
  | ContextMenuElodyAction
  | ContextMenuGeneralAction
  | ContextMenuLinkAction;

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
        result.data.PermissionMapping,
      );
    });
};

const resetAdvancedPermissions = () => {
  advancedPermissions = {};
};

const normalizePermissions = (response: {
  [key: string]: { [key: string]: boolean };
}): Map<string, Map<Permission, boolean>> => {
  const normalizedData: { [key: string]: Map<Permission, boolean> } = {};
  for (const property in response) {
    normalizedData[property] = new Map(
      Object.entries(response[property]),
    ) as Map<Permission, boolean>;
  }

  return new Map(Object.entries(normalizedData));
};

const usePermissions = () => {
  const numberOfEntities = Object.keys(Entitytyping).length;
  let parentEntityId: string | undefined = undefined;
  let childEntityId: string | undefined = undefined;

  const can = (
    permission: Permission.Canread | Permission.Cancreate,
    entity: Entitytyping | undefined,
  ) => {
    if (ignorePermissions.value) return true;
    try {
      if (permissionsMappings.value.size < 1)
        throw Error("The mappings are not fetched yet. Wait a bit.");
      if (entity != undefined) {
        const entityMapping = permissionsMappings.value!.get(entity);
        return entityMapping?.get(permission);
      }
      throw Error("There is something wrong with how this function is used");
    } catch (e) {
      console.log(e);
    }
  };

  const fetchAdvancedPermission = (
    permissions: string[],
    forceFetch: boolean = false,
  ) => {
    const permission = permissions[0];
    if (!forceFetch && permission in advancedPermissions) {
      return advancedPermissions[permission];
    }

    const variables: { [key: string]: string } = {
      permission,
      ...(parentEntityId && { parentEntityId }),
      ...(childEntityId && { childEntityId }),
    };

    try {
      return apolloClient
        .query({
          query: GetAdvancedPermissionDocument,
          variables,
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
        `Error in usePermissions fetch advanced permissions function: ${e}`,
      );
    }
  };

  const setExtraVariables = (variables?: {
    parentEntityId?: string;
    childEntityId: string;
  }) => {
    parentEntityId = variables?.parentEntityId;
    childEntityId = variables?.childEntityId;
  };

  const fetchPermissionsForDropdownOptions = async (
    options: DropdownOption[],
  ) => {
    const listOfPermissions = options
      .filter((option: DropdownOption) => option.can && option.can.length > 0)
      .map((option: DropdownOption) => option.can as string[]);

    const promises = listOfPermissions.map((item: string[]) => {
      return fetchAdvancedPermission(item);
    });

    await Promise.all(promises);
  };

  const fetchPermissionsOfContextMenu = async (actions: ContextMenuActions) => {
    const actionValues = Object.values(actions) as ContextMenuActionType[];

    const promises = actionValues
      .filter((item: ContextMenuActionType) => {
        return item.can && item.can.length > 0;
      })
      .map((item) => {
        return fetchAdvancedPermission(item.can as string[], true);
      });

    await Promise.all(promises);
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
              result.data?.PermissionMappingEntityDetail[i].hasPermission,
            );
          return permissions;
        });
    } catch (e) {
      console.log(
        `Error in usePermissions fetch function for update & delete entities/id: ${e}`,
      );
    }
  };

  return {
    can,
    fetchUpdateAndDeletePermission,
    numberOfEntities,
    fetchAdvancedPermission,
    fetchPermissionsForDropdownOptions,
    fetchPermissionsOfContextMenu,
    setExtraVariables,
  };
};

export {
  ignorePermissions,
  permittedEntitiesToCreate,
  setIgnorePermissions,
  setPermissionsMappings,
  usePermissions,
  resetAdvancedPermissions,
  advancedPermissions,
};
