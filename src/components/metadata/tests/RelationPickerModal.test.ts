import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import { ModalStyle, TypeModals } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    te: (key: string) => key === "entity-translations.person",
    t: (key: string, args?: unknown) =>
      key === "entity-translations.person"
        ? "Person-label"
        : Array.isArray(args)
          ? `${key}:${args.join(",")}`
          : key,
  }),
}));

const options = ref<
  { label: string; secondaryLabel?: string; value: string }[]
>([]);
const count = ref<number>(0);
const loading = ref<boolean>(false);
const getAutocompleteOptions = vi.fn();
const stateArgs = vi.fn();
vi.mock("@/composables/useGetDropdownOptionsState", () => ({
  useGetDropdownOptionsState: (...args: unknown[]) => {
    stateArgs(...args);
    return {
      getAutocompleteOptions,
      entityDropdownOptions: options,
      entitiesCount: count,
      entitiesLoading: loading,
    };
  },
}));

import RelationPickerModal from "@/components/metadata/RelationPickerModal.vue";

const optionsConfig = {
  entityType: "company",
  searchFilterInput: { type: "text", key: ["name"], value: "*" },
  advancedFilterInputForRetrievingOptions: [{ type: "type", value: "company" }],
  formId: "PR-1",
  optionLabelKeys: ["name", "city"],
};

const mountModal = (props: Record<string, unknown> = {}) =>
  mount(RelationPickerModal, {
    attachTo: document.body,
    props: {
      acceptedType: "company",
      optionsConfig,
      single: false,
      ...props,
    },
    global: {
      stubs: {
        BaseModal: {
          name: "BaseModal",
          props: ["title"],
          emits: ["hideModal"],
          template:
            "<div><div data-testid='header-extra'><slot name='headerExtra' /></div><slot /></div>",
        },
        unicon: true,
      },
    },
  });

const open = async () => {
  useBaseModal().openModal(TypeModals.RelationPicker, ModalStyle.Center);
  await nextTick();
  await nextTick();
};

const rows = (wrapper: ReturnType<typeof mountModal>) =>
  wrapper.findAll("[role='option']");

