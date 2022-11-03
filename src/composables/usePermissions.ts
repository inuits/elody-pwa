import { Permission, GetUserPermissionsDocument } from "@/queries";
import { useQuery } from "@vue/apollo-composable";
import { ref } from 'vue';

const UserPermissions = ref<string[] | "no-permissions">("no-permissions");
const ignorePermissions = ref<boolean>(false);
const setIgnorePermissions = (value: boolean) => {
  ignorePermissions.value = value;
}

const usePermissions = () => {
  const { loading, refetch, onResult } = useQuery(
    GetUserPermissionsDocument,
    () => ({
      enabled: false,
    })
  );

  onResult((result) => {
    UserPermissions.value = result;
  });

  const canGet = (permissions: Permission[]) => {
    return permissions.includes(Permission.Canget);
  };
  const canEdit = (permissions: Permission[]) => {
    return (
      permissions.includes(Permission.Canput) &&
      permissions.includes(Permission.Canpatch)
    );
  };

  const canDelete = (permissions: Permission[]) =>
    permissions.includes(Permission.Candelete);

  const determinePermission = async (perm: string) => {
    if (ignorePermissions) {
      return true;
    }
    if (UserPermissions.value === "no-permissions") {
      await refetch();
    }
    return UserPermissions.value.payload.includes(perm);
  }

  return {
    canGet,
    canDelete,
    canEdit,
    determinePermission,
    loading,
    setIgnorePermissions
  };
};

export {usePermissions, setIgnorePermissions } ;
