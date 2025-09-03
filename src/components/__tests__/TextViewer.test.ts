import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGetMediafile } from "@/composables/useGetMediafile";
import TextViewer from "../base/TextViewer.vue";

vi.mock("@/composables/useGetMediafile", () => ({
  useGetMediafile: vi.fn(),
}));

describe("File Content Sanitization", () => {
  let source;
  const mockGetMediafile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useGetMediafile.mockReturnValue({
      getMediafile: mockGetMediafile,
      getMediafilePath: (path) => path,
    });

    source = {
      intialValues: {
        original_file_location: "path/to/test.txt",
      },
    };
  });

  const createMockResponse = (text) => {
    return Promise.resolve({
      text: () => Promise.resolve(text),
    });
  };

  it("should remove <script> tags from the file content", async () => {
    const maliciousContent = "Hello world<script>alert('XSS');</script>";
    mockGetMediafile.mockReturnValue(createMockResponse(maliciousContent));

    const wrapper = await mount(TextViewer, { props: { source } });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const contentDiv = wrapper.find("[data-cy='sanitized-value']");
    expect(contentDiv.html()).not.toContain("<script>");
    expect(contentDiv.html()).toContain("Hello world");
  });

  it("should remove onerror attributes from image tags", async () => {
    const maliciousContent =
      '<img src="invalid-image" onerror="alert(\'XSS\')">';
    mockGetMediafile.mockReturnValue(createMockResponse(maliciousContent));

    const wrapper = await mount(TextViewer, { props: { source } });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const contentDiv = wrapper.find("[data-cy='sanitized-value']");
    expect(contentDiv.html()).not.toContain("onerror");
    expect(contentDiv.html()).toContain('<img src="invalid-image">');
  });

  it("should remove javascript: from href attributes", async () => {
    const maliciousContent = "<a href=\"javascript:alert('XSS')\">Click me</a>";
    mockGetMediafile.mockReturnValue(createMockResponse(maliciousContent));

    const wrapper = await mount(TextViewer, { props: { source } });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const contentDiv = wrapper.find("[data-cy='sanitized-value']");
    expect(contentDiv.html()).not.toContain("href");
    expect(contentDiv.text()).toContain("Click me");
  });

  it("should handle nested and slightly obfuscated XSS payloads", async () => {
    const maliciousContent =
      "<div>Hello<img src=x onerror=alert(String.fromCharCode(88,83,83))></div>";
    mockGetMediafile.mockReturnValue(createMockResponse(maliciousContent));

    const wrapper = await mount(TextViewer, { props: { source } });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const contentDiv = wrapper.find("[data-cy='sanitized-value']");
    expect(contentDiv.html()).not.toContain("onerror");
    expect(contentDiv.html()).not.toContain("<img src=x");
    expect(contentDiv.html()).toContain(`<div>Hello</div>`);
  });

  it("should preserve safe HTML tags like <b> and <i>", async () => {
    const safeContent = "This is <b>bold</b> and <i>italic</i> text.";
    mockGetMediafile.mockReturnValue(createMockResponse(safeContent));

    const wrapper = await mount(TextViewer, { props: { source } });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const contentDiv = wrapper.find("[data-cy='sanitized-value']");
    expect(contentDiv.html()).toContain("<b>bold</b>");
    expect(contentDiv.html()).toContain("<i>italic</i>");
  });

  it("should convert newline characters to <br> tags", async () => {
    const contentWithNewlines = "First line\nSecond line\r\nThird line";
    mockGetMediafile.mockReturnValue(createMockResponse(contentWithNewlines));

    const wrapper = await mount(TextViewer, { props: { source } });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const contentDiv = wrapper.find("[data-cy='sanitized-value']");
    expect(contentDiv.html()).toContain(
      "First line<br>Second line<br>Third line",
    );
  });

  it("should render an empty string if the file content is empty", async () => {
    const emptyContent = "";
    mockGetMediafile.mockReturnValue(createMockResponse(emptyContent));

    const wrapper = await mount(TextViewer, { props: { source } });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const contentDiv = wrapper.find("[data-cy='sanitized-value']");
    expect(contentDiv.element.innerHTML).toBe("");
  });

  it("should sanitize mixed content, removing only the malicious parts", async () => {
    const mixedContent =
      '<b>Safe and bold</b><script>alert("danger")</script><i>... and safe italic.</i><img src=x: onerror=alert(1)>';
    mockGetMediafile.mockReturnValue(createMockResponse(mixedContent));

    const wrapper = await mount(TextViewer, { props: { source } });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const contentDiv = wrapper.find("[data-cy='sanitized-value']");
    const sanitizedHtml = contentDiv.html();

    expect(sanitizedHtml).toContain("<b>Safe and bold</b>");
    expect(sanitizedHtml).toContain("<i>... and safe italic.</i>");
    expect(sanitizedHtml).not.toContain("<script>");
    expect(sanitizedHtml).not.toContain("onerror");
  });
});
