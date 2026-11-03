import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it } from "vitest";
import {
  UsageSurface,
  provideUsageSurface,
  useUsageSurface,
} from "@/analytics/usageSurface";

// Which part of a page an action was started from (the element's alias in
// the UI declaration, e.g. completenessOverview), for bulk_operation,
// form_opened and form_submitted.
const reader = () => {
  let read: () => string | undefined = () => "not read";
  const component = defineComponent({
    setup() {
      read = useUsageSurface();
      return () => h("span");
    },
  });
  return { component, read: () => read() };
};

describe("usage surface", () => {
  it("is the alias of the element an action is started in", () => {
    const { component, read } = reader();
    mount(UsageSurface, {
      props: { name: "completenessOverview" },
      slots: { default: () => h(component) },
    });
    expect(read()).toBe("completenessOverview");
  });

  it("is the outermost element's alias inside a nested one", () => {
    const { component, read } = reader();
    mount(UsageSurface, {
      props: { name: "completenessOverview" },
      slots: {
        default: () =>
          h(UsageSurface, { name: "posters" }, { default: () => h(component) }),
      },
    });
    expect(read()).toBe("completenessOverview");
  });

  it("is none outside any element", () => {
    const { component, read } = reader();
    mount(component);
    expect(read()).toBeUndefined();
  });

  it("is none outside a component", () => {
    expect(useUsageSurface()()).toBeUndefined();
  });

  it("is read when the action happens, not when the component starts", () => {
    const opened = ref<string | undefined>(undefined);
    const { component, read } = reader();
    const host = defineComponent({
      setup() {
        provideUsageSurface(() => opened.value);
        return () => h(component);
      },
    });
    mount(host);
    opened.value = "completenessOverview";
    expect(read()).toBe("completenessOverview");
  });
});
