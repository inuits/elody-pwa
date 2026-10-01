import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useActionButton,
  resolveActionButtonVariables,
  isActionButtonHidden,
} from "@/composables/useActionButton";
import { ActionButtonResult, type ActionButton } from "@/generated-types/queries";
import { apolloClient } from "@/main";

vi.mock("@/main", () => ({
  apolloClient: { query: vi.fn(), mutate: vi.fn() },
}));

const loadDocument = vi.fn();
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument }),
}));

const formsByEntityId: Record<string, { values: unknown }> = {};
vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    getForm: (key: string) => formsByEntityId[key],
  }),
}));

const downloadMediafile = vi.fn();
vi.mock("@/composables/useMediafileDownload", () => ({
  useMediafileDownload: () => ({ downloadMediafile }),
}));

const displayErrorNotification = vi.fn();
vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => ({ displayErrorNotification }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const queryDocument = {
  definitions: [{ kind: "OperationDefinition", operation: "query" }],
};
const mutationDocument = {
  definitions: [{ kind: "OperationDefinition", operation: "mutation" }],
};

const makeButton = (overrides: Partial<ActionButton> = {}): ActionButton => ({
  __typename: "ActionButton",
  label: "label",
  icon: "DownloadAlt",
  onResult: ActionButtonResult.None,
  ...overrides,
});

const rowValues = {
  intialValues: { id: "MF-1", original_filename: "poster.jpg" },
  relationValues: {},
};

describe("resolveActionButtonVariables", () => {
  beforeEach(() => {
    Object.keys(formsByEntityId).forEach((key) => delete formsByEntityId[key]);
  });

  it("reads the mapped paths from the row's form when it has one", () => {
    formsByEntityId["MF-1"] = {
      values: { intialValues: { id: "MF-1", title: "edited title" } },
    };
    const variables = resolveActionButtonVariables(
      { id: "intialValues.id", title: "intialValues.title" },
      "MF-1",
      rowValues,
    );
    expect(variables).toEqual({ id: "MF-1", title: "edited title" });
  });

  it("falls back to the row's own values when the row has no form", () => {
    const variables = resolveActionButtonVariables(
      { filename: "intialValues.original_filename" },
      "MF-1",
      rowValues,
    );
    expect(variables).toEqual({ filename: "poster.jpg" });
  });

  it("resolves no variables without a mapping", () => {
    expect(resolveActionButtonVariables(undefined, "MF-1", rowValues)).toEqual(
      {},
    );
  });
});

describe("isActionButtonHidden", () => {
  beforeEach(() => {
    Object.keys(formsByEntityId).forEach((key) => delete formsByEntityId[key]);
  });

  it("shows a button without hide conditions", () => {
    expect(isActionButtonHidden(makeButton(), "MF-1", rowValues)).toBe(false);
  });

  it("hides a button when a negated path is empty", () => {
    const button = makeButton({ hideIf: ["!intialValues.filename"] });

    expect(isActionButtonHidden(button, "MF-1", rowValues)).toBe(true);
    expect(
      isActionButtonHidden(button, "MF-1", {
        intialValues: { filename: "poster.jpg" },
      }),
    ).toBe(false);
  });

  it("supports or and and conditions", () => {
    const values = { intialValues: { id: "MF-1", title: "" } };

    expect(
      isActionButtonHidden(
        makeButton({ hideIf: ["intialValues.title|intialValues.id"] }),
        "MF-1",
        values,
      ),
    ).toBe(true);
    expect(
      isActionButtonHidden(
        makeButton({ hideIf: ["intialValues.title&intialValues.id"] }),
        "MF-1",
        values,
      ),
    ).toBe(false);
  });
});

describe("useActionButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(formsByEntityId).forEach((key) => delete formsByEntityId[key]);
  });

  it("runs a configured query with the resolved variables", async () => {
    loadDocument.mockResolvedValue(queryDocument);
    vi.mocked(apolloClient.query).mockResolvedValue({ data: {} } as any);
    const { runActionButton } = useActionButton();

    await runActionButton(
      makeButton({ query: "GetThing", variables: { id: "intialValues.id" } }),
      "MF-1",
      rowValues,
    );

    expect(loadDocument).toHaveBeenCalledWith("GetThing");
    expect(apolloClient.query).toHaveBeenCalledWith({
      query: queryDocument,
      variables: { id: "MF-1" },
      fetchPolicy: "no-cache",
    });
  });

  it("runs a mutation document as a mutation", async () => {
    loadDocument.mockResolvedValue(mutationDocument);
    vi.mocked(apolloClient.mutate).mockResolvedValue({ data: {} } as any);
    const { runActionButton } = useActionButton();

    await runActionButton(makeButton({ query: "DoThing" }), "MF-1", rowValues);

    expect(apolloClient.mutate).toHaveBeenCalledWith({
      mutation: mutationDocument,
      variables: {},
    });
    expect(apolloClient.query).not.toHaveBeenCalled();
  });

  it("downloads the url a query returns", async () => {
    loadDocument.mockResolvedValue(queryDocument);
    vi.mocked(apolloClient.query).mockResolvedValue({
      data: {
        DownloadUrl: {
          __typename: "DownloadLink",
          url: "https://storage/poster.jpg",
        },
      },
    } as any);
    const clickedHrefs: string[] = [];
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        clickedHrefs.push(this.href);
      });
    const { runActionButton } = useActionButton();

    await runActionButton(
      makeButton({
        query: "GetDownloadUrl",
        onResult: ActionButtonResult.DownloadFile,
      }),
      "MF-1",
      rowValues,
    );

    expect(clickedHrefs).toEqual(["https://storage/poster.jpg"]);
    expect(downloadMediafile).not.toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("downloads a mediafile through the proxy when no query is configured", async () => {
    const { runActionButton } = useActionButton();

    await runActionButton(
      makeButton({
        onResult: ActionButtonResult.DownloadFile,
        variables: {
          mediafileId: "intialValues.id",
          originalFilename: "intialValues.original_filename",
        },
      }),
      "MF-1",
      rowValues,
    );

    expect(loadDocument).not.toHaveBeenCalled();
    expect(downloadMediafile).toHaveBeenCalledWith("MF-1", "poster.jpg");
  });

  it("refetches the parent entity after the action", async () => {
    loadDocument.mockResolvedValue(mutationDocument);
    vi.mocked(apolloClient.mutate).mockResolvedValue({ data: {} } as any);
    const refetchParentEntity = vi.fn();
    const { runActionButton } = useActionButton();

    await runActionButton(
      makeButton({
        query: "DoThing",
        onResult: ActionButtonResult.RefetchParent,
      }),
      "MF-1",
      rowValues,
      refetchParentEntity,
    );

    expect(refetchParentEntity).toHaveBeenCalledOnce();
  });

  it("shows an error notification when the action fails", async () => {
    loadDocument.mockResolvedValue(queryDocument);
    vi.mocked(apolloClient.query).mockRejectedValue(new Error("boom"));
    const { runActionButton } = useActionButton();

    await runActionButton(makeButton({ query: "GetThing" }), "MF-1", rowValues);

    expect(displayErrorNotification).toHaveBeenCalledOnce();
  });
});
