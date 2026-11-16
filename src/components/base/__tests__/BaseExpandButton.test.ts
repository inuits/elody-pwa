import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import BaseExpandButton from "../BaseExpandButton.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k, te: () => false }) }));

const getWrapper = () =>
  mount(BaseExpandButton, { global: { stubs: { unicon: true } } });

describe("BaseExpandButton", () => {
  it("is a button that says it expands the column", () => {
    const button = getWrapper().find("button");
    expect(button.attributes("type")).toBe("button");
    expect(button.attributes("aria-expanded")).toBe("false");
    expect(button.attributes("aria-label")).toBe("Expand");
  });

  it("toggles and reports the new state", async () => {
    const wrapper = getWrapper();
    const button = wrapper.find("button");
    await button.trigger("click");
    expect(button.attributes("aria-expanded")).toBe("true");
    expect(button.attributes("aria-label")).toBe("Collapse");
    expect(wrapper.emitted("expandMediaList")?.[0]).toEqual([true]);
  });
});
