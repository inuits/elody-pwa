import { mount } from "@vue/test-utils";
import EntityElementMetadata from "../EntityElementMetadata.vue";
import { nextTick } from "vue";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { stringIsUrl, stringIsHtml } from "@/helpers";

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

describe("XSS Security", () => {
  describe("Link Sanitization (v-html on links)", () => {
    it("should sanitize XSS in the text of a URL value", async () => {
      stringIsUrl.mockReturnValue(true);

      const maliciousUrl =
        'https://example.com/"><script>alert("XSS")</script>';
      const wrapper = mount(EntityElementMetadata, {
        props: { value: maliciousUrl },
      });
      await nextTick();

      const link = wrapper.find("a[data-cy='metadata-value']");
      expect(link.exists()).toBe(true);
      expect(link.html()).not.toContain("<script>");
      expect(link.attributes("href")).not.toContain("<script>");
    });

    it("should sanitize XSS in link text from the linkText prop", async () => {
      stringIsUrl.mockReturnValue(true);
      const maliciousLinkText = "Click me<img src=x onerror=alert(1)>";
      mocks.t.mockReturnValue(maliciousLinkText);

      const wrapper = mount(EntityElementMetadata, {
        props: { value: "http://safe.url", linkText: "some_key" },
      });
      await nextTick();

      const link = wrapper.find("a[data-cy='metadata-value']");
      expect(link.exists()).toBe(true);
      expect(link.html()).not.toContain("onerror");
      expect(link.html()).toContain('Click me<img src="x">');
    });
  });

  describe("HTML Value Sanitization (v-html on paragraphs)", () => {
    it("should sanitize a simple XSS payload in a value treated as HTML", async () => {
      stringIsHtml.mockReturnValue(true);

      const maliciousHtml =
        "<b>Some bold text</b><script>alert('uh oh')</script>";
      const wrapper = mount(EntityElementMetadata, {
        props: { value: maliciousHtml },
      });
      await nextTick();

      const content = wrapper.find("p[data-cy='metadata-value']");
      expect(content.exists()).toBe(true);
      expect(content.html()).toContain("<b>Some bold text</b>");
      expect(content.html()).not.toContain("<script>");
    });

    it("should sanitize malicious HTML coming from a translation", async () => {
      stringIsHtml.mockReturnValue(true);
      const maliciousTranslation =
        "Translated value: <iframe src='javascript:alert(1)'></iframe>";
      mocks.t.mockReturnValue(maliciousTranslation);

      const wrapper = mount(EntityElementMetadata, {
        props: { value: "some value", translationKey: "key_with_$value" },
      });
      await nextTick();

      const content = wrapper.find("p[data-cy='metadata-value']");
      expect(content.html()).not.toContain("iframe");
      expect(content.html()).toContain("Translated value:");
    });
  });
});
