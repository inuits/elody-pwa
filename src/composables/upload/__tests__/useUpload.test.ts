import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick, ref } from "vue";
import { flushPromises } from "@vue/test-utils";
import useUpload from "../useUpload";

vi.mock("@/helpers", () => ({
  getTranslatedMessage: vi.fn((key, args) => `Missing ${args[0]}`),
}));

vi.mock("@/composables/useErrorCodes", () => ({
  useErrorCodes: () => ({
    handleHttpError: vi.fn(),
    getMessageAndCodeFromErrorString: vi
      .fn()
      .mockResolvedValue({ message: "Error" }),
  }),
}));

vi.mock("@/composables/upload/useUploadFlowConfiguration", () => ({
  useUploadFlowConfiguration: () => ({
    getUploadFlowConfiguration: vi.fn().mockReturnValue({
      checkUploadValidity: () => true,
      validateFiles: () => true,
    }),
  }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ changeCloseConfirmation: vi.fn() }),
}));

vi.mock("@/components/dynamicForms/useDynamicForm", async () => {
  return { useDynamicForm: () => ({ dynamicFormUploadFields: ref([]) }) };
});

vi.mock("../useUploadState", async () => {
  const files = ref([]);
  const missingFileNames = ref([]);
  const dryRunFeedback = ref({ errors: [], warnings: [] });
  const failedUploads = ref([]);
  const uploadFlow = ref("MediafilesWithRequiredCsv");
  const uploadProgress = ref([]);
  const uploadStatus = ref("Uploading");
  const amountUploaded = ref(0);
  const dryRunComplete = ref(false);
  const requiredMediafiles = ref([]);
  const standaloneFileType = ref("");
  const csvOnlyUploadSFailed = ref(false);
  const jobIdentifier = ref("");
  const prefetchedUploadUrls = ref([]);
  const extraMediafileType = ref("");
  const typeToIncludeInUrl = ref("");
  const shouldIncludeTypeInUrl = ref(false);
  const lastUploadedFileIndex = ref(-1);

  return {
    useUploadState: () => ({
      files,
      missingFileNames,
      dryRunFeedback,
      failedUploads,
      uploadFlow,
      uploadProgress,
      uploadStatus,
      amountUploaded,
      dryRunComplete,
      requiredMediafiles,
      standaloneFileType,
      csvOnlyUploadSFailed,
      jobIdentifier,
      prefetchedUploadUrls,
      extraMediafileType,
      typeToIncludeInUrl,
      shouldIncludeTypeInUrl,
      lastUploadedFileIndex,
      reinitializeDynamicFormFunc: ref(() => {}),
      resetState: vi.fn(),
    }),
  };
});

describe("useUpload - Missing Mediafiles validation", () => {
  let mockBatchEntitiesResponse = {
    errors: {},
    mediafiles: [{ filename: "missing-image.jpg" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockBatchEntitiesResponse)),
      } as Response),
    );
  });

  const createFakeFile = (name: string, type: string) => {
    const previewTemplate = document.createElement("div");

    const warningContainer = document.createElement("div");
    warningContainer.classList.add("warning-message-container", "hidden");

    const errorContainer = document.createElement("div");
    errorContainer.classList.add("error-message-container", "hidden");

    const validateContainer = document.createElement("div");
    validateContainer.classList.add("file-validate-container");
    const validateLoading = document.createElement("div");
    validateLoading.classList.add("file-validate-loading");
    validateContainer.appendChild(validateLoading);

    previewTemplate.appendChild(warningContainer);
    previewTemplate.appendChild(errorContainer);
    previewTemplate.appendChild(validateContainer);

    return { name, type, previewTemplate, status: "added" } as any;
  };

  const settleReactivity = async () => {
    await flushPromises();
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));
  };

  it("calls the error handler and updates DOM for missing mediafiles in a CSV file", async () => {
    const csvFile = createFakeFile("data.csv", "text/csv");
    const { addFileToUpload, resetUpload } = useUpload({});

    resetUpload();

    await addFileToUpload(csvFile, true);

    const errorContainer = csvFile.previewTemplate.querySelector(
      ".error-message-container",
    );

    expect(
      csvFile.previewTemplate.classList.contains("border-red-default"),
    ).toBe(true);
    expect(errorContainer?.classList.contains("hidden")).toBe(false);
    expect(errorContainer?.innerHTML).toContain("Missing missing-image.jpg");
  });

  it("calls the error handler and updates DOM for missing mediafiles in an Excel file", async () => {
    const excelFile = createFakeFile(
      "data.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    const { addFileToUpload, resetUpload } = useUpload({});

    resetUpload();
    await addFileToUpload(excelFile, true);

    const errorContainer = excelFile.previewTemplate.querySelector(
      ".error-message-container",
    );

    expect(
      excelFile.previewTemplate.classList.contains("border-red-default"),
    ).toBe(true);
    expect(errorContainer?.classList.contains("hidden")).toBe(false);
    expect(errorContainer?.innerHTML).toContain("Missing missing-image.jpg");
  });

  it("does not call the error handler and does not update DOM for missing mediafiles in an Excel file", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ errors: {}, mediafiles: [] }),
    } as Response);

    const excelFile = createFakeFile(
      "data.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    const { addFileToUpload, resetUpload } = useUpload({});

    resetUpload();
    await addFileToUpload(excelFile, true);

    const errorContainer = excelFile.previewTemplate.querySelector(
      ".error-message-container",
    );

    expect(
      excelFile.previewTemplate.classList.contains("border-red-default"),
    ).toBe(false);
    expect(errorContainer?.classList.contains("hidden")).toBe(true);
    expect(errorContainer?.innerHTML).toContain("");
  });

  it("does not call the error handler and does not update DOM for missing mediafiles in an CSV file", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ errors: {}, mediafiles: [] }),
    } as Response);

    const csvFile = createFakeFile("data.csv", "text/csv");
    const { addFileToUpload, resetUpload } = useUpload({});

    resetUpload();
    await addFileToUpload(csvFile, true);

    const errorContainer = csvFile.previewTemplate.querySelector(
      ".error-message-container",
    );

    expect(
      csvFile.previewTemplate.classList.contains("border-red-default"),
    ).toBe(false);
    expect(errorContainer?.classList.contains("hidden")).toBe(true);
    expect(errorContainer?.innerHTML).toContain("");
  });
});

