import { describe, it, expect, beforeEach } from "vitest";
import { useInfoPanel } from "@/composables/useInfoPanel";

describe("useInfoPanel", () => {
  beforeEach(() => {
    useInfoPanel().closePanel();
  });

  it("has no active panel initially", () => {
    const { activePanel } = useInfoPanel();
    expect(activePanel.value).toBeNull();
  });

  it("openPanel sets the active panel payload", () => {
    const { activePanel, openPanel } = useInfoPanel();
    openPanel({ title: "metadata.conventions.title", content: "<p>hi</p>" });
    expect(activePanel.value).toEqual({
      title: "metadata.conventions.title",
      content: "<p>hi</p>",
    });
  });

  it("openPanel replaces a previously open panel", () => {
    const { activePanel, openPanel } = useInfoPanel();
    openPanel({ title: "first", content: "<p>1</p>" });
    openPanel({ title: "second", content: "<p>2</p>" });
    expect(activePanel.value).toEqual({ title: "second", content: "<p>2</p>" });
  });

  it("closePanel clears the active panel", () => {
    const { activePanel, openPanel, closePanel } = useInfoPanel();
    openPanel({ title: "metadata.conventions.title", content: "<p>hi</p>" });
    closePanel();
    expect(activePanel.value).toBeNull();
  });

  it("shares the same state across separate calls (singleton)", () => {
    const first = useInfoPanel();
    const second = useInfoPanel();
    first.openPanel({ title: "shared", content: "<p>x</p>" });
    expect(second.activePanel.value).toEqual({
      title: "shared",
      content: "<p>x</p>",
    });
  });
});
