import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref } from "vue";
import UploadInterfaceDropzone from "@/components/UploadInterfaceDropzone.vue";
import { UploadFieldType, UploadFlow } from "@/generated-types/queries";

vi.mock("@/composables/useDropzone", () => ({
  useDropzone: class {
    dropzoneSettings = ref({});
  },
}));
vi.mock("@/composables/upload/useUpload", () => ({
  default: () => ({ initializeUpload: vi.fn(), files: ref([]) }),
}));

const getWrapper = () =>
  shallowMount(UploadInterfaceDropzone, {
    props: {
      uploadFlow: UploadFlow.MediafilesOnly,
      dropzoneLabel: "upload-fields.dropzone",
      dryRun: false,
      uploadFieldType: UploadFieldType.Batch,
      infoLabelUrl: "https://docs.example/upload",
      templateCsvs: ["template.csv"],
    },
    global: {
      provide: { config: {} },
      mocks: { $t: (key: string) => key },
      stubs: { unicon: true },
    },
  });

describe("UploadInterfaceDropzone - info notes", () => {
  it("does not announce static notes as alerts", () => {
    expect(getWrapper().findAll('[role="alert"]')).toHaveLength(0);
  });

  it("keeps the documentation link", () => {
    expect(
      getWrapper().find('a[href="https://docs.example/upload"]').exists(),
    ).toBe(true);
  });

  it("draws the info icon instead of an inline SVG", () => {
    expect(getWrapper().find("svg").exists()).toBe(false);
  });

  it("downloads the CSV template from a real button", () => {
    const button = getWrapper()
      .findAll("button")
      .find((b) => b.text() === "upload-fields.csv-template-link");
    expect(button?.attributes("type")).toBe("button");
  });
});
