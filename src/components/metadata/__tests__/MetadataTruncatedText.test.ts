import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import MetadataTruncatedText from "@/components/metadata/MetadataTruncatedText.vue";

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];
  callback: ResizeObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ResizeObserverMock.instances.push(this);
  }

  trigger() {
    this.callback(
      [] as unknown as ResizeObserverEntry[],
      this as unknown as ResizeObserver,
    );
  }
}

const setElementHeights = (
  element: Element,
  heights: { clientHeight: number; scrollHeight: number },
) => {
  Object.defineProperty(element, "clientHeight", {
    configurable: true,
    value: heights.clientHeight,
  });
  Object.defineProperty(element, "scrollHeight", {
    configurable: true,
    value: heights.scrollHeight,
  });
};

const getDefaultProps = () => ({ lineClamp: 2, disabled: false });
const getWrapper = (props = getDefaultProps()) =>
  mount(MetadataTruncatedText, {
    props,
    slots: { default: "Some slotted text" },
  });

describe("MetadataTruncatedText", () => {
  beforeEach(() => {
    ResizeObserverMock.instances = [];
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders the slotted content", () => {
    const wrapper = getWrapper();
    expect(wrapper.text()).toBe("Some slotted text");
  });

  it("exposes lineClamp as a CSS custom property", () => {
    const wrapper = getWrapper({ lineClamp: 3, disabled: false });
    expect(wrapper.attributes("style")).toContain("--line-clamp: 3");
  });

  it("applies the line-clamp class when not disabled", () => {
    const wrapper = getWrapper({ lineClamp: 2, disabled: false });
    expect(wrapper.classes()).toContain("line-clamp");
  });

  it("does not apply the line-clamp class when disabled", () => {
    const wrapper = getWrapper({ lineClamp: 2, disabled: true });
    expect(wrapper.classes()).not.toContain("line-clamp");
  });

  it("observes the container with a ResizeObserver on mount", () => {
    const wrapper = getWrapper();
    expect(ResizeObserverMock.instances[0].observe).toHaveBeenCalledWith(
      wrapper.element,
    );
  });

  describe("wrapped chips", () => {
    const rect = (left: number, top: number, right: number) =>
      ({ left, top, right }) as DOMRect;
    const mountInRow = (chipRects: DOMRect[]) => {
      const row = document.createElement("div");
      document.body.appendChild(row);
      const wrapper = mount(MetadataTruncatedText, {
        props: getDefaultProps(),
        slots: {
          default: chipRects.map(() => "<span class='multiselect-tag'>x</span>").join(""),
        },
        attachTo: row,
      });
      const element = wrapper.element as HTMLElement;
      element.getBoundingClientRect = () => rect(100, 10, 400);
      element
        .querySelectorAll(".multiselect-tag")
        .forEach((chip, i) => ((chip as HTMLElement).getBoundingClientRect = () => chipRects[i]));
      const rowObserver = ResizeObserverMock.instances.find((observer) =>
        observer.observe.mock.calls.some(([target]) => target === element.parentElement),
      )!;
      rowObserver.trigger();
      return element;
    };

    it("hugs chips that wrap, so what follows the value sits next to them", () => {
      const element = mountInRow([rect(100, 10, 227), rect(100, 34, 231), rect(100, 58, 228)]);
      expect(element.style.width).toBe("131px");
    });

    it("leaves a value on one line at its natural width", () => {
      const element = mountInRow([rect(100, 10, 160), rect(164, 10, 230)]);
      expect(element.style.width).toBe("");
    });
  });

  it("disconnects the ResizeObserver on unmount", () => {
    const wrapper = getWrapper();
    const observer = ResizeObserverMock.instances[0];
    wrapper.unmount();
    expect(observer.disconnect).toHaveBeenCalledOnce();
  });

  describe("overflow detection", () => {
    it("emits overflow-status(true) when content is taller than the clamped box", () => {
      const wrapper = getWrapper({ lineClamp: 1, disabled: false });
      setElementHeights(wrapper.element, { clientHeight: 20, scrollHeight: 60 });

      ResizeObserverMock.instances[0].trigger();

      expect(wrapper.emitted("overflow-status")).toEqual([[true]]);
    });

    it("emits overflow-status(false) when content fits without clamping", () => {
      const wrapper = getWrapper({ lineClamp: 2, disabled: false });
      setElementHeights(wrapper.element, { clientHeight: 40, scrollHeight: 40 });

      ResizeObserverMock.instances[0].trigger();

      expect(wrapper.emitted("overflow-status")).toEqual([[false]]);
    });

    it("never reports overflow when disabled, even if content is taller than the box", () => {
      const wrapper = getWrapper({ lineClamp: 1, disabled: true });
      setElementHeights(wrapper.element, { clientHeight: 20, scrollHeight: 80 });

      ResizeObserverMock.instances[0].trigger();

      expect(wrapper.emitted("overflow-status")).toEqual([[false]]);
    });

    it("re-checks overflow when lineClamp changes", async () => {
      const wrapper = getWrapper({ lineClamp: 1, disabled: false });
      setElementHeights(wrapper.element, { clientHeight: 20, scrollHeight: 20 });
      ResizeObserverMock.instances[0].trigger();
      expect(wrapper.emitted("overflow-status")?.at(-1)).toEqual([false]);

      setElementHeights(wrapper.element, { clientHeight: 20, scrollHeight: 60 });
      await wrapper.setProps({ lineClamp: 3 });

      expect(wrapper.emitted("overflow-status")?.at(-1)).toEqual([true]);
    });

    it("re-checks overflow when disabled toggles off", async () => {
      const wrapper = getWrapper({ lineClamp: 1, disabled: true });
      setElementHeights(wrapper.element, { clientHeight: 20, scrollHeight: 80 });
      ResizeObserverMock.instances[0].trigger();
      expect(wrapper.emitted("overflow-status")?.at(-1)).toEqual([false]);

      await wrapper.setProps({ disabled: false });

      expect(wrapper.emitted("overflow-status")?.at(-1)).toEqual([true]);
    });
  });

  describe("regression: resize-observer feedback loop", () => {
    it("keeps the line-clamp class stable regardless of the overflow measurement result", () => {
      const wrapper = getWrapper({ lineClamp: 1, disabled: false });
      expect(wrapper.classes()).toContain("line-clamp");

      setElementHeights(wrapper.element, { clientHeight: 20, scrollHeight: 80 });
      ResizeObserverMock.instances[0].trigger();

      expect(wrapper.classes()).toContain("line-clamp");
    });

    it("produces the same overflow-status on repeated triggers with unchanged measurements", () => {
      const wrapper = getWrapper({ lineClamp: 1, disabled: false });
      setElementHeights(wrapper.element, { clientHeight: 20, scrollHeight: 40 });

      ResizeObserverMock.instances[0].trigger();
      ResizeObserverMock.instances[0].trigger();
      ResizeObserverMock.instances[0].trigger();

      const emitted = wrapper.emitted("overflow-status") ?? [];
      expect(emitted).toEqual([[true], [true], [true]]);
    });
  });
});
