import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import FolderTreeLine from "@/components/FolderTreeLine.vue";

vi.mock("@vue/apollo-composable", () => ({
  useQuery: () => ({
    result: { value: undefined },
    refetch: vi.fn(),
    onResult: vi.fn(),
    loading: { value: false },
  }),
}));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => false }),
}));

const folder = (id: string, hasSubdirs: boolean) => ({
  id,
  dir: id,
  has_subdirs: hasSubdirs,
});

const mountLine = (
  directory = folder("scans", true),
  selected?: { id: string },
) => {
  const select = vi.fn();
  const wrapper = mount(FolderTreeLine, {
    props: {
      queryForSubDirectories: {},
      directory,
      dictionary: [],
      defaultOpen: false,
    },
    global: {
      provide: {
        updateSelectedDirectory: select,
        selectedDirectory: selected,
      },
      stubs: { LoadingList: true },
    },
  });
  return { wrapper, select };
};

describe("FolderTreeLine keyboard access", () => {
  it("selects a folder with a real button", async () => {
    const { wrapper, select } = mountLine();
    const button = wrapper.find('[data-cy="folder-select"]');
    expect(button.element.tagName).toBe("BUTTON");
    expect(button.attributes("type")).toBe("button");
    expect(button.text()).toBe("scans");
    await button.trigger("click");
    expect(select).toHaveBeenCalledWith(
      expect.objectContaining({ id: "scans" }),
    );
  });

  it("says which folder is selected, not only by colour", () => {
    const { wrapper } = mountLine(folder("scans", true), { id: "scans" });
    expect(
      wrapper.find('[data-cy="folder-select"]').attributes("aria-pressed"),
    ).toBe("true");
    const other = mountLine(folder("scans", true), { id: "other" }).wrapper;
    expect(
      other.find('[data-cy="folder-select"]').attributes("aria-pressed"),
    ).toBe("false");
  });

  it("follows the selection the import screen provides as a ref", async () => {
    const selected = ref<{ id: string } | null>(null);
    const { wrapper } = mountLine(folder("scans", true), selected as any);
    const button = wrapper.find('[data-cy="folder-select"]');
    expect(button.attributes("aria-pressed")).toBe("false");
    selected.value = { id: "scans" };
    await wrapper.vm.$nextTick();
    expect(button.attributes("aria-pressed")).toBe("true");
  });

  it("expands and collapses with a named button", async () => {
    const { wrapper } = mountLine();
    const toggle = wrapper.find('[data-cy="folder-toggle"]');
    expect(toggle.element.tagName).toBe("BUTTON");
    expect(toggle.attributes("aria-expanded")).toBe("false");
    expect(toggle.attributes("aria-label")).toBe("Expand scans");

    await toggle.trigger("click");
    expect(toggle.attributes("aria-expanded")).toBe("true");
    expect(toggle.attributes("aria-label")).toBe("Collapse scans");
  });

  it("has no expand button for a folder without subfolders", () => {
    const { wrapper } = mountLine(folder("empty", false));
    expect(wrapper.find('[data-cy="folder-toggle"]').exists()).toBe(false);
  });
});
