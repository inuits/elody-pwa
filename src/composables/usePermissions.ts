import { Permission, GetUserPermissionsDocument } from "@/queries";
import { useQuery } from "@vue/apollo-composable";
import { ref } from 'vue';

const ignorePermissions = ref<boolean>(false);
const setIgnorePermissions = (value: boolean) => {
  ignorePermissions.value = value;
}

const usePermissions = () => {
  const { result, loading } = useQuery(
    GetUserPermissionsDocument
  );

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

  const determinePermission = (perm: string) => {
    if (ignorePermissions) {
      return true;
    }
    if (result.value?.UserPermissions?.payload) {
      return ['read-saved-search'].includes(perm);
    }
    return false;
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
