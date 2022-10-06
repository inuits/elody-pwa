import { Permission } from "@/queries";

const usePermissions = () => {
  const canEdit = (permissions: Permission[]) => {
    return (
      permissions.includes(Permission.Canput) &&
      permissions.includes(Permission.Canpatch)
    );
  };

  const canDelete = (permissions: Permission[]) =>
    permissions.includes(Permission.Candelete);

  return {
    canDelete,
    canEdit,
  };
};

export default usePermissions;
