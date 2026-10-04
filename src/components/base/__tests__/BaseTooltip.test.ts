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

  it("uses the label text size and button radius", async () => {
    await showByHover();
    expect(tooltip()?.className).toContain("text-label");
    expect(tooltip()?.className).toContain("rounded-button");
  });
});
