import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import WysiwygVirtualKeyboard from "../WYSIWYG/WYSIGYGVirtualKeyboard.vue";
import BaseVirtualKeyboard from "@/components/base/BaseVirtualKeyboard.vue";
import type { Editor } from "@tiptap/vue-3";

vi.mock("@/components/base/BaseVirtualKeyboard.vue", () => ({
  default: {
    template: "<div />",
    props: ["input", "keyboardClass", "layouts"],
    emits: ["onKeyPress", "isOpen"],
  },
}));

const createMockEditor = (): Editor =>
  ({
    getText: vi.fn(() => ""),
    chain: vi.fn(() => mockEditor),
    focus: vi.fn(() => mockEditor),
    deleteSelection: vi.fn(() => mockEditor),
    deleteRange: vi.fn(() => mockEditor),
    insertContent: vi.fn(() => mockEditor),
    run: vi.fn(),
    state: {
      selection: {
        from: 10,
      },
    },
  }) as unknown as Editor;

let mockEditor: Editor;

describe("WysiwygVirtualKeyboard", () => {
  const defaultProps = {
    editor: null as unknown as Editor,
    keyboardClass: "custom-keyboard",
    extraLayouts: {
      default: ["1 2 3", "4 5 6"],
      shift: ["! @ #", "$ % ^"],
    },
  };

  beforeEach(() => {
    mockEditor = createMockEditor();
    defaultProps.editor = mockEditor;
    vi.clearAllMocks();
  });

  it("renders the BaseVirtualKeyboard component with correct props", () => {
    const wrapper = mount(WysiwygVirtualKeyboard, {
      props: defaultProps,
    });

    const keyboard = wrapper.findComponent(BaseVirtualKeyboard);
    expect(keyboard.exists()).toBe(true);
    expect(keyboard.props("input")).toBe("");
    expect(keyboard.props("keyboardClass")).toBe("custom-keyboard");
    expect(keyboard.props("layouts")).toEqual(defaultProps.extraLayouts);
  });

  describe("handleKeyPress", () => {
    it("does nothing if editor is not provided", async () => {
      const wrapper = mount(WysiwygVirtualKeyboard, {
        props: {
          ...defaultProps,
          editor: null,
        },
      });

      await wrapper.vm.handleKeyPress("a");
      expect(mockEditor.chain).not.toHaveBeenCalled();
    });

    it("handles backspace key correctly", async () => {
      const wrapper = mount(WysiwygVirtualKeyboard, {
        props: defaultProps,
      });

      await wrapper.vm.handleKeyPress("{bksp}");

      expect(mockEditor.chain).toHaveBeenCalled();
      expect(mockEditor.deleteSelection).toHaveBeenCalled();
      expect(mockEditor.deleteRange).toHaveBeenCalledWith({
        from: 9,
        to: 10,
      });
      expect(mockEditor.run).toHaveBeenCalled();
    });

    it("handles enter key correctly", async () => {
      const wrapper = mount(WysiwygVirtualKeyboard, {
        props: defaultProps,
      });

      await wrapper.vm.handleKeyPress("{enter}");

      expect(mockEditor.chain).toHaveBeenCalled();
      expect(mockEditor.insertContent).toHaveBeenCalledWith("\n");
      expect(mockEditor.run).toHaveBeenCalled();
    });

    it("handles space key correctly", async () => {
      const wrapper = mount(WysiwygVirtualKeyboard, {
        props: defaultProps,
      });

      await wrapper.vm.handleKeyPress("{space}");

      expect(mockEditor.chain).toHaveBeenCalled();
      expect(mockEditor.insertContent).toHaveBeenCalledWith(" ");
      expect(mockEditor.run).toHaveBeenCalled();
    });

    it("handles tab key correctly", async () => {
      const wrapper = mount(WysiwygVirtualKeyboard, {
        props: defaultProps,
      });

      await wrapper.vm.handleKeyPress("{tab}");

      expect(mockEditor.chain).toHaveBeenCalled();
      expect(mockEditor.insertContent).toHaveBeenCalledWith("\t");
      expect(mockEditor.run).toHaveBeenCalled();
    });

    it("ignores unknown control keys", async () => {
      const wrapper = mount(WysiwygVirtualKeyboard, {
        props: defaultProps,
      });

      await wrapper.vm.handleKeyPress("{unknown}");

      expect(mockEditor.chain).not.toHaveBeenCalled();
      expect(mockEditor.insertContent).not.toHaveBeenCalled();
    });

    it("inserts regular characters directly", async () => {
      const wrapper = mount(WysiwygVirtualKeyboard, {
        props: defaultProps,
      });

      await wrapper.vm.handleKeyPress("a");

      expect(mockEditor.chain).toHaveBeenCalled();
      expect(mockEditor.insertContent).toHaveBeenCalledWith("a");
      expect(mockEditor.run).toHaveBeenCalled();
    });
  });

  describe("handleFocus", () => {
    it("does nothing if keyboard is not open", async () => {
      const wrapper = mount(WysiwygVirtualKeyboard, {
        props: defaultProps,
      });

      await wrapper.vm.handleFocus(false);
      expect(mockEditor.chain).not.toHaveBeenCalled();
    });

    it("focuses editor at end when keyboard opens", async () => {
      const wrapper = mount(WysiwygVirtualKeyboard, {
        props: defaultProps,
      });

      await wrapper.vm.handleFocus(true);
      expect(mockEditor.chain).toHaveBeenCalled();
      expect(mockEditor.focus).toHaveBeenCalledWith("end");
      expect(mockEditor.run).toHaveBeenCalled();
    });
  });
});
