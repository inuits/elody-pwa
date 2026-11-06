import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MetadataFormatterLink from "../MetadataFormatterLink.vue";

const mocks = vi.hoisted(() => ({
  isScoped: true,
  navigate: vi.fn(),
  resolveTarget: vi.fn(),
  requiresAuth: false,
}));

vi.mock("@/composables/useScopedEntityNavigation", () => ({
  useScopedEntityNavigation: () => ({
    isScoped: mocks.isScoped,
    navigate: mocks.navigate,
    resolveTarget: mocks.resolveTarget,
  }),
}));

vi.mock("@/main", () => ({ formattersSettings: { link: {} } }));

vi.mock("@/helpers", () => ({
  getChildrenOfHomeRoutes: () => [],
  requiresAuthForEntity: () => mocks.requiresAuth,
}));

const mountLink = (props: Partial<Record<string, unknown>> = {}) =>
  mount(MetadataFormatterLink, {
    props: {
      formatter: "link|work",
      label: "De Witte",
      link: "/work/W-1",
      type: "work",
      openInNewTab: false,
      ...props,
    },
    global: { provide: { config: {} }, stubs: { unicon: true } },
  });

const click = async (
  wrapper: ReturnType<typeof mountLink>,
  init: MouseEventInit = {},
) => {
  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    ...init,
  });
  wrapper.element.dispatchEvent(event);
  return event;
};

describe("MetadataFormatterLink inside an entity navigation scope", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isScoped = true;
    mocks.requiresAuth = false;
    mocks.resolveTarget.mockReturnValue({ id: "W-1", type: "work" });
  });

  it("navigates the scope instead of loading the page", async () => {
    const event = await click(mountLink());

    expect(event.defaultPrevented).toBe(true);
    expect(mocks.navigate).toHaveBeenCalledWith("/work/W-1");
  });

  it("keeps the browser link outside a scope", async () => {
    mocks.isScoped = false;
    const event = await click(mountLink());

    expect(event.defaultPrevented).toBe(false);
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("keeps opening links configured for a new tab", async () => {
    const event = await click(mountLink({ openInNewTab: true }));

    expect(event.defaultPrevented).toBe(false);
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it.each([{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }])(
    "leaves a modified click (%o) to the browser",
    async (init) => {
      const event = await click(mountLink(), init);

      expect(event.defaultPrevented).toBe(false);
      expect(mocks.navigate).not.toHaveBeenCalled();
    },
  );

  it("leaves a link that is not an entity page to the browser", async () => {
    mocks.resolveTarget.mockReturnValue(undefined);
    const event = await click(mountLink({ link: "/iiif/X/manifest/2" }));

    expect(event.defaultPrevented).toBe(false);
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("does nothing for a link the viewer may not open", async () => {
    mocks.requiresAuth = true;
    await click(mountLink());

    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
