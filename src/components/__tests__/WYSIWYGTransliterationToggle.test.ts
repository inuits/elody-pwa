import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import WYSIWYGTransliterationToggle from "../entityElements/WYSIWYG/WYSIWYGTransliterationToggle.vue";

const LATIN_TO_ARABIC: Record<string, string> = { b: "ب", s: "س" };
const ARABIC_TO_LATIN: Record<string, string> = { ب: "b", س: "s" };

const makeConfig = () => {
  return {
    latin: { label: "Latin", mapping: ARABIC_TO_LATIN },
    arabic: { label: "Arabic", mapping: LATIN_TO_ARABIC },
  };
};

const makeEditor = (html = "<p>bs</p>") => {
  return {
    getHTML: vi.fn().mockReturnValue(html),
    commands: { setContent: vi.fn() },
  };
};

describe("WYSIWYGTransliterationToggle", () => {
  describe("rendering", () => {
    it("renders nothing when transliterationConfig is null", () => {
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: { editor: makeEditor(), transliterationConfig: null },
      });
      expect(wrapper.find("div").exists()).toBe(false);
    });

    it("renders nothing when transliterationConfig is undefined", () => {
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: { editor: makeEditor(), transliterationConfig: undefined },
      });
      expect(wrapper.find("div").exists()).toBe(false);
    });

    it("renders one button per config item", () => {
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: { editor: makeEditor(), transliterationConfig: makeConfig() },
      });
      expect(wrapper.findAll("button")).toHaveLength(2);
    });

    it("filters out __typename and renders only data items", () => {
      const configWithTypename = {
        ...makeConfig(),
        __typename: "WysiwygTransliterationConfig",
      };
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: {
          editor: makeEditor(),
          transliterationConfig: configWithTypename,
        },
      });
      expect(wrapper.findAll("button")).toHaveLength(2);
    });

    it("renders buttons with labels from config", () => {
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: { editor: makeEditor(), transliterationConfig: makeConfig() },
      });
      const buttons = wrapper.findAll("button");
      expect(buttons[0].text()).toBe("Latin");
      expect(buttons[1].text()).toBe("Arabic");
    });

    it("adds a left border only to buttons after the first", () => {
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: { editor: makeEditor(), transliterationConfig: makeConfig() },
      });
      const [first, second] = wrapper.findAll("button");
      expect(first.classes()).not.toContain("border-l");
      expect(second.classes()).toContain("border-l");
    });
  });

  describe("default state", () => {
    it("no button is highlighted on mount", () => {
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: { editor: makeEditor(), transliterationConfig: makeConfig() },
      });
      for (const button of wrapper.findAll("button")) {
        expect(button.classes()).not.toContain("bg-accent-normal");
      }
    });

    it("captures original content from editor on mount", () => {
      const editor = makeEditor("<p>original</p>");
      mount(WYSIWYGTransliterationToggle, {
        props: { editor, transliterationConfig: makeConfig() },
      });
      expect(editor.getHTML).toHaveBeenCalledOnce();
    });

    it("does not call setContent on mount", () => {
      const editor = makeEditor();
      mount(WYSIWYGTransliterationToggle, {
        props: { editor, transliterationConfig: makeConfig() },
      });
      expect(editor.commands.setContent).not.toHaveBeenCalled();
    });
  });

  describe("button interaction", () => {
    it("highlights the clicked button", async () => {
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: { editor: makeEditor(), transliterationConfig: makeConfig() },
      });
      const [, arabicBtn] = wrapper.findAll("button");
      await arabicBtn.trigger("click");
      expect(arabicBtn.classes()).toContain("bg-accent-normal");
    });

    it("removes the active style from the previously clicked button", async () => {
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: { editor: makeEditor(), transliterationConfig: makeConfig() },
      });
      const [latinBtn, arabicBtn] = wrapper.findAll("button");
      await arabicBtn.trigger("click");
      await latinBtn.trigger("click");
      expect(arabicBtn.classes()).not.toContain("bg-accent-normal");
      expect(latinBtn.classes()).toContain("bg-accent-normal");
    });

    it("calls setContent with transliterated HTML when a button with a mapping is clicked", async () => {
      const editor = makeEditor("<p>bs</p>");
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: { editor, transliterationConfig: makeConfig() },
      });
      const [, arabicBtn] = wrapper.findAll("button");
      await arabicBtn.trigger("click");
      await nextTick();
      expect(editor.commands.setContent).toHaveBeenCalledWith("<p>بس</p>");
    });

    it("always applies the mapping to the original captured content, not the current editor state", async () => {
      const editor = makeEditor("<p>bs</p>");
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: { editor, transliterationConfig: makeConfig() },
      });
      const [latinBtn, arabicBtn] = wrapper.findAll("button");
      await arabicBtn.trigger("click");
      await nextTick();
      await latinBtn.trigger("click");
      await nextTick();
      await arabicBtn.trigger("click");
      await nextTick();
      const calls = editor.commands.setContent.mock.calls;
      expect(calls[calls.length - 1][0]).toBe("<p>بس</p>");
    });

    it("calls setContent with original content when a button has no mapping", async () => {
      const originalHtml = "<p>bs</p>";
      const editor = makeEditor(originalHtml);
      const config = {
        nomap: { label: "No Map", mapping: null },
        arabic: { label: "Arabic", mapping: LATIN_TO_ARABIC },
      };
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: { editor, transliterationConfig: config },
      });
      const [nomapBtn, arabicBtn] = wrapper.findAll("button");
      await arabicBtn.trigger("click");
      await nextTick();
      await nomapBtn.trigger("click");
      await nextTick();
      const calls = editor.commands.setContent.mock.calls;
      expect(calls[calls.length - 1][0]).toBe(originalHtml);
    });
  });

  describe("cleanup on unmount", () => {
    it("restores original content on unmount when a key was active", async () => {
      const originalHtml = "<p>bs</p>";
      const editor = makeEditor(originalHtml);
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: { editor, transliterationConfig: makeConfig() },
      });
      const [, arabicBtn] = wrapper.findAll("button");
      await arabicBtn.trigger("click");
      await nextTick();
      editor.commands.setContent.mockClear();
      wrapper.unmount();
      expect(editor.commands.setContent).toHaveBeenCalledWith(originalHtml);
    });

    it("does not call setContent on unmount when no key was active", () => {
      const editor = makeEditor();
      const wrapper = mount(WYSIWYGTransliterationToggle, {
        props: { editor, transliterationConfig: makeConfig() },
      });
      wrapper.unmount();
      expect(editor.commands.setContent).not.toHaveBeenCalled();
    });
  });
});
