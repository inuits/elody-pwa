// dynamicFormLoaded is shared by every DynamicForm instance (useDynamicForm),
// so a form that unmounts resets it for the others. A form that gets its
// fields as a prop (a tab of a multi-tab form, bulk edit) fetches nothing and
// is never waiting for it.
export const showsFormSkeleton = ({
  dynamicFormLoaded,
  hasFieldsFromProps,
}: {
  dynamicFormLoaded: boolean;
  hasFieldsFromProps: boolean;
}): boolean => !dynamicFormLoaded && !hasFieldsFromProps;
