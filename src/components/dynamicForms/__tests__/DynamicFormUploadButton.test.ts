import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref } from "vue";
import DynamicFormUploadButton from "../DynamicFormUploadButton.vue";
import { DamsIcons, UploadFlow } from "@/generated-types/queries";

const state = vi.hoisted(() => ({}) as Record<string, any>);

vi.mock("@/composables/upload/useUpload", () => ({
  default: () => state,
}));
const notifications = vi.hoisted(() => ({
  displaySuccessNotification: vi.fn(),
  displayErrorNotification: vi.fn(),
}));
vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => notifications,
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
    duplicateMediafiles: ref([]),
    linkDuplicateMediafiles: vi.fn().mockResolvedValue(0),
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

describe("DynamicFormUploadButton - before an upload", () => {
  beforeEach(() => setState({ uploadStatus: "no-upload" }));

  it("is a design-system commit button that starts the upload", async () => {
    const wrapper = getWrapper();
    const button = wrapper.findComponent({ name: "BaseButtonNew" });

    expect(button.exists()).toBe(true);
    expect(button.props()).toMatchObject({
      label: "Upload",
      icon: DamsIcons.NoIcon,
      buttonStyle: "commit",
      disabled: false,
    });
    await button.trigger("click");
    expect(wrapper.emitted("clickUploadButton")).toHaveLength(1);
  });
});

describe("DynamicFormUploadButton - duplicate mediafiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setState({
      uploadStatus: "upload-finished",
      amountUploaded: 3,
      duplicateMediafiles: [{ link: true }, { link: false }],
    });
  });

  const complete = async () => {
    const wrapper = getWrapper();
    await wrapper
      .findAllComponents({ name: "BaseButtonNew" })
      .find((button) => button.props("icon") === "CheckCircle")!
      .trigger("click");
    await new Promise((resolve) => setTimeout(resolve));
    return wrapper;
  };

  it("tells how many existing mediafiles will be linked", () => {
    expect(status().text()).toBe(
      'upload-fields.uploaded-of {"done":3,"total":3} · upload-fields.duplicate.will-link {"count":1}',
    );
  });

  it("links the chosen duplicates before closing on Complete", async () => {
    state.linkDuplicateMediafiles.mockResolvedValue(1);
    const wrapper = await complete();

    expect(state.linkDuplicateMediafiles).toHaveBeenCalledTimes(1);
    expect(notifications.displaySuccessNotification).toHaveBeenCalled();
    expect(wrapper.emitted("closeAndDeleteForm")).toHaveLength(1);
  });

  it("stays open and reports when linking fails", async () => {
    state.linkDuplicateMediafiles.mockRejectedValue(new Error("nope"));
    const wrapper = await complete();

    expect(notifications.displayErrorNotification).toHaveBeenCalled();
    expect(wrapper.emitted("closeAndDeleteForm")).toBeUndefined();
  });
});
