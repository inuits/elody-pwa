import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SearchBar from "../SearchBar.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ openModal: vi.fn() }),
}));

vi.mock("@/generated-types/queries", () => ({
  ModalStyle: { CenterWide: "CenterWide" },
  TypeModals: { Search: "Search" },
}));

const mountSearchBar = () =>
  mount(SearchBar, {
    props: { inputEnabled: true },
    global: { stubs: { unicon: true } },
  });

describe("SearchBar.vue debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("emits once with the last term after typing settles", async () => {
    const wrapper = mountSearchBar();
    const input = wrapper.find("input");

    await input.setValue("jo");
    await input.setValue("joh");
    await input.setValue("john");

    expect(wrapper.emitted("search")).toBeUndefined();

    vi.advanceTimersByTime(250);
    expect(wrapper.emitted("search")).toEqual([["john"]]);
  });

  it("submits immediately on enter without a trailing debounced emit", async () => {
    const wrapper = mountSearchBar();
    const input = wrapper.find("input");

    await input.setValue("john");
    await input.trigger("keydown.enter");
    expect(wrapper.emitted("search")).toEqual([["john"]]);

    vi.advanceTimersByTime(250);
    expect(wrapper.emitted("search")).toEqual([["john"]]);
  });

});

// navigation.md: the header search trigger is a pill field that opens the
// simple-search modal; inside the modal the field searches as you type
describe("SearchBar.vue handoff shape", () => {
  const mountTrigger = () =>
    mount(SearchBar, {
      props: { inputEnabled: false },
      global: { stubs: { unicon: true } },
    });

  // ui_kits/vlacc AppShell (list and detail top bar): a round accent icon
  // button; the field lives in the list toolbar (user, 2026-10-30)
  it("renders the header trigger as a named round icon button that opens a dialog", () => {
    const trigger = mountTrigger().find("[data-testid='search-trigger']");
    expect(trigger.element.tagName).toBe("BUTTON");
    expect(trigger.classes()).toEqual(
      expect.arrayContaining(["rounded-round", "bg-accent", "text-text-on-accent"]),
    );
    expect(trigger.attributes("aria-label")).toBe("library.search");
    expect(trigger.attributes("aria-haspopup")).toBe("dialog");
    expect(trigger.text()).toBe("");
  });

  it("uses a named search pill inside the modal, with no separate search button", () => {
    const wrapper = mountSearchBar();
    const pill = wrapper.findComponent({ name: "BaseSearchPill" });
    expect(pill.exists()).toBe(true);
    expect(pill.props("label")).toBe("library.search");
    expect(wrapper.find("button").exists()).toBe(false);
  });
});