describe("useUpload - Warnings from dry run", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createFakeFile = (name: string, type: string) => {
    const previewTemplate = document.createElement("div");

    const warningContainer = document.createElement("div");
    warningContainer.classList.add("warning-message-container", "hidden");

    const errorContainer = document.createElement("div");
    errorContainer.classList.add("error-message-container", "hidden");

    const validateContainer = document.createElement("div");
    validateContainer.classList.add("file-validate-container");
    const validateLoading = document.createElement("div");
    validateLoading.classList.add("file-validate-loading");
    validateContainer.appendChild(validateLoading);

    previewTemplate.appendChild(warningContainer);
    previewTemplate.appendChild(errorContainer);
    previewTemplate.appendChild(validateContainer);

    return { name, type, previewTemplate, status: "added" } as any;
  };

  it("shows warnings in warning container and does not set red border", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              errors: {},
              warnings: { row_1: ["W0001 duplicate key"] },
              mediafiles: [],
            }),
          ),
      } as Response),
    );

    const csvFile = createFakeFile("data.csv", "text/csv");
    const { addFileToUpload, resetUpload } = useUpload({});

    resetUpload();
    await addFileToUpload(csvFile, true);

    const warningContainer = csvFile.previewTemplate.querySelector(
      ".warning-message-container",
    );
    const errorContainer = csvFile.previewTemplate.querySelector(
      ".error-message-container",
    );

    expect(warningContainer?.classList.contains("hidden")).toBe(false);
    expect(warningContainer?.innerHTML).toContain("Error");
    expect(
      csvFile.previewTemplate.classList.contains("border-red-default"),
    ).toBe(false);
    expect(errorContainer?.classList.contains("hidden")).toBe(true);
  });

  it("shows both warnings and errors when backend returns both", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              errors: { row_1: ["E0001 invalid value"] },
              warnings: { row_2: ["W0001 duplicate key"] },
              mediafiles: [],
            }),
          ),
      } as Response),
    );

    const csvFile = createFakeFile("data.csv", "text/csv");
    const { addFileToUpload, resetUpload } = useUpload({});

    resetUpload();
    await addFileToUpload(csvFile, true);

    const warningContainer = csvFile.previewTemplate.querySelector(
      ".warning-message-container",
    );
    const errorContainer = csvFile.previewTemplate.querySelector(
      ".error-message-container",
    );

    expect(warningContainer?.classList.contains("hidden")).toBe(false);
    expect(errorContainer?.classList.contains("hidden")).toBe(false);
    expect(
      csvFile.previewTemplate.classList.contains("border-red-default"),
    ).toBe(true);
  });

  it("hides warning container when no warnings present", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              errors: {},
              warnings: {},
              mediafiles: [],
            }),
          ),
      } as Response),
    );

    const csvFile = createFakeFile("data.csv", "text/csv");
    const { addFileToUpload, resetUpload } = useUpload({});

    resetUpload();
    await addFileToUpload(csvFile, true);

    const warningContainer = csvFile.previewTemplate.querySelector(
      ".warning-message-container",
    );

    expect(warningContainer?.classList.contains("hidden")).toBe(true);
  });

  it("sets dryRunFeedback errors empty and warnings populated when only warnings returned", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              errors: {},
              warnings: { row_1: ["W0001 duplicate key"] },
              mediafiles: [],
            }),
          ),
      } as Response),
    );

    const csvFile = createFakeFile("data.csv", "text/csv");
    const { addFileToUpload, resetUpload, dryRunFeedback } = useUpload({});

    resetUpload();
    await addFileToUpload(csvFile, true);

    expect(dryRunFeedback.value.errors).toHaveLength(0);
    expect(dryRunFeedback.value.warnings.length).toBeGreaterThan(0);
  });
});
