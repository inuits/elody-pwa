import type {
  GetPermissionMappingEntityDetailQuery,
  GetPermissionMappingEntityDetailQueryVariables,
  DropdownOption,
  ContextMenuActions,
  ContextMenuElodyAction,
  ContextMenuGeneralAction,
  ContextMenuLinkAction,
} from "@/generated-types/queries";
import {
  GetPermissionMappingEntityDetailDocument,
  GetAdvancedPermissionsDocument,
  GetAdvancedPermissionDocument,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { reactive, ref } from "vue";

interface PermissionResult {
  permission: string;
  hasPermission: boolean;
}

interface AdvancedPermissionsResponse {
  AdvancedPermissions: PermissionResult[];
}

interface MenuItem {
  can?: string[];
  subMenu?: {
    [key: string]: MenuItem;
  };
  [key: string]: any;
}

export interface PermissionCacheKeyOptions {
  permission: string;
  parentEntityId?: string;
  childEntityId?: string;
}

const ignorePermissions = ref<boolean>(false);
const setIgnorePermissions = (value: boolean) => {
  ignorePermissions.value = value;
};
let advancedPermissions: { [key: string]: boolean } = {};

type ContextMenuActionType =
  | ContextMenuElodyAction
  | ContextMenuGeneralAction
  | ContextMenuLinkAction;

const resetAdvancedPermissions = () => {
  advancedPermissions = {};
};

const usePermissions = () => {
  let parentEntityId: string | undefined = undefined;
  let childEntityId: string | undefined = undefined;

  const createPermissionCacheKey = (
    options: PermissionCacheKeyOptions,
  ): string => {
    let key = options.permission;
    if (options.parentEntityId) {
      key += `|parent:${options.parentEntityId}`;
    }
    if (options.childEntityId) {
      key += `|child:${options.childEntityId}`;
    }
    return key;
  };

  const fetchAdvancedPermission = (
    permissions: string[],
    forceFetch: boolean = false,
  ) => {
    const permission = permissions[0];
    const cacheKey = createPermissionCacheKey({
      permission,
      parentEntityId,
      childEntityId,
    });

    if (!forceFetch && cacheKey in advancedPermissions) {
      return advancedPermissions[cacheKey];
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
          advancedPermissions[cacheKey] = isPermitted;

          return isPermitted;
        });
    } catch (e) {
      console.log(
        `Error in usePermissions fetch advanced permissions function: ${e}`,
      );
    }
  };

  const fetchAdvancedPermissions = async (
    permissions: string[],
  ): Promise<Record<string, boolean>> => {
    const variables = {
      permissions,
      ...(parentEntityId && { parentEntityId }),
      ...(childEntityId && { childEntityId }),
    };

    try {
      const { data } = await apolloClient.query<AdvancedPermissionsResponse>({
        query: GetAdvancedPermissionsDocument,
        variables,
        fetchPolicy: "no-cache",
      });

      data.AdvancedPermissions.forEach(({ permission, hasPermission }) => {
        const cacheKey = createPermissionCacheKey({
          permission,
          parentEntityId,
          childEntityId,
        });
        advancedPermissions[cacheKey] = hasPermission;
      });

      return permissions.reduce<Record<string, boolean>>((acc, permission) => {
        const cacheKey = createPermissionCacheKey({
          permission,
          parentEntityId,
          childEntityId,
        });
        acc[permission] = advancedPermissions[cacheKey] ?? false;
        return acc;
      }, {});
    } catch (error) {
      console.error("Failed to fetch advanced permissions:", error);

      return permissions.reduce<Record<string, boolean>>((acc, permission) => {
        acc[permission] = false;
        return acc;
      }, {});
    }
  };

  const extractMenuPermissions = (menu: MenuItem): string[] => {
    const permissions: string[] = [];

    function traverse(item: MenuItem) {
      if (item.can && item.can.length > 0) {
        permissions.push(item.can[0]);
      }

      if (item.subMenu) {
        Object.values(item.subMenu).forEach((subItem) => {
          traverse(subItem);
        });
      }
    }

    Object.values(menu).forEach((item) => {
      if (typeof item === "object" && item !== null) {
        traverse(item);
      }
    });

    return permissions;
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
        return fetchAdvancedPermission(item.can as string[]);
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
    createPermissionCacheKey,
    fetchUpdateAndDeletePermission,
    fetchAdvancedPermission,
    fetchAdvancedPermissions,
    fetchPermissionsForDropdownOptions,
    fetchPermissionsOfContextMenu,
    extractMenuPermissions,
    setExtraVariables,
  };
};

export {
  ignorePermissions,
  setIgnorePermissions,
  usePermissions,
  resetAdvancedPermissions,
  advancedPermissions,
};
