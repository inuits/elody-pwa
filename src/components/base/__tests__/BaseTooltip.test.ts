import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ someModalIsOpened: { value: false } }),
}));

vi.mock("@/composables/useModalTeleportTarget", () => ({
  modalTeleportTarget: () => "body",
}));

const getWrapper = () =>
  mount(BaseTooltip, {
    props: { position: "top", tooltipOffset: 0 },
    slots: {
      activator: `<template #activator="{ on, describedBy }">
          <button data-cy="trigger" :aria-describedby="describedBy" v-on="on">i</button>
        </template>`,
      default: "De donkere kamer van Damokles",
    },
    attachTo: document.body,
  });

const toListeners = (on: Record<string, () => void>) =>
  Object.fromEntries(
    Object.entries(on).map(([event, handler]) => [
      `on${event[0].toUpperCase()}${event.slice(1)}`,
      handler,
    ]),
  );

const tooltip = () => document.body.querySelector('[role="tooltip"]');

describe("BaseTooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  const showByHover = async () => {
    const wrapper = getWrapper();
    await wrapper.find('[data-cy="trigger"]').trigger("mouseenter");
    vi.advanceTimersByTime(300);
    await nextTick();
    return wrapper;
  };

  it("hides when its content goes away while shown", async () => {
    const { defineComponent, h, ref } = await import("vue");
    const showLabel = ref(true);
    const Host = defineComponent(
      () => () =>
        h(
          BaseTooltip,
          { position: "top", tooltipOffset: 0 },
          {
            activator: ({ on }: { on: Record<string, () => void> }) =>
              h("button", { "data-cy": "trigger", ...toListeners(on) }, "i"),
            ...(showLabel.value ? { default: () => "Contacts" } : {}),
          },
        ),
    );
    const wrapper = mount(Host, { attachTo: document.body });
    await wrapper.find('[data-cy="trigger"]').trigger("mouseenter");
    vi.advanceTimersByTime(300);
    await nextTick();
    showLabel.value = false;
    await nextTick();
    expect(tooltip()).toBeNull();
  });

  it("does not render its content while hidden", () => {
    const content = vi.fn(() => "Hint");
    mount(BaseTooltip, {
      props: { position: "top", tooltipOffset: 0 },
      slots: {
        activator: `<template #activator="{ on }"><button v-on="on">i</button></template>`,
        default: content,
      },
      attachTo: document.body,
    }).unmount();
    expect(content).not.toHaveBeenCalled();
  });

  it("shows at once when its show delay is 0", async () => {
    const wrapper = mount(BaseTooltip, {
      props: { position: "top", tooltipOffset: 0, showDelay: 0 },
      slots: {
        activator: `<template #activator="{ on }">
          <button data-cy="trigger" v-on="on">i</button>
        </template>`,
        default: "Contacts",
      },
      attachTo: document.body,
    });
    await wrapper.find('[data-cy="trigger"]').trigger("mouseenter");
    vi.advanceTimersByTime(0);
    await nextTick();
    expect(tooltip()).not.toBeNull();
  });

  it("waits 300ms before showing on hover", async () => {
    const wrapper = getWrapper();
    await wrapper.find('[data-cy="trigger"]').trigger("mouseenter");
    vi.advanceTimersByTime(299);
    await nextTick();
    expect(tooltip()).toBeNull();
  });

  it("shows after the 300ms delay on hover", async () => {
    await showByHover();
    expect(tooltip()).not.toBeNull();
  });

  it("does not show when the pointer leaves before the delay", async () => {
    const wrapper = getWrapper();
    const trigger = wrapper.find('[data-cy="trigger"]');
    await trigger.trigger("mouseenter");
    await trigger.trigger("mouseleave");
    vi.advanceTimersByTime(300);
    await nextTick();
    expect(tooltip()).toBeNull();
  });

  it("shows on keyboard focus", async () => {
    const wrapper = getWrapper();
    await wrapper.find('[data-cy="trigger"]').trigger("focusin");
    vi.advanceTimersByTime(300);
    await nextTick();
    expect(tooltip()).not.toBeNull();
  });

  it("hides on blur", async () => {
    const wrapper = await showByHover();
    await wrapper.find('[data-cy="trigger"]').trigger("focusout");
    await nextTick();
    expect(tooltip()).toBeNull();
  });

  it("hides on Escape", async () => {
    const wrapper = await showByHover();
    await wrapper.find('[data-cy="trigger"]').trigger("keydown", {
      key: "Escape",
    });
    await nextTick();
    expect(tooltip()).toBeNull();
  });

  it("is linked to its trigger via aria-describedby", async () => {
    const wrapper = await showByHover();
    expect(
      wrapper.find('[data-cy="trigger"]').attributes("aria-describedby"),
    ).toBe(tooltip()?.id);
  });

  it("renders on the inverted surface with white ink", async () => {
    await showByHover();
    expect(tooltip()?.className).toContain("bg-surface-inverted");
    expect(tooltip()?.className).toContain("text-neutral-white");
  });

  it("takes its size, padding and radius from the tooltip tokens", async () => {
    await showByHover();
    expect(tooltip()?.className).toContain("text-tooltip");
    expect(tooltip()?.className).toContain("p-(--tooltip-padding)");
    expect(tooltip()?.className).toContain("rounded-tooltip");
  });

  it("casts no shadow", async () => {
    await showByHover();
    expect(tooltip()?.className).not.toMatch(/shadow-/);
  });
});
