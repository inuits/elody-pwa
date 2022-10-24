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

  return {
    canGet,
    canDelete,
    canEdit,
  };
};

export default usePermissions;
