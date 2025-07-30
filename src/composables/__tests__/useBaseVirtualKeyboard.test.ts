import { defineComponent } from "vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { useVirtualKeyboard } from "../useBaseVirtualKeyboard";
import Keyboard from "simple-keyboard";

let mockLayouts = {};
const mockKeyboardInstance = {
  setInput: vi.fn(),
  setOptions: vi.fn((options) => {
    if (options.layout) mockLayouts = options.layout;
  }),
  options: {
    layoutName: "default",
    get layout() {
      return mockLayouts;
    },
  },
};

vi.mock("simple-keyboard", () => ({
  default: vi.fn(() => mockKeyboardInstance),
}));

beforeEach(() => {
  mockLayouts = {};
  vi.clearAllMocks();
  mockKeyboardInstance.setInput.mockClear();
  mockKeyboardInstance.setOptions.mockClear();
  mockKeyboardInstance.options.layoutName = "default";
});

describe("useVirtualKeyboard", () => {
  const mockEmit = vi.fn();
  const keyboardClass = "test-keyboard";
  const defaultProps = {
    input: "",
    layouts: {},
  };

  const createTestComponent = (props = defaultProps) => {
    return defineComponent({
      template: "<div></div>",
      setup() {
        return useVirtualKeyboard(props, mockEmit, keyboardClass);
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockKeyboardInstance.setInput.mockClear();
    mockKeyboardInstance.setOptions.mockClear();
    mockEmit.mockClear();
  });

  it("should initialize keyboard on mount", async () => {
    const wrapper = mount(createTestComponent());
    await wrapper.vm.$nextTick();

    expect(Keyboard).toHaveBeenCalled();
    expect(mockKeyboardInstance.setInput).toHaveBeenCalledWith("");
  });

  it("uses default English layout when no layouts are provided", async () => {
    const wrapper = mount(createTestComponent());
    await wrapper.vm.$nextTick();

    expect(Keyboard).toHaveBeenCalledWith(
      `.${keyboardClass}`,
      expect.objectContaining({
        layout: expect.objectContaining({
          default: expect.arrayContaining([
            expect.stringContaining("q w e r t y u i o p"),
          ]),
          shift: expect.arrayContaining([
            expect.stringContaining("Q W E R T Y U I O P"),
          ]),
        }),
      }),
    );
    expect(wrapper.vm.isOpen).toBe(false);
  });

  it("adds language switch and close buttons when multiple layouts exist", async () => {
    const customLayouts = {
      fr: { default: ["a b c"], shift: ["A B C"] },
      de: { default: ["a b c"], shift: ["A B C"] },
    };

    const wrapper = mount(
      createTestComponent({
        ...defaultProps,
        layouts: customLayouts,
      }),
    );
    await wrapper.vm.$nextTick();

    expect(Keyboard).toHaveBeenCalledWith(
      `.${keyboardClass}`,
      expect.objectContaining({
        layout: {
          default: expect.arrayContaining(["{fr} {de} {English} {close}"]),
          shift: expect.arrayContaining(["{fr} {de} {English} {close}"]),
        },
      }),
    );
  });

  it("toggles keyboard visibility", async () => {
    const wrapper = mount(createTestComponent());
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isOpen).toBe(false);
    wrapper.vm.toggleKeyboard();
    expect(wrapper.vm.isOpen).toBe(true);
    wrapper.vm.toggleKeyboard();
    expect(wrapper.vm.isOpen).toBe(false);
  });

  it("emits onChange event when keyboard input changes", async () => {
    const wrapper = mount(createTestComponent());
    await wrapper.vm.$nextTick();

    const testInput = "test input";
    wrapper.vm.onChange(testInput);
    expect(mockEmit).toHaveBeenCalledWith("onChange", testInput);
  });

  it("handles language switch when language button is pressed", async () => {
    const customLayouts = {
      en: { default: ["a b c"], shift: ["A B C"] },
      fr: { default: ["d e f"], shift: ["D E F"] },
    };

    const wrapper = mount(
      createTestComponent({
        ...defaultProps,
        layouts: customLayouts,
      }),
    );
    await wrapper.vm.$nextTick();

    wrapper.vm.onKeyPress("{fr}");

    expect(mockKeyboardInstance.setOptions).toHaveBeenCalledWith({
      layout: expect.objectContaining({
        default: expect.arrayContaining(customLayouts.fr.default),
        shift: expect.arrayContaining(customLayouts.fr.shift),
      }),
      layoutName: "default",
    });
  });

  it("handles shift key press", async () => {
    const wrapper = mount(createTestComponent());
    await wrapper.vm.$nextTick();

    wrapper.vm.onKeyPress("{shift}");
    expect(mockKeyboardInstance.setOptions).toHaveBeenCalledWith({
      layoutName: "shift",
    });

    mockKeyboardInstance.options.layoutName = "shift";

    wrapper.vm.onKeyPress("{shift}");
    expect(mockKeyboardInstance.setOptions).toHaveBeenCalledWith({
      layoutName: "default",
    });
  });

  it("closes keyboard when close button is pressed", async () => {
    const wrapper = mount(createTestComponent());
    await wrapper.vm.$nextTick();

    wrapper.vm.isOpen = true;
    wrapper.vm.onKeyPress("{close}");
    expect(wrapper.vm.isOpen).toBe(false);
  });

  it("emits onKeyPress event for regular buttons", async () => {
    const wrapper = mount(createTestComponent());
    await wrapper.vm.$nextTick();

    wrapper.vm.onKeyPress("a");
    expect(mockEmit).toHaveBeenCalledWith("onKeyPress", "a");
  });

  it("adds language buttons prefix when multiple layouts are provided", async () => {
    const customLayouts = {
      en: { default: ["a b c"], shift: ["A B C"] },
      fr: { default: ["a b c"], shift: ["A B C"] },
    };

    const wrapper = mount(
      createTestComponent({
        ...defaultProps,
        layouts: customLayouts,
      }),
    );
    await wrapper.vm.$nextTick();

    wrapper.vm.onKeyPress("{en}");
    expect(mockKeyboardInstance.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: expect.objectContaining({
          default: expect.arrayContaining([
            expect.stringContaining("{en} {fr}"),
          ]),
        }),
      }),
    );
  });

  it("uses default display values", async () => {
    const wrapper = mount(createTestComponent());
    await wrapper.vm.$nextTick();

    wrapper.vm.onKeyPress("{enter}");
    expect(mockEmit).toHaveBeenCalledWith("onKeyPress", "{enter}");
  });
});
