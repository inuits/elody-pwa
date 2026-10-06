import { describe, expect, it, vi } from "vitest";
import { getMetadataFields } from "@/helpers";
import { PanelType } from "@/generated-types/queries";

vi.mock("@/main", () => ({ apolloClient: {}, i18n: { global: { t: (key: string) => key } } }));

// SHACL 1.2 UI sh:languageIn: the field's language order has to reach the
// multilingual wrapper, which picks the displayed language with it.
describe("getMetadataFields", () => {
  it("passes a field's languageIn on to the multilingual wrapper", () => {
    const panel = {
      name: {
        __typename: "PanelMetaData",
        key: "name",
        label: "ui.person.name",
        value: "Alice",
        isMultilingual: true,
        languageIn: ["fr", "en"],
      },
    };
    const [field] = getMetadataFields(panel as any, PanelType.Metadata, "form-1") as any[];
    expect(field.isMultilingual).toBe(true);
    expect(field.languageIn).toEqual(["fr", "en"]);
  });
});
