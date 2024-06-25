import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCustomQuery } from "@/composables/useCustomQuery";
import { useImport } from "@/composables/useImport";

// Mock the useImport composable
vi.mock("@/composables/useImport");

describe("useCustomQuery", () => {
  const mockLoadDoc = vi.fn();

  beforeEach(() => {
    mockLoadDoc.mockReset();
    // Ensure the mock return value is set correctly
    (useImport as jest.Mock).mockReturnValue({
      loadDocument: mockLoadDoc,
    });
  });

  it("should load documents and set them correctly", async () => {
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

  it("should return undefined document if loadDocument is not called", () => {
    const { getDocument } = useCustomQuery();
    expect(getDocument()).toBeUndefined();
  });
});
