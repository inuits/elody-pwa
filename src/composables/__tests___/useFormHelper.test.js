import { expect, test, beforeAll } from "vitest";
import { useFormHelper } from "@/composables/useFormHelper";

const { addRelations, createForm, addForm, getForm } = useFormHelper();
const formId = "useFormHelperTests";
const initializeForm = () => {
  const form = createForm(formId, {
    intialValues: {},
    relationValues: {},
  });

  addForm(formId, form);
};

const getRelationIds = (form, relationType) => {
  return form.values.relationValues[relationType]
    .filter((item) => item.type === relationType)
    .map((item) => item.key);
};

beforeAll(async () => {
  // called once before all tests run
  await initializeForm();

  // clean up function, called once after all tests run
  return async () => {
    await initializeForm();
  };
});

test("adds new relations to the form", () => {
  const relationsToBeAdded = [
    {
      id: "ef78b938-6bd5-49469717",
      teaserMetadata: [
        {
          label: "",
          key: "filename",
          __typename: "PanelMetaData",
          value: "",
        },
        {
          label: "",
          key: "mimetype",
          __typename: "PanelMetaData",
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
          __typename: "PanelMetaData",
          value: "",
        },
        {
          label: "",
          key: "mimetype",
          __typename: "PanelMetaData",
          value: "",
        },
      ],
    },
  ];

  addRelations([relationsToBeAdded[0]], "hasRelation", formId);

  expect(getRelationIds(getForm(formId), "hasRelation")).toEqual([
    relationsToBeAdded[0].id,
  ]);

  addRelations([relationsToBeAdded[1]], "hasRelation", formId);

  expect(getRelationIds(getForm(formId), "hasRelation").sort()).toEqual([
    relationsToBeAdded[1].id,
  ]);
});

test("adds new relation without removing old ones", () => {
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
  const newFormId = "keepRelationId";

  const form = createForm(newFormId, {
    intialValues: {},
    relationValues: {
      hasRelation: initialRelations,
    },
  });

  addForm(newFormId, form);
  const relationsToBeAdded = [
    {
      id: "ef78b938-6bd5-49469717",
      teaserMetadata: [
        {
          label: "",
          key: "filename",
          __typename: "PanelMetaData",
          value: "",
        },
        {
          label: "",
          key: "mimetype",
          __typename: "PanelMetaData",
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
          __typename: "PanelMetaData",
          value: "",
        },
        {
          label: "",
          key: "mimetype",
          __typename: "PanelMetaData",
          value: "",
        },
      ],
    },
  ];

  addRelations(relationsToBeAdded, "hasRelation", newFormId, keepExisted);

  expect([...getRelationIds(getForm(newFormId), "hasRelation")].sort()).toEqual(
    [
      ...initialRelationIds,
      ...relationsToBeAdded.map((relation) => relation.id),
    ].sort()
  );
});
