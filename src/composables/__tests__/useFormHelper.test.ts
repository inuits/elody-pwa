import { describe, expect, it, vi } from "vitest";
import { useFormHelper } from "@/composables/useFormHelper";
import type { FormContext } from "vee-validate";
import type { BaseRelationValuesInput } from "@/generated-types/queries";
import { EditStatus } from "@/generated-types/queries";
import { apolloClient } from "@/main";
const {
  addRelations,
  createForm,
  getForm,
  parseRelationValuesForFormSubmit,
  parseInheritedRelationValuesFromFormSubmit,
} = useFormHelper();

vi.mock("@/main", () => ({
  apolloClient: {
    query: vi.fn(),
  },
}));

const getRelationIds = (form: FormContext, relationType: string) => {
  return form?.values.relationValues[relationType]
    .filter((item: { [key: string]: any }) => item.type === relationType)
    .map((item: { [key: string]: any }) => item.key);
};

describe("useFormHelper", () => {
  it("adds new relations to the form", () => {
    const formId = "ef78b938";
    createForm(formId, {
      intialValues: {} as any,
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
      getRelationIds(getForm(formId) as FormContext, "hasRelation"),
    ).toEqual([relationsToBeAdded[0].id]);

    addRelations([relationsToBeAdded[1]], "hasRelation", formId);

    expect(
      getRelationIds(getForm(formId) as FormContext, "hasRelation").sort(),
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
      intialValues: {} as any,
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
      ].sort(),
    ).toEqual(
      [
        ...initialRelationIds,
        ...relationsToBeAdded.map((relation) => relation.id),
      ].sort(),
    );
  });

  it("gets form if exists or undefined", () => {
    const formId = "ef7";
    createForm(formId, {
      intialValues: {} as any,
      relationValues: {},
    });

    expect(getForm(formId)).toBeDefined();
    expect(getForm("test")).toBeUndefined();
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

describe("useFormHelper - parse relation values", () => {
  const rawDefaultRelations = {
    movie: [
      {
        editStatus: "new",
        key: "HotelArtemis",
        type: "isMovieFor",
        value: "HotelArtemis",
      },
    ] as BaseRelationValuesInput[],
    picture: [
      {
        editStatus: "new",
        key: "Picture1",
        type: "isPictureFor",
        value: "Picture1",
      },
    ] as BaseRelationValuesInput[],
  };

  const rawRelationsWithInheritage = {
    refLanguage: [
      {
        editStatus: "new",
        key: "",
        type: "Language",
        value: "",
        inheritFrom: {
          entityType: "script",
          relationKey: "refScript",
          valueKey: "relationValues.refLanguage.key",
        },
      },
    ] as BaseRelationValuesInput[],
  };

  it("should parse relation values for form submit", () => {
    expect(parseRelationValuesForFormSubmit(rawDefaultRelations)).toStrictEqual(
      [
        {
          editStatus: "new",
          key: "HotelArtemis",
          type: "isMovieFor",
          value: "HotelArtemis",
        },
        {
          editStatus: "new",
          key: "Picture1",
          type: "isPictureFor",
          value: "Picture1",
        },
      ],
    );
  });

  it("should parse relation values and filter out relations with inheritance", () => {
    expect(
      parseRelationValuesForFormSubmit({
        ...rawDefaultRelations,
        ...rawRelationsWithInheritage,
      }),
    ).toStrictEqual([
      {
        editStatus: "new",
        key: "HotelArtemis",
        type: "isMovieFor",
        value: "HotelArtemis",
      },
      {
        editStatus: "new",
        key: "Picture1",
        type: "isPictureFor",
        value: "Picture1",
      },
    ]);
  });

  it("should return empty array of relations", () => {
    expect(
      parseRelationValuesForFormSubmit(rawRelationsWithInheritage),
    ).toStrictEqual([]);
  });

  it("should set Unchanged editStatus when not provided", () => {
    const relations = {
      movie: [
        {
          key: "HotelArtemis",
          type: "isMovieFor",
          value: "HotelArtemis",
        },
      ] as BaseRelationValuesInput[],
    };
    const result = parseRelationValuesForFormSubmit(relations);
    expect(result[0].editStatus).toBe(EditStatus.Unchanged);
  });
});

describe("parseInheritedRelationValuesFromFormSubmit", () => {
  const rawDefaultRelations = {
    movie: [
      {
        editStatus: "new",
        key: "HotelArtemis",
        type: "refMovie",
        value: "HotelArtemis",
      },
    ] as BaseRelationValuesInput[],
    picture: [
      {
        editStatus: "new",
        key: "Picture1",
        type: "refPicture",
        value: "Picture1",
      },
    ] as BaseRelationValuesInput[],
  };

  const relationsWithInheritance = {
    refLanguage: [
      {
        editStatus: "new",
        key: "",
        type: "Language",
        value: "",
        inheritFrom: {
          entityType: "script",
          relationKey: "refLanguage",
          valueKey: "properties.testKey",
        },
      },
    ] as BaseRelationValuesInput[],
  };

  const mockEntity = {
    id: "123",
    name: "Test Entity",
    properties: {
      testKey: ["testValue"],
    },
  };

  it("should return empty array for null input", async () => {
    const result = await parseInheritedRelationValuesFromFormSubmit(null);
    expect(result).toEqual([]);
  });

  it("should return empty array when no inherited relations exist", async () => {
    const result =
      await parseInheritedRelationValuesFromFormSubmit(rawDefaultRelations);
    expect(result).toEqual([]);
  });

  it("should process inherited relations and return them", async () => {
    (apolloClient.query as vi.Mock).mockResolvedValue({
      data: { Entity: mockEntity },
    });

    const result = await parseInheritedRelationValuesFromFormSubmit({
      inheritedLanguage: [
        {
          editStatus: EditStatus.New,
          key: "",
          type: "Language",
          value: "",
          inheritFrom: {
            entityType: "movie",
            relationKey: "refMovie",
            valueKey: "properties.testKey",
          },
        },
      ],
      ...rawDefaultRelations,
    });

    expect(result).toStrictEqual([
      {
        editStatus: EditStatus.New,
        key: "testValue",
        type: "Language",
        value: "testValue",
      },
    ]);
  });

  it("should return empty array when inherited value cannot be extracted", async () => {
    (apolloClient.query as vi.Mock).mockResolvedValue({
      data: { Entity: mockEntity },
    });
    const result = await parseInheritedRelationValuesFromFormSubmit(
      relationsWithInheritance,
    );
    expect(result).toEqual([]);
  });

  it("should handle multiple inherited relations", async () => {
    const relations = {
      refLanguage: [
        {
          editStatus: EditStatus.New,
          key: "",
          type: "Language",
          value: "",
          inheritFrom: {
            entityType: "asset",
            relationKey: "refAsset",
            valueKey: "refLanguage.key",
          },
        },
      ] as BaseRelationValuesInput[],
      refCountry: [
        {
          editStatus: EditStatus.New,
          key: "",
          type: "Country",
          value: "",
          inheritFrom: {
            entityType: "asset",
            relationKey: "refMediafile",
            valueKey: "refCountry.key",
          },
        },
      ] as BaseRelationValuesInput[],
      refAsset: [
        {
          editStatus: EditStatus.New,
          key: "HotelArtemis",
          type: "refAsset",
          value: "HotelArtemis",
        },
      ] as BaseRelationValuesInput[],
      refMediafile: [
        {
          editStatus: EditStatus.New,
          key: "Picture1",
          type: "refMediafile",
          value: "Picture1",
        },
      ] as BaseRelationValuesInput[],
    };

    (apolloClient.query as vi.Mock).mockResolvedValue({
      data: {
        Entity: {
          id: "123",
          name: "Test Entity",
          refCountry: [{ key: "Spain" }],
          refLanguage: [{ key: "Spanish" }],
        },
      },
    });

    const result = await parseInheritedRelationValuesFromFormSubmit(relations);
    expect(result).toStrictEqual([
      {
        editStatus: EditStatus.New,
        key: "Spanish",
        type: "Language",
        value: "Spanish",
      },
      {
        editStatus: EditStatus.New,
        key: "Spain",
        type: "Country",
        value: "Spain",
      },
    ]);
  });

  it("should handle inherited relations and return value only for existed relations", async () => {
    const relations = {
      refLanguage: [
        {
          editStatus: EditStatus.New,
          key: "",
          type: "Language",
          value: "",
          inheritFrom: {
            entityType: "asset",
            relationKey: "refAsset",
            valueKey: "refLanguage.key",
          },
        },
      ] as BaseRelationValuesInput[],
      refCountry: [
        {
          editStatus: EditStatus.New,
          key: "",
          type: "Country",
          value: "",
          inheritFrom: {
            entityType: "asset",
            relationKey: "refUknown",
            valueKey: "refCountry.key",
          },
        },
      ] as BaseRelationValuesInput[],
      refAsset: [
        {
          editStatus: EditStatus.New,
          key: "HotelArtemis",
          type: "refAsset",
          value: "HotelArtemis",
        },
      ] as BaseRelationValuesInput[],
      refMediafile: [
        {
          editStatus: EditStatus.New,
          key: "Picture1",
          type: "refMediafile",
          value: "Picture1",
        },
      ] as BaseRelationValuesInput[],
    };

    (apolloClient.query as vi.Mock).mockResolvedValue({
      data: {
        Entity: {
          id: "123",
          name: "Test Entity",
          refCountry: [{ key: "Spain" }],
          refLanguage: [{ key: "Spanish" }],
        },
      },
    });

    const result = await parseInheritedRelationValuesFromFormSubmit(relations);
    expect(result).toStrictEqual([
      {
        editStatus: EditStatus.New,
        key: "Spanish",
        type: "Language",
        value: "Spanish",
      },
    ]);
  });
});
