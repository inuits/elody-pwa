import { Permission } from "@/queries";

const usePermissions = () => {
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

  const determinePermission = (arr: any, perm: string, ignore: boolean) => {
    if (ignore) {
      return true;
    }
    if (arr) {
      return arr.includes(perm);
    }
    return false;
  }

  return {
    canGet,
    canDelete,
    canEdit,
    determinePermission
  };
};

export default usePermissions;
