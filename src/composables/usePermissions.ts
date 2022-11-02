import { Permission, GetUserPermissionsDocument } from "@/queries";
import { useQuery } from "@vue/apollo-composable";

const usePermissions = () => {
  const { result, loading } = useQuery(GetUserPermissionsDocument);

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

  const determinePermission = (perm: string, ignore: boolean) => {
    if (ignore) {
      return true;
    }
    if (result) {
      return result.UserPermissions?.payload.includes(perm);
    }
    return false;
  }

  return {
    canGet,
    canDelete,
    canEdit,
    determinePermission,
    loading,

  };
};

export default usePermissions;