describe("RelationPickerModal", () => {
  const { closeModal, getModalInfo } = useBaseModal();

  beforeEach(() => {
    vi.useFakeTimers();
    closeModal(TypeModals.RelationPicker);
    options.value = [
      { label: "Ghent Arts Centre", secondaryLabel: "Ghent", value: "c-1" },
      { label: "Bruges Hall", value: "c-2" },
    ];
    count.value = 2;
    loading.value = false;
    getAutocompleteOptions.mockClear();
    stateArgs.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("searches with the inline autocomplete's options config", () => {
    mountModal();
    expect(stateArgs).toHaveBeenCalledWith(
      "company",
      undefined,
      undefined,
      undefined,
      optionsConfig.searchFilterInput,
      optionsConfig.advancedFilterInputForRetrievingOptions,
      "PR-1",
      undefined,
      undefined,
      ["name", "city"],
    );
  });

  it("loads the first results when it opens, with focus in the search pill", async () => {
    const wrapper = mountModal();
    expect(wrapper.find("input").exists()).toBe(false);
    await open();
    expect(getAutocompleteOptions).toHaveBeenCalledWith("");
    expect(document.activeElement).toBe(wrapper.find("input").element);
  });

  it("searches as you type, debounced", async () => {
    const wrapper = mountModal();
    await open();
    getAutocompleteOptions.mockClear();
    await wrapper.find("input").setValue("ghe");
    expect(getAutocompleteOptions).not.toHaveBeenCalled();
    vi.advanceTimersByTime(250);
    expect(getAutocompleteOptions).toHaveBeenCalledWith("ghe");
  });

  it("lists the results as options with their secondary line, and the count in the header", async () => {
    const wrapper = mountModal();
    await open();
    expect(wrapper.find("[role='listbox']").exists()).toBe(true);
    expect(rows(wrapper).map((row) => row.text())).toEqual([
      "Ghent Arts CentreGhent",
      "Bruges Hall",
    ]);
    const status = wrapper.find("[data-testid='header-extra'] [role='status']");
    expect(status.text()).toBe("inline-edit.picker-count:2");
  });

  it("multi select: rows toggle, the query stays, Add hands them back and closes", async () => {
    const wrapper = mountModal();
    await open();
    await wrapper.find("input").setValue("ghe");
    const add = wrapper.find("[data-cy='relation-picker-add']");
    expect(add.attributes("disabled")).toBeDefined();

    await rows(wrapper)[0].trigger("click");
    await rows(wrapper)[1].trigger("click");
    await rows(wrapper)[1].trigger("click");
    expect(rows(wrapper)[0].attributes("aria-selected")).toBe("true");
    expect(rows(wrapper)[1].attributes("aria-selected")).toBe("false");
    expect((wrapper.find("input").element as HTMLInputElement).value).toBe(
      "ghe",
    );
    expect(getModalInfo(TypeModals.RelationPicker).open).toBe(true);

    await add.trigger("click");
    expect(wrapper.emitted("picked")?.[0]).toEqual([
      [{ label: "Ghent Arts Centre", value: "c-1" }],
    ]);
    expect(getModalInfo(TypeModals.RelationPicker).open).toBe(false);
  });

  it("keeps a selection that scrolled out of the results after a new search", async () => {
    const wrapper = mountModal();
    await open();
    await rows(wrapper)[0].trigger("click");
    options.value = [{ label: "Bruges Hall", value: "c-2" }];
    await nextTick();
    await rows(wrapper)[0].trigger("click");
    await wrapper.find("[data-cy='relation-picker-add']").trigger("click");
    expect(wrapper.emitted("picked")?.[0]).toEqual([
      [
        { label: "Ghent Arts Centre", value: "c-1" },
        { label: "Bruges Hall", value: "c-2" },
      ],
    ]);
  });

  it("single select: a row picks it and closes, without a footer", async () => {
    const wrapper = mountModal({ single: true });
    await open();
    expect(wrapper.find("[data-cy='relation-picker-add']").exists()).toBe(
      false,
    );
    await rows(wrapper)[1].trigger("click");
    expect(wrapper.emitted("picked")?.[0]).toEqual([
      [{ label: "Bruges Hall", value: "c-2" }],
    ]);
    expect(getModalInfo(TypeModals.RelationPicker).open).toBe(false);
  });

  it("cancel closes without picking", async () => {
    const wrapper = mountModal();
    await open();
    await rows(wrapper)[0].trigger("click");
    await wrapper.find("[data-cy='relation-picker-cancel']").trigger("click");
    expect(wrapper.emitted("picked")).toBeUndefined();
    expect(getModalInfo(TypeModals.RelationPicker).open).toBe(false);
  });

  it("keyboard: down arrow enters the results, Enter selects", async () => {
    const wrapper = mountModal();
    await open();
    await wrapper.find("input").trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(rows(wrapper)[0].element);
    await rows(wrapper)[0].trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(rows(wrapper)[1].element);
    await rows(wrapper)[1].trigger("keydown", { key: "Enter" });
    expect(rows(wrapper)[1].attributes("aria-selected")).toBe("true");
    await rows(wrapper)[1].trigger("keydown", { key: "ArrowUp" });
    await rows(wrapper)[0].trigger("keydown", { key: "ArrowUp" });
    expect(document.activeElement).toBe(wrapper.find("input").element);
  });

  it("no results: says so, and offers to create the query when the field allows it", async () => {
    options.value = [];
    count.value = 0;
    const wrapper = mountModal({ canCreate: true });
    await open();
    expect(wrapper.text()).toContain("inline-edit.picker-no-results");
    expect(wrapper.find("[data-cy='relation-picker-create']").exists()).toBe(
      false,
    );
    await wrapper.find("input").setValue("Nieuw Huis");
    await wrapper.find("[data-cy='relation-picker-create']").trigger("click");
    expect(wrapper.emitted("create")?.[0]).toEqual(["Nieuw Huis"]);
    expect(getModalInfo(TypeModals.RelationPicker).open).toBe(false);
  });

  it("keeps one fixed-height results region, so the modal doesn't resize while typing", async () => {
    const wrapper = mountModal();
    await open();
    const region = () => wrapper.find("[data-cy='relation-picker-results']");
    expect(region().classes()).toContain(
      "h-(--relation-picker-results-height)",
    );
    expect(region().find("[role='listbox']").exists()).toBe(true);
    options.value = [];
    await nextTick();
    expect(region().classes()).toContain(
      "h-(--relation-picker-results-height)",
    );
    expect(region().text()).toContain("inline-edit.picker-no-results");
  });

  it("no create escape when the field doesn't allow it", async () => {
    options.value = [];
    const wrapper = mountModal();
    await open();
    await wrapper.find("input").setValue("Nieuw Huis");
    expect(wrapper.find("[data-cy='relation-picker-create']").exists()).toBe(
      false,
    );
  });

  // entity-picker.md: panel-shell header "Kies {type}"
  it("titles the modal after the entity type, in words when translated", async () => {
    const company = mountModal();
    expect(company.findComponent({ name: "BaseModal" }).props("title")).toBe(
      "inline-edit.browse-title:company",
    );
    const person = mountModal({ acceptedType: "person" });
    expect(person.findComponent({ name: "BaseModal" }).props("title")).toBe(
      "inline-edit.browse-title:person-label",
    );
  });
});
