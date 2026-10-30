import { describe, it, expect } from "vitest";
import { getUrlWithoutAuthCallbackParams } from "@/utils/authCallbackUrl";

describe("getUrlWithoutAuthCallbackParams", () => {
  it("drops the params Keycloak appends to the redirect uri", () => {
    expect(
      getUrlWithoutAuthCallbackParams(
        "https://openvlacc.elody.eu/work_word/W-1?session_state=s&iss=https%3A%2F%2Fauth&code=c",
      ),
    ).toBe("/work_word/W-1");
  });

  it("keeps other query params and the hash", () => {
    expect(
      getUrlWithoutAuthCallbackParams(
        "https://openvlacc.elody.eu/search?q=gent&code=c&state=x#results",
      ),
    ).toBe("/search?q=gent#results");
  });

  it("leaves a url without callback params untouched", () => {
    expect(
      getUrlWithoutAuthCallbackParams("https://openvlacc.elody.eu/?q=gent"),
    ).toBe("/?q=gent");
  });
});
