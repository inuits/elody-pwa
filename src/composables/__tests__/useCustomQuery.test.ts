import { describe, it, expect, vi } from "vitest";
import { useCustomQuery } from "@/composables/useCustomQuery";
import { useImport } from "@/composables/useImport";

vi.mock("@/composables/useImport");

describe("useCustomQuery", () => {
  it("should return undefined document if loadDocument is not called", () => {
    const { getDocument } = useCustomQuery();
    expect(getDocument()).toBeUndefined();
  });

  it("should load documents and set them correctly", async () => {
    const mockLoadDoc = vi.fn();
    mockLoadDoc.mockReset();
    useImport.mockReturnValue({
      loadDocument: mockLoadDoc,
    });
    const queryDoc = "queryDoc";
    const filtersQueryDoc = "filtersQueryDoc";
    const queryDocument = { content: "queryDocumentContent" };
    const filtersDocument = { content: "filtersDocumentContent" };

    mockLoadDoc.mockResolvedValueOnce(queryDocument);
    mockLoadDoc.mockResolvedValueOnce(filtersDocument);

    const { loadDocument, getDocument } = useCustomQuery();
    await loadDocument(queryDoc, filtersQueryDoc);

    expect(mockLoadDoc).toHaveBeenCalledTimes(2);
    expect(mockLoadDoc).toHaveBeenCalledWith(queryDoc);
    expect(mockLoadDoc).toHaveBeenCalledWith(filtersQueryDoc);
    expect(getDocument()).toEqual({
      name: queryDoc,
      document: queryDocument,
      filtersDocument: filtersDocument,
    });
  });
});
