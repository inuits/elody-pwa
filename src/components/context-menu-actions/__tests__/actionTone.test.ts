import { describe, it, expect } from "vitest";
import { ActionTone } from "@/generated-types/queries";
import { dangerLast, toneStyle } from "../actionTone";

describe("actionTone", () => {
  it("moves destructive actions to the end and keeps the rest in order", () => {
    const actions = [
      { label: "delete", tone: ActionTone.Danger },
      { label: "open" },
      { label: "copy", tone: ActionTone.Default },
    ];

    expect(dangerLast(actions).map(({ label }) => label)).toEqual([
      "open",
      "copy",
      "delete",
    ]);
  });

  it("switches a destructive item to danger ink", () => {
    expect(toneStyle({ tone: ActionTone.Danger })).toEqual({
      "--menu-item-ink": "var(--color-danger-ink)",
    });
    expect(toneStyle({ tone: ActionTone.Default })).toBeUndefined();
  });
});
