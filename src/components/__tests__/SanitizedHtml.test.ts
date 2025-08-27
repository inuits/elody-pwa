import { mount } from "@vue/test-utils";
import SanitizedHtml from "../SanitizedHtml.vue";
import { nextTick } from "vue";
import { describe, it, expect, vi } from "vitest";
import { stringIsUrl, stringIsHtml } from "@/helpers";
import { SanitizeMode } from "@/__mocks__/queries";

vi.mock(import("@/helpers"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    convertUnitToReadbleFormat: vi
      .fn()
      .mockImplementation((_unit, value) => value ?? ""),
    stringIsUrl: vi.fn(),
    stringIsHtml: vi.fn(),
    processTextWithLinks: vi.fn().mockImplementation((text) => text),
  };
});

const mocks = vi.hoisted(() => {
  return {
    t: vi.fn(),
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: mocks.t,
  }),
}));

describe("XSS Security", () => {
  describe("Link Sanitization (v-html on links)", () => {
    it("should sanitize XSS in the text of a URL value", async () => {
      stringIsUrl.mockReturnValue(true);

      const maliciousUrl =
        'https://example.com/"><script>alert("XSS")</script>';
      const wrapper = mount(SanitizedHtml, {
        props: { content: maliciousUrl },
      });
      await nextTick();

      const link = wrapper.find("[data-cy='sanitized-value']");
      expect(link.exists()).toBe(true);
      expect(link.html()).not.toContain("<script>");
    });

    it("should sanitize XSS in link text from the linkText prop", async () => {
      stringIsUrl.mockReturnValue(true);
      const maliciousLinkText = "Click me<img src=x onerror=alert(1)>";
      mocks.t.mockReturnValue(maliciousLinkText);

      const wrapper = mount(SanitizedHtml, {
        props: { content: "http://safe.url", linkText: "some_key" },
      });
      await nextTick();

      const link = wrapper.find("[data-cy='sanitized-value']");
      expect(link.exists()).toBe(true);
      expect(link.html()).not.toContain("onerror");
      expect(link.html()).toContain(
        '<a data-cy="sanitized-value" href="http://safe.url">some_key</a>',
      );
    });
  });

  describe("HTML Value Sanitization (v-html on paragraphs)", () => {
    it("should sanitize a simple XSS payload in a value treated as HTML", async () => {
      stringIsHtml.mockReturnValue(true);

      const maliciousHtml =
        "<b>Some bold text</b><script>alert('uh oh')</script>";
      const wrapper = mount(SanitizedHtml, {
        props: { content: maliciousHtml, mode: SanitizeMode.Html },
      });
      await nextTick();

      const content = wrapper.find("[data-cy='sanitized-value']");
      expect(content.exists()).toBe(true);
      expect(content.html()).toContain("<b>Some bold text</b>");
      expect(content.html()).not.toContain("<script>");
    });
  });
});
