import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, ref } from "vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, values?: Record<string, unknown>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
    locale: ref("en"),
  }),
}));

import UiScaleMenu from "@/components/UiScaleMenu.vue";
import { initUiScale } from "@/composables/useUiScale";

let wrapper: ReturnType<typeof mount> | undefined;

const mountMenu = () =>
  (wrapper = mount(UiScaleMenu, {
    props: { isExpanded: false },
    attachTo: document.body,
    global: {
      stubs: {
        unicon: true,
        BaseIcon: true,
        BaseTooltip: {
          template: `<div><slot name="activator" :on="{}" /><slot /></div>`,
        },
      },
    },
  }));

const items = () => [...document.body.querySelectorAll('[role="menuitem"]')];

describe("UiScaleMenu", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window.screen, "width", {
      value: 2560,
      configurable: true,
    });
    Object.defineProperty(window.screen, "height", {
      value: 1440,
      configurable: true,
    });
    initUiScale();
  });
  afterEach(() => {
    wrapper?.unmount();
  });

  it("names its trigger and marks it as opening a menu", () => {
    const trigger = mountMenu().get('[data-cy="ui-scale"]');
    expect([
      trigger.attributes("aria-label"),
      trigger.attributes("aria-haspopup"),
    ]).toEqual(["navigation.display-size", "menu"]);
  });

  it("is an icon button the size of a control in the top bar", () => {
    expect(mountMenu().get('[data-cy="ui-scale"]').classes()).toContain(
      "size-(--control-height)",
    );
  });

  it("lists automatic with its current percentage, then each size", async () => {
    await mountMenu().get('[data-cy="ui-scale"]').trigger("click");
    await nextTick();
    expect(items().map((item) => item.textContent?.trim())).toEqual([
      'navigation.display-size-auto {"percent":"115%"}',
      "90%",
      "100%",
      "115%",
      "130%",
      "150%",
    ]);
  });

  it("applies the size you choose", async () => {
    await mountMenu().get('[data-cy="ui-scale"]').trigger("click");
    await nextTick();
    (items()[4] as HTMLElement).click();
    expect(document.documentElement.style.getPropertyValue("--ui-scale")).toBe(
      "1.3",
    );
  });

  it("highlights the active choice", async () => {
    localStorage.setItem("elody.uiScale", "1.5");
    initUiScale();
    await mountMenu().get('[data-cy="ui-scale"]').trigger("click");
    await nextTick();
    expect(items()[5].className).toContain("bg-accent-wash");
  });
});
