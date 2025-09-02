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

describe("Display a link or show html content", () => {
  it("Should display a link with as innercontent the link itself", async () => {
    const content = "https://example.com/";
    const wrapper = mount(SanitizedHtml, {
      props: { content: content },
    });
    await nextTick();

    const link = wrapper.find("[data-cy='sanitized-value']");
    expect(link.exists()).toBe(true);
    expect(link.html()).toContain(
      '<a class="underline" data-cy="sanitized-value" href="https://example.com/" target="_blank">https://example.com/</a>',
    );
  });

  it("Should display a link with as innercontent an alternative link text", async () => {
    const content = "https://example.com/";
    const linkText = "example.com";
    const wrapper = mount(SanitizedHtml, {
      props: { content: content, linkText: linkText },
    });
    await nextTick();

    const link = wrapper.find("[data-cy='sanitized-value']");
    expect(link.exists()).toBe(true);
    expect(link.html()).toContain(
      '<a class="underline" data-cy="sanitized-value" href="https://example.com/" target="_blank">example.com</a>',
    );
  });

  it("Should display the html that was passed to the component", async () => {
    const content = "<ul><li>test</li></ul>";
    const wrapper = mount(SanitizedHtml, {
      props: { content: content, mode: SanitizeMode.Html },
    });
    await nextTick();

    const html = wrapper.find("[data-cy='sanitized-value']");
    expect(html.exists()).toBe(true);
    expect(html.html()).toContain(
      '<div data-cy="sanitized-value">\n' +
        "  <ul>\n" +
        "    <li>test</li>\n" +
        "  </ul>\n" +
        "</div>",
    );
  });
});

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
        '<a class="underline" data-cy="sanitized-value" href="http://safe.url" target="_blank">some_key</a>',
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
