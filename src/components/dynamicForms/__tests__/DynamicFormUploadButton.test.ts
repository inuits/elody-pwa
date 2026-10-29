import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref } from "vue";
import DynamicFormUploadButton from "../DynamicFormUploadButton.vue";
import { DamsIcons, UploadFlow } from "@/generated-types/queries";

const state = vi.hoisted(() => ({}) as Record<string, any>);

vi.mock("@/composables/upload/useUpload", () => ({
  default: () => state,
}));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, named?: unknown) =>
      named ? `${key} ${JSON.stringify(named)}` : key,
  }),
}));

const setState = (overrides: Record<string, unknown>) => {
  Object.assign(state, {
    uploadProgress: ref([]),
    uploadStatus: ref("uploading"),
    amountUploaded: ref(0),
    mediafiles: ref([{}, {}, {}]),
    resetUpload: vi.fn(),
    failedUploads: ref([]),
    uploadFlow: ref(UploadFlow.MediafilesOnly),
    csvOnlyUploadSFailed: ref(false),
  });
  Object.entries(overrides).forEach(([key, value]) => (state[key].value = value));
};

const getWrapper = () =>
  shallowMount(DynamicFormUploadButton, {
    props: { label: "Upload", icon: DamsIcons.NoIcon, disabled: false },
    global: { provide: { config: {} }, stubs: { unicon: true } },
  });
const status = () => getWrapper().find('[role="status"]');

describe("DynamicFormUploadButton - status banner", () => {
  beforeEach(() => setState({}));

  it("counts uploaded files while uploading", () => {
    setState({ uploadStatus: "uploading", amountUploaded: 1 });
    expect(status().text()).toBe(
      'upload-fields.uploaded-of {"done":1,"total":3}',
    );
  });

  it("is a success when every file went up", () => {
    setState({ uploadStatus: "upload-finished", amountUploaded: 3 });
    expect(status().text()).toBe(
      'upload-fields.uploaded-of {"done":3,"total":3}',
    );
    expect(getWrapper().find("[data-tone]").attributes("data-tone")).toBe(
      "success",
    );
  });

  it("is a warning when only some files went up", () => {
    setState({
      uploadStatus: "upload-finished",
      amountUploaded: 2,
      failedUploads: ["c.tiff"],
    });
    expect(getWrapper().find("[data-tone]").attributes("data-tone")).toBe(
      "warning",
    );
  });

  it("is a danger when no file went up", () => {
    setState({
      uploadStatus: "upload-finished",
      amountUploaded: 0,
      failedUploads: ["a", "b", "c"],
    });
    expect(getWrapper().find("[data-tone]").attributes("data-tone")).toBe(
      "danger",
    );
  });

  it("keeps the CSV flow's own messages", () => {
    setState({
      uploadStatus: "upload-finished",
      uploadFlow: UploadFlow.CsvOnly,
      mediafiles: [],
      csvOnlyUploadSFailed: true,
    });
    expect(status().text()).toBe("actions.labels.csv-errors");
    expect(getWrapper().find("[data-tone]").attributes("data-tone")).toBe(
      "danger",
    );
  });
});
