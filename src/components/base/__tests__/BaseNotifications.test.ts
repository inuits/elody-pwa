import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import { notify } from "@kyvg/vue3-notification";
import BaseNotifications from "@/components/base/BaseNotifications.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => true }),
}));

let wrapper: VueWrapper | undefined;
const mountHost = (attrs: Record<string, unknown> = {}) => {
  wrapper = mount(BaseNotifications, {
    attrs,
    global: { stubs: { unicon: true } },
  });
  return wrapper;
};

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe("BaseNotifications", () => {
  it("is a polite live region, so success and warning toasts are read out", () => {
    const host = mountHost();
    expect(host.attributes("aria-live")).toBe("polite");
  });

  it("announces an error toast straight away", async () => {
    const host = mountHost();
    notify({ title: "Saving failed", text: "Try again", type: "error" });
    await flushPromises();

    const toast = host.find('[data-cy="notification"]');
    expect(toast.attributes("role")).toBe("alert");
    expect(toast.text()).toContain("Saving failed");
    expect(toast.text()).toContain("Try again");
  });

  it("does not mark a success toast as an alert", async () => {
    const host = mountHost();
    notify({ title: "Saved", text: "", type: "success" });
    await flushPromises();
    expect(
      host.find('[data-cy="notification"]').attributes("role"),
    ).toBeUndefined();
  });

  it("shows title and text as text, never as markup", async () => {
    const host = mountHost();
    notify({ title: "<b>x</b>", text: "<img src=x>", type: "error" });
    await flushPromises();
    const toast = host.find('[data-cy="notification"]');
    expect(toast.find("img").exists()).toBe(false);
    expect(toast.text()).toContain("<img src=x>");
  });

  it("can be closed with a named button", async () => {
    const host = mountHost();
    notify({ title: "Saved", text: "", type: "success", duration: -1 });
    await flushPromises();

    const close = host.find('[data-cy="notification-close"]');
    expect(close.element.tagName).toBe("BUTTON");
    expect(close.attributes("aria-label")).toBe("actions.labels.close");
    await close.trigger("click");
    await flushPromises();
    expect(host.find('[data-cy="notification"]').exists()).toBe(false);
  });

  it("does not pass the close click on to a clickable group", async () => {
    const onClick = vi.fn();
    const host = mountHost({ onClick });
    notify({ title: "New version", text: "", duration: -1 });
    await flushPromises();
    await host.find('[data-cy="notification-close"]').trigger("click");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("pauses while hovered", () => {
    const lib = mountHost().findComponent({ name: "Notifications" });
    expect(lib.props("pauseOnHover")).toBe(true);
  });
});
