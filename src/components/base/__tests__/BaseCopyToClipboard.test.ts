import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

const mocks = vi.hoisted(() => ({
  copy: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("clipboard", () => ({ default: { copy: mocks.copy } }));
vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => ({
    displaySuccessNotification: mocks.success,
    displayErrorNotification: mocks.error,
  }),
}));

import BaseCopyToClipboard from "@/components/base/BaseCopyToClipboard.vue";
import { SAVED_FLASH_MS } from "@/composables/useSavedFlash";

const mountCopy = (value: unknown = "PR-000001") =>
  mount(BaseCopyToClipboard, {
    props: { value },
    global: { stubs: { unicon: true } },
  });

describe("BaseCopyToClipboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("is a real button named for what it does", () => {
    const button = mountCopy().find("button");
    expect(button.attributes("type")).toBe("button");
    expect(button.attributes("aria-label")).toBe("Copy");
  });

  it("copies the value and says so in a status, without a toast", async () => {
    const wrapper = mountCopy();
    await wrapper.find("button").trigger("click");
    expect(mocks.copy).toHaveBeenCalledWith("PR-000001");
    expect(wrapper.find('[role="status"]').text()).toBe("Copied");
    expect(wrapper.attributes("data-copied")).toBeDefined();
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it("clears the status after 2s", async () => {
    const wrapper = mountCopy();
    await wrapper.find("button").trigger("click");
    vi.advanceTimersByTime(SAVED_FLASH_MS);
    await flushPromises();
    expect(wrapper.find('[role="status"]').text()).toBe("");
    expect(wrapper.attributes("data-copied")).toBeUndefined();
  });

  it("copies coordinates as 'latitude, longitude'", async () => {
    const wrapper = mountCopy({ latitude: 51.05, longitude: 3.72 });
    await wrapper.find("button").trigger("click");
    expect(mocks.copy).toHaveBeenCalledWith("51.05, 3.72");
  });

  it("copies a value that arrived after mounting", async () => {
    const wrapper = mountCopy(undefined);
    await wrapper.setProps({ value: "later" });
    await wrapper.find("button").trigger("click");
    expect(mocks.copy).toHaveBeenCalledWith("later");
  });

  it("shows an error toast when copying fails", async () => {
    mocks.copy.mockImplementation(() => {
      throw new Error("denied");
    });
    const wrapper = mountCopy();
    await wrapper.find("button").trigger("click");
    expect(mocks.error).toHaveBeenCalled();
    expect(wrapper.find('[role="status"]').text()).toBe("");
  });
});
