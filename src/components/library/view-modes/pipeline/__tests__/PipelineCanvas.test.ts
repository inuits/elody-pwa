import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import PipelineCanvas from "../PipelineCanvas.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const VIEWPORT = { width: 600, height: 400 };

const transformOf = (wrapper: ReturnType<typeof mount>) => {
  const style = wrapper
    .find('[data-cy="pipeline-canvas"] > div')
    .attributes("style")!;
  const [, x, y, zoom] =
    /translate\((-?[\d.]+)px, (-?[\d.]+)px\) scale\(([\d.]+)\)/.exec(style)!;
  return { x: Number(x), y: Number(y), zoom: Number(zoom) };
};

const mountCanvas = async (props: Record<string, unknown>) => {
  const wrapper = mount(PipelineCanvas, {
    props: { edges: [], ...props },
    attachTo: document.body,
  });
  await nextTick();
  return wrapper;
};

describe("PipelineCanvas initial fit", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(
      VIEWPORT.width,
    );
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(
      VIEWPORT.height,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("centres content that fits the viewport", async () => {
    const wrapper = await mountCanvas({
      contentWidth: 500,
      contentHeight: 200,
    });

    const { x, y, zoom } = transformOf(wrapper);
    expect(zoom).toBe(1);
    expect(x).toBe((VIEWPORT.width - 500) / 2);
    expect(y).toBe((VIEWPORT.height - 200) / 2);
  });

  it("brings the focus point into view when the content is taller than the viewport", async () => {
    const focus = { x: 40, y: 9000 };
    const wrapper = await mountCanvas({
      contentWidth: 500,
      contentHeight: 20000,
      focus,
    });

    const { y, zoom } = transformOf(wrapper);
    const focusOnScreen = y + focus.y * zoom;
    expect(focusOnScreen).toBeGreaterThanOrEqual(0);
    expect(focusOnScreen).toBeLessThanOrEqual(VIEWPORT.height);
  });

  it("never scrolls past the top of the content to reach the focus", async () => {
    const wrapper = await mountCanvas({
      contentWidth: 500,
      contentHeight: 20000,
      focus: { x: 40, y: 10 },
    });

    expect(transformOf(wrapper).y).toBe(0);
  });

  it("starts at the top without a focus point", async () => {
    const wrapper = await mountCanvas({
      contentWidth: 500,
      contentHeight: 20000,
    });

    expect(transformOf(wrapper).y).toBe(0);
  });
});
