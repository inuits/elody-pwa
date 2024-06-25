import { describe, expect, it } from "vitest";
import { useFormHelper } from "@/composables/useFormHelper";
import type { FormContext } from "vee-validate";
import type { IntialValues } from "../../generated-types/queries";
const { addRelations, createForm, getForm } = useFormHelper();

const getRelationIds = (form: FormContext, relationType: string) => {
  return form?.values.relationValues[relationType]
    .filter((item: { [key: string]: any }) => item.type === relationType)
    .map((item: { [key: string]: any }) => item.key);
};

describe("useFormHelper", () => {
  it("adds new relations to the form", () => {
    const formId = "ef78b938";
    createForm(formId, {
      intialValues: {} as IntialValues,
      relationValues: {},
    });

    const relationsToBeAdded = [
      {
        id: "ef78b938-6bd5-49469717",
        teaserMetadata: [
          {
            label: "",
            key: "filename",
            __typename: "randomTypeName",
            value: "",
          },
          {
            label: "",
            key: "mimetype",
            __typename: "randomTypeName",
            value: "",
          },
        ],
      },
      {
        id: "af6f69a95-5dec-0527472c",
        teaserMetadata: [
          {
            label: "",
            key: "filename",
            __typename: "randomTypeName",
            value: "",
          },
          {
            label: "",
            key: "mimetype",
            __typename: "randomTypeName",
            value: "",
          },
        ],
      },
    ];

    addRelations([relationsToBeAdded[0]], "hasRelation", formId);

    expect(
      getRelationIds(getForm(formId) as FormContext, "hasRelation")
    ).toEqual([relationsToBeAdded[0].id]);

    addRelations([relationsToBeAdded[1]], "hasRelation", formId);

    expect(
      getRelationIds(getForm(formId) as FormContext, "hasRelation").sort()
    ).toEqual([relationsToBeAdded[1].id]);
  });

  it("adds new relation without removing old ones", () => {
    const keepExisted = true;
    const initialRelations = [
      {
        key: "b88c8bdd-745d-43e4",
        type: "hasRelation",
      },
      {
        key: "f884e207-4ae9-44c1",
        type: "hasRelation",
      },
      {
        key: "ef78b938-6bd5-4946",
        type: "hasRelation",
      },
    ];
    const initialRelationIds = initialRelations.map((item) => item.key);
    const newFormId = "b88c8bdd";

    createForm(newFormId, {
      intialValues: {} as IntialValues,
      relationValues: {
        hasRelation: initialRelations,
      },
    });

    const relationsToBeAdded = [
      {
        id: "ef78b938-6bd5-49469717",
        teaserMetadata: [
          {
            label: "",
            key: "filename",
            __typename: "randomTypeName",
            value: "",
          },
          {
            label: "",
            key: "mimetype",
            __typename: "randomTypeName",
            value: "",
          },
        ],
      },
      {
        id: "af6f69a95-5dec-0527472c",
        teaserMetadata: [
          {
            label: "",
            key: "filename",
            __typename: "randomTypeName",
            value: "",
          },
          {
            label: "",
            key: "mimetype",
            __typename: "randomTypeName",
            value: "",
          },
        ],
      },
    ];

    addRelations(relationsToBeAdded, "hasRelation", newFormId, keepExisted);

    expect(
      [
        ...getRelationIds(getForm(newFormId) as FormContext, "hasRelation"),
      ].sort()
    ).toEqual(
      [
        ...initialRelationIds,
        ...relationsToBeAdded.map((relation) => relation.id),
      ].sort()
    );
  });

  it("gets form if exists or undefined", () => {
    const formId = "ef7";
    createForm(formId, {
      intialValues: {} as IntialValues,
      relationValues: {},
    });

    expect(getForm(formId)).toBeDefined();

    expect(getForm("test")).toBeUndefined;
  });

  // it("should reset form values to initial values", async () => {
  //   const formId = "ef71giga";
  //   const initialValues = { language: "PL", description: "description" };
  //   const title = "title";
  //   createForm(formId, {
  //     intialValues: initialValues as any,
  //     relationValues: {},
  //   });

  //   const form = getForm(formId) as FormContext<any>;
  //   form.setFieldValue("initialValues.description", "test");
  //   console.log("form values: ", form.values.intialValues);

  //   expect(form.values.intialValues).toEqual({
  //     ...initialValues,
  //   });
  // });
});
