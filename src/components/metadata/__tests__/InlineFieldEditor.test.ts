import { flushPromises, mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InlineFieldEditor from "../InlineFieldEditor.vue";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn().mockResolvedValue({ data: { mutateEntityValues: {} } }),
}));

vi.mock("@vue/apollo-composable", () => ({
  useMutation: () => ({ mutate: mocks.mutate }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ meta: { type: "entities" } }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => false }),
}));

vi.mock("@/helpers", () => ({
  getChildrenOfHomeRoutes: () => [],
}));

vi.mock("@/types", () => ({
  Unicons: {
    Check: { name: "Check" },
    Cross: { name: "Cross" },
    Edit: { name: "Edit" },
  },
}));

const mountEditor = (props: Record<string, unknown> = {}) =>
  mount(InlineFieldEditor, {
    props: {
      formId: "entity-1",
      fieldKey: "title",
      label: "Titel",
      value: "De helaasheid der dingen",
      ...props,
    },
    global: {
      stubs: { unicon: true, SpinnerLoader: true },
      provide: { config: {} },
    },
  });

describe("InlineFieldEditor", () => {
  beforeEach(() => {
    mocks.mutate.mockClear();
  });

  it("shows a resting button with the value and opens the editor on click", async () => {
    const wrapper = mountEditor();

    const toggle = wrapper.find("[data-cy='inline-edit-toggle']");
    expect(toggle.exists()).toBe(true);
    expect(toggle.text()).toContain("De helaasheid der dingen");
    expect(toggle.attributes("aria-label")).toContain("Titel");

    await toggle.trigger("click");
    const input = wrapper.find("[data-cy='inline-edit-input']");
    expect(input.exists()).toBe(true);
    expect((input.element as HTMLInputElement).value).toBe(
      "De helaasheid der dingen",
    );
    expect(wrapper.text()).toContain("Enter saves · Esc cancels");
  });

  it("saves via one mutation carrying only this field key", async () => {
    const wrapper = mountEditor();
    await wrapper.find("[data-cy='inline-edit-toggle']").trigger("click");

    await wrapper.find("[data-cy='inline-edit-input']").setValue("Nieuwe titel");
    await wrapper.find("[data-cy='inline-edit-save']").trigger("click");
    await flushPromises();

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    expect(mocks.mutate.mock.calls[0][0]).toMatchObject({
      id: "entity-1",
      formInput: {
        metadata: [{ key: "title", value: "Nieuwe titel" }],
        relations: [],
      },
    });
    expect(wrapper.emitted("update:value")).toEqual([["Nieuwe titel"]]);
    expect(wrapper.find("[data-cy='inline-edit-input']").exists()).toBe(false);
    expect(wrapper.find("[data-cy='inline-edit-saved']").exists()).toBe(true);
    expect(wrapper.find("[data-cy='inline-edit-undo']").exists()).toBe(true);
  });

  it("saves on Enter", async () => {
    const wrapper = mountEditor();
    await wrapper.find("[data-cy='inline-edit-toggle']").trigger("click");

    const input = wrapper.find("[data-cy='inline-edit-input']");
    await input.setValue("Enter titel");
    await input.trigger("keydown.enter");
    await flushPromises();

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
  });

  it("cancels on Esc without saving and keeps the old value", async () => {
    const wrapper = mountEditor();
    await wrapper.find("[data-cy='inline-edit-toggle']").trigger("click");

    const input = wrapper.find("[data-cy='inline-edit-input']");
    await input.setValue("weggegooid");
    await input.trigger("keydown.esc");

    expect(mocks.mutate).not.toHaveBeenCalled();
    expect(wrapper.emitted("update:value")).toBeUndefined();
    expect(wrapper.find("[data-cy='inline-edit-toggle']").text()).toContain(
      "De helaasheid der dingen",
    );
  });

  it("blocks emptying a required field with a scoped error", async () => {
    const wrapper = mountEditor({ required: true });
    await wrapper.find("[data-cy='inline-edit-toggle']").trigger("click");

    await wrapper.find("[data-cy='inline-edit-input']").setValue("  ");
    await wrapper.find("[data-cy='inline-edit-save']").trigger("click");
    await flushPromises();

    expect(mocks.mutate).not.toHaveBeenCalled();
    const error = wrapper.find("[data-cy='inline-edit-error']");
    expect(error.exists()).toBe(true);
    expect(error.attributes("role")).toBe("alert");
    // draft is kept so the user can correct it
    expect(wrapper.find("[data-cy='inline-edit-input']").exists()).toBe(true);
  });

  it("validates against the configured regex", async () => {
    const wrapper = mountEditor({ regex: "^\\d{13}$", value: "" });
    await wrapper.find("[data-cy='inline-edit-toggle']").trigger("click");

    await wrapper.find("[data-cy='inline-edit-input']").setValue("abc");
    await wrapper.find("[data-cy='inline-edit-save']").trigger("click");
    expect(mocks.mutate).not.toHaveBeenCalled();
    expect(wrapper.find("[data-cy='inline-edit-error']").exists()).toBe(true);

    await wrapper.find("[data-cy='inline-edit-input']").setValue("9789023456789");
    await wrapper.find("[data-cy='inline-edit-save']").trigger("click");
    await flushPromises();
    expect(mocks.mutate).toHaveBeenCalledTimes(1);
  });

  it("keeps the draft and shows the error when the mutation fails", async () => {
    mocks.mutate.mockRejectedValueOnce(new Error("server said no"));
    const wrapper = mountEditor();
    await wrapper.find("[data-cy='inline-edit-toggle']").trigger("click");

    await wrapper.find("[data-cy='inline-edit-input']").setValue("mislukt");
    await wrapper.find("[data-cy='inline-edit-save']").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("update:value")).toBeUndefined();
    const input = wrapper.find("[data-cy='inline-edit-input']");
    expect(input.exists()).toBe(true);
    expect((input.element as HTMLInputElement).value).toBe("mislukt");
    expect(wrapper.find("[data-cy='inline-edit-error']").text()).toContain(
      "server said no",
    );
  });

  it("undo writes the old value back as a new change", async () => {
    const wrapper = mountEditor();
    await wrapper.find("[data-cy='inline-edit-toggle']").trigger("click");
    await wrapper.find("[data-cy='inline-edit-input']").setValue("Nieuwe titel");
    await wrapper.find("[data-cy='inline-edit-save']").trigger("click");
    await flushPromises();

    await wrapper.find("[data-cy='inline-edit-undo']").trigger("click");
    await flushPromises();

    expect(mocks.mutate).toHaveBeenCalledTimes(2);
    expect(mocks.mutate.mock.calls[1][0].formInput.metadata).toEqual([
      { key: "title", value: "De helaasheid der dingen" },
    ]);
    expect(wrapper.emitted("update:value")).toEqual([
      ["Nieuwe titel"],
      ["De helaasheid der dingen"],
    ]);
    expect(wrapper.find("[data-cy='inline-edit-undo']").exists()).toBe(false);
  });
});
