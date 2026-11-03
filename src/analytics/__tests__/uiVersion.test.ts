import { describe, expect, it } from "vitest";
import { uiVersion } from "@/analytics/uiVersion";

// The GraphQL server's app config says which UI the deployment runs (redesign
// on the beta/redesign track); without one it is the current UI.
describe("uiVersion", () => {
  it("is current when the app config names none", () => {
    expect(uiVersion(undefined)).toBe("current");
  });

  it("is what the app config names", () => {
    expect(uiVersion("redesign")).toBe("redesign");
  });

  it("is current when the app config names an empty one", () => {
    expect(uiVersion(" ")).toBe("current");
  });
});
