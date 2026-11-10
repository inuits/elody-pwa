import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import PreviewHost from "@/components/previews/PreviewHost.vue";
import { isCompact } from "@/composables/useNavMenu";

vi.mock("@/composables/useNavMenu", async () => {
  const { ref } = await import("vue");
  return { isCompact: ref(false) };
});

const mountHost = () =>
  mount(PreviewHost, {
    slots: { default: '<div class="preview-stub" />' },
    attachTo: document.body,
  });

describe("PreviewHost", () => {
  afterEach(() => {
    isCompact.value = false;
    document.body.innerHTML = "";
  });

  it("renders the preview inline next to the list on a large screen", () => {
    const wrapper = mountHost();
    const host = wrapper.find('[data-cy="preview-host"]');

    expect(host.exists()).toBe(true);
    expect(host.attributes("role")).toBeUndefined();
    expect(host.classes()).toContain("rounded-card");
    expect(host.find(".preview-stub").exists()).toBe(true);
    wrapper.unmount();
  });

  it("covers the page as a modal dialog teleported to body on a small screen", () => {
    isCompact.value = true;
    const wrapper = mountHost();
    const host = document.body.querySelector<HTMLElement>(
      ':scope > [data-cy="preview-host"]',
    );

    expect(host).not.toBeNull();
    expect(host!.getAttribute("role")).toBe("dialog");
    expect(host!.getAttribute("aria-modal")).toBe("true");
    expect(host!.classList).toContain("fixed");
    expect(host!.querySelector(".preview-stub")).not.toBeNull();
    wrapper.unmount();
  });
});
