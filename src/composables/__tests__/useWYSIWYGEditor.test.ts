import { describe, expect, it } from "vitest";
import { useWYSIWYGEditor } from "@/composables/useWYSIWYGEditor";

const { countLinesOfContent } = useWYSIWYGEditor();

describe("countLinesOfContent", () => {
  it("counts a single line", () => {
    expect(countLinesOfContent("<p>one</p>")).toBe(1);
  });

  it("counts hard breaks", () => {
    expect(countLinesOfContent("<p>one<br>two<br />three</p>")).toBe(3);
  });

  it("counts pasted paragraphs, as Word produces one per line", () => {
    expect(countLinesOfContent('<p class="MsoNormal">one</p><p>two</p>')).toBe(
      2,
    );
  });

  it("counts nothing for empty content", () => {
    expect(countLinesOfContent("")).toBe(0);
  });

  it("counts a mix of paragraphs and hard breaks", () => {
    expect(countLinesOfContent("<p>one<br>two</p><p>three</p>")).toBe(3);
  });
});
