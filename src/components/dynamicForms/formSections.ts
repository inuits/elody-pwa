/**
 * Form sections: a FormSection (baseGraphql, a SHACL 1.2 UI sh:PropertyGroup)
 * groups form fields under a heading. The form keeps working on one flat
 * field list — validation, submission and bulk edit see the same fields as
 * before — and every field of a section carries `formSection`, so the form
 * renders the heading where a section begins.
 */
export type FormSectionInfo = { key: string; label: string };

type FormFieldObject = Record<string, any> & {
  __typename?: string;
  formSection?: FormSectionInfo;
};

const fieldObjects = (formFields: Record<string, any>): [string, FormFieldObject][] =>
  Object.entries(formFields).filter(
    ([, value]) => value !== null && typeof value === "object",
  );

export const flattenFormFields = (
  formFields: Record<string, any>,
): FormFieldObject[] =>
  fieldObjects(formFields).flatMap(([key, value]) => {
    if (value.__typename !== "FormSection") return [value];
    const formSection: FormSectionInfo = { key, label: value.label ?? "" };
    return fieldObjects(value.formFields ?? {}).map(([, field]) => ({
      ...field,
      formSection,
    }));
  });

/** Whether the field at `index` is the first of its section. */
export const sectionStartsAt = (
  fields: FormFieldObject[],
  index: number,
): boolean => {
  const section = fields[index]?.formSection;
  if (!section) return false;
  return fields[index - 1]?.formSection?.key !== section.key;
};
