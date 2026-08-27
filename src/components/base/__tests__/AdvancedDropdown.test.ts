// A dropdown has to be able to show the value it was handed.
//
// The option list is a suggestion, not a closed set: a SHACL-described
// processor's channel dropdown offers the channels that exist, while a pipeline
// connection names a channel it derived itself. Reaching straight into
// `options.find(...).value` threw on such a value, and because the watcher doing
// it is `immediate` the throw aborted the whole render flush -- the sibling
// fields of the config modal either never mounted or kept the empty value they
// had first rendered with. That is what made a configured processor open blank.

import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, it, expect, vi } from "vitest";
import AdvancedDropdown from "../AdvancedDropdown.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k }) }));
vi.mock("vue-router", () => ({ useRoute: () => ({ query: {}, params: {} }) }));

const OPTIONS = [
  { icon: "NoIcon", label: "json", value: "json", __typename: "DropdownOption" },
  { icon: "NoIcon", label: "rdf", value: "rdf", __typename: "DropdownOption" },
];

const mountDropdown = (modelValue: unknown, options = OPTIONS) =>
  mount(AdvancedDropdown as any, {
    props: { modelValue, options },
    global: { stubs: { VueSelect: { template: "<div />" }, unicon: true } },
  });

describe("AdvancedDropdown", () => {
  it("selects a value that is one of the options", async () => {
    const w = mountDropdown("rdf");
    await nextTick();
    expect((w.vm as any).selectedItem).toBe("rdf");
  });

  it("keeps a value that no option offers, instead of throwing", async () => {
    // the connection-derived channel name a pipeline saves
    const derived = "validate-outgoing-writer-to-sparqlingest-memberstream";
    const w = mountDropdown(derived);
    await nextTick();
    expect((w.vm as any).selectedItem).toBe(derived);
  });

  it("offers that value so it can be displayed", async () => {
    const derived = "validate-outgoing-writer-to-sparqlingest-memberstream";
    const w = mountDropdown(derived);
    await nextTick();
    const values = (w.vm as any).dropdownOptions.map((o: any) => o.value);
    expect(values).toContain(derived);
    expect(values).toHaveLength(OPTIONS.length + 1);
  });

  it("does not duplicate a value that is already an option", async () => {
    const w = mountDropdown("json");
    await nextTick();
    expect((w.vm as any).dropdownOptions).toHaveLength(OPTIONS.length);
  });

  it("leaves the options alone when there is no value", async () => {
    const w = mountDropdown(undefined);
    await nextTick();
    expect((w.vm as any).selectedItem).toBeUndefined();
    expect((w.vm as any).dropdownOptions).toHaveLength(OPTIONS.length);
  });
});
