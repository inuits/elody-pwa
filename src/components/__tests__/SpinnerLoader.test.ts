import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import SpinnerLoader from "@/components/SpinnerLoader.vue";

const spinner = (props: Record<string, unknown> = {}) =>
  shallowMount(SpinnerLoader, { props }).find("span");

describe("SpinnerLoader", () => {
  it("is hidden from assistive tech; its container announces", () => {
    expect(spinner().attributes("aria-hidden")).toBe("true");
  });

  it("is not a live region itself", () => {
    expect(spinner().attributes("role")).toBeUndefined();
  });

  it("rotates at the spinner duration token", () => {
    expect(spinner().classes()).toContain(
      "animate-[spin_var(--spinner-duration)_linear_infinite]",
    );
  });

  it("draws the accent theme's moving edge in commit teal", () => {
    expect(spinner({ theme: "accent" }).classes()).toContain(
      "!border-t-commit",
    );
  });
});
