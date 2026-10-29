import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import Attribution from "ol/control/Attribution";
import MapChrome from "../MapChrome.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const makeMap = () => {
  const view = { getZoom: vi.fn(() => 5), animate: vi.fn() };
  const target = document.createElement("div");
  target.requestFullscreen = vi.fn(() => Promise.resolve());
  return {
    view,
    target,
    getView: () => view,
    addControl: vi.fn(),
    removeControl: vi.fn(),
    getTargetElement: () => target,
  };
};

const getWrapper = (map = makeMap(), props = {}) =>
  mount(MapChrome, {
    props,
    global: { provide: { map }, stubs: { unicon: true } },
  });

describe("MapChrome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders named zoom buttons", () => {
    const names = getWrapper()
      .findAll("button")
      .map((b) => b.attributes("aria-label"));
    expect(names).toEqual(["media-viewer.zoom-in", "media-viewer.zoom-out"]);
  });

  it("zooms the map in and out by one level", async () => {
    const map = makeMap();
    const wrapper = getWrapper(map);
    await wrapper.find('[aria-label="media-viewer.zoom-in"]').trigger("click");
    await wrapper.find('[aria-label="media-viewer.zoom-out"]').trigger("click");
    expect(map.view.animate.mock.calls.map(([o]) => o.zoom)).toEqual([6, 4]);
  });

  it("adds an attribution that never collapses", () => {
    const map = makeMap();
    getWrapper(map);
    const control = map.addControl.mock.calls[0][0];
    expect(control).toBeInstanceOf(Attribution);
    expect(control.getCollapsible()).toBe(false);
  });

  it("offers a named fullscreen button when asked", async () => {
    const map = makeMap();
    const wrapper = getWrapper(map, { fullscreen: true });
    await wrapper
      .find('[aria-label="media-viewer.fullscreen"]')
      .trigger("click");
    expect(map.target.requestFullscreen).toHaveBeenCalledOnce();
  });
});
