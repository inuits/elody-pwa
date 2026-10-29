import { mount, flushPromises } from "@vue/test-utils";
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

    const wrapper = await mount(TextViewer, {
      props: { source },
      global: { stubs: { ViewerToolbar: true } },
    });
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

    const wrapper = await mount(TextViewer, {
      props: { source },
      global: { stubs: { ViewerToolbar: true } },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const contentDiv = wrapper.find("[data-cy='sanitized-value']");
    expect(contentDiv.html()).not.toContain("onerror");
    expect(contentDiv.html()).not.toContain('<img src="invalid-image">');
  });

  it("should remove javascript: from href attributes", async () => {
    const maliciousContent = "<a href=\"javascript:alert('XSS')\">Click me</a>";
    mockGetMediafile.mockReturnValue(createMockResponse(maliciousContent));

    const wrapper = await mount(TextViewer, {
      props: { source },
      global: { stubs: { ViewerToolbar: true } },
    });
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

    const wrapper = await mount(TextViewer, {
      props: { source },
      global: { stubs: { ViewerToolbar: true } },
    });
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

    const wrapper = await mount(TextViewer, {
      props: { source },
      global: { stubs: { ViewerToolbar: true } },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const contentDiv = wrapper.find("[data-cy='sanitized-value']");
    expect(contentDiv.html()).toContain("<b>bold</b>");
    expect(contentDiv.html()).toContain("<i>italic</i>");
  });

  it("should convert newline characters to <br> tags", async () => {
    const contentWithNewlines = "First line\nSecond line\r\nThird line";
    mockGetMediafile.mockReturnValue(createMockResponse(contentWithNewlines));

    const wrapper = await mount(TextViewer, {
      props: { source },
      global: { stubs: { ViewerToolbar: true } },
    });
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

    const wrapper = await mount(TextViewer, {
      props: { source },
      global: { stubs: { ViewerToolbar: true } },
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const contentDiv = wrapper.find("[data-cy='sanitized-value']");
    expect(contentDiv.element.innerHTML).toBe("");
  });

  it("should sanitize mixed content, removing only the malicious parts", async () => {
    const mixedContent =
      '<b>Safe and bold</b><script>alert("danger")</script><i>... and safe italic.</i><img src=x: onerror=alert(1)>';
    mockGetMediafile.mockReturnValue(createMockResponse(mixedContent));

    const wrapper = await mount(TextViewer, {
      props: { source },
      global: { stubs: { ViewerToolbar: true } },
    });
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

describe("TextViewer - toolbar and warning", () => {
  const mockGetMediafile = vi.fn();
  const source = {
    id: "mediafile-1",
    original_filename: "notes.txt",
    intialValues: { original_file_location: "path/to/notes.txt" },
  };
  const ViewerToolbarStub = {
    name: "ViewerToolbar",
    props: ["mode", "mediafileId", "originalFilename"],
    emits: ["zoom-in", "zoom-out"],
    template:
      "<div>" +
      '<button data-testid="zoom-in" @click="$emit(\'zoom-in\')" />' +
      '<button data-testid="zoom-out" @click="$emit(\'zoom-out\')" />' +
      "</div>",
  };
  const getWrapper = async (text = "Hello") => {
    mockGetMediafile.mockReturnValue(
      Promise.resolve({ text: () => Promise.resolve(text) }),
    );
    const wrapper = mount(TextViewer, {
      props: { source },
      global: { stubs: { ViewerToolbar: ViewerToolbarStub } },
    });
    await flushPromises();
    return wrapper;
  };
  const contentSize = (wrapper: any) =>
    (wrapper.find("[data-testid='text-viewer-content']").element as HTMLElement)
      .style.fontSize;

  beforeEach(() => {
    vi.clearAllMocks();
    (useGetMediafile as any).mockReturnValue({
      getMediafile: mockGetMediafile,
      getMediafilePath: (path: string) => path,
    });
  });

  it("uses the shared viewer toolbar in text mode for this file", async () => {
    const wrapper = await getWrapper();
    const toolbar = wrapper.findComponent(ViewerToolbarStub);
    expect(toolbar.props("mode")).toBe("text");
    expect(toolbar.props("mediafileId")).toBe("mediafile-1");
    expect(toolbar.props("originalFilename")).toBe("notes.txt");
  });

  it("zooms the text in and out in steps", async () => {
    const wrapper = await getWrapper();
    expect(contentSize(wrapper)).toBe("100%");
    await wrapper.find("[data-testid='zoom-in']").trigger("click");
    expect(contentSize(wrapper)).toBe("125%");
    await wrapper.find("[data-testid='zoom-out']").trigger("click");
    await wrapper.find("[data-testid='zoom-out']").trigger("click");
    expect(contentSize(wrapper)).toBe("75%");
  });

  it("keeps the zoom between half and triple size", async () => {
    const wrapper = await getWrapper();
    for (let i = 0; i < 20; i++)
      await wrapper.find("[data-testid='zoom-in']").trigger("click");
    expect(contentSize(wrapper)).toBe("300%");
    for (let i = 0; i < 20; i++)
      await wrapper.find("[data-testid='zoom-out']").trigger("click");
    expect(contentSize(wrapper)).toBe("50%");
  });

  it("announces the sanitised-content warning as a status", async () => {
    const wrapper = await getWrapper("Hi<script>alert(1)</script>");
    const banner = wrapper.find(
      "[data-testid='text-viewer-sanitized-warning']",
    );
    expect(banner.exists()).toBe(true);
    expect(banner.attributes("role")).toBe("status");
  });
});
