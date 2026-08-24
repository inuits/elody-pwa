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
