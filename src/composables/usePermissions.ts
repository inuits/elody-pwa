import {
  GetAdvancedPermissionDocument,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";

let advancedPermissions: { [key: string]: boolean } = {};

const resetAdvancedPermissions = () => {
  advancedPermissions = {};
};

const usePermissions = () => {
  // The only permission the frontend still asks for itself: a route's `can`,
  // which is checked before the entity it guards has been fetched. Everything
  // else is resolved by the graphql layer, which leaves out what is not
  // permitted.
  const fetchAdvancedPermission = (
    permissions: string[],
    forceFetch: boolean = false,
  ) => {
    const permission = permissions[0];

    if (!forceFetch && permission in advancedPermissions) {
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
        `Error in usePermissions fetch advanced permissions function: ${e}`,
      );
    }
  };

  return { fetchAdvancedPermission };
};

export { usePermissions, resetAdvancedPermissions, advancedPermissions };
