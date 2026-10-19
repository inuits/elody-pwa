import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { createI18n } from "vue-i18n";
import ResultCountChip from "../ResultCountChip.vue";

// Real vue-i18n: the plural form choice is what we test.
vi.unmock("vue-i18n");

const i18n = () =>
  createI18n({
    legacy: false,
    locale: "en",
    messages: {
      en: {
        library: { "result-count": "{count} result | {count} results" },
        "bulk-operations": {
          "reveal-exact-count": "Click to load the exact count",
        },
      },
    },
  });

const getWrapper = (props: Record<string, unknown> = {}) =>
  mount(ResultCountChip, {
    props: { count: 40, ...props },
    global: {
      plugins: [i18n()],
      stubs: { BaseTooltip: true, SpinnerLoader: true, Unicon: true },
    },
  });

describe("ResultCountChip", () => {
  it("announces the total as a status", () => {
    expect(getWrapper().find('[role="status"]').exists()).toBe(true);
  });

  it("uses the plural form for many results", () => {
    expect(getWrapper({ count: 258 }).text()).toBe("258 results");
  });

  it("uses the singular form for one result", () => {
    expect(getWrapper({ count: 1 }).text()).toBe("1 result");
  });

  it("is a white chip in accent ink on the results band", () => {
    expect(getWrapper().find('[data-cy="list-count-chip"]').classes()).toEqual(
      expect.arrayContaining([
        "bg-surface",
        "text-text-panel-header",
        "rounded-chip",
        "text-chip",
      ]),
    );
  });


  it("shows a capped total as cap+ and asks to reveal the exact count", async () => {
    const wrapper = getWrapper({ count: 1001 });
    const button = wrapper.find("button");

    expect(button.text()).toBe("1,000+ results");
    await button.trigger("click");
    expect(wrapper.emitted("revealExactCount")).toHaveLength(1);
  });

  it("shows the revealed exact count with its own plural form", () => {
    const wrapper = getWrapper({ count: 1001, exactCount: 4312 });

    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.text()).toBe("4,312 results");
  });
});
