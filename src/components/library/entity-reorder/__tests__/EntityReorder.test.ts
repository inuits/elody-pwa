import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { ref } from "vue";
import EntityReorder from "@/components/library/entity-reorder/EntityReorder.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: object) =>
      params ? `${key} ${JSON.stringify(params)}` : key,
  }),
}));
vi.mock("@/composables/useNavMenu", () => ({ isCompact: ref(false) }));
vi.mock("@/composables/useListItemHelper", () => ({
  useListItemHelper: () => ({ getMediaFilenameFromEntity: () => undefined }),
}));
const notifications = vi.hoisted(() => ({
  displaySuccessNotification: vi.fn(),
  displayErrorNotification: vi.fn(),
}));
vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => notifications,
}));

const csv = [
  "id,type,file_identifier",
  ...["a", "b", "c", "d", "e", "f", "g"].map(
    (id) => `${id},mediafile,${id}.jpg`,
  ),
].join("\n");

const fetchMock = vi.fn();

const mountEditor = async () => {
  const wrapper = mount(EntityReorder, {
    props: { parentId: "asset-1", pageSize: 3, fetchEntities: async () => [] },
    global: {
      stubs: {
        unicon: true,
        BaseButtonNew: {
          props: ["label", "disabled"],
          template: `<button :disabled="disabled" @click="$emit('click')">{{ label }}</button>`,
        },
      },
    },
  });
  await flushPromises();
  return wrapper;
};

const visibleNames = (wrapper: Awaited<ReturnType<typeof mountEditor>>) =>
  wrapper
    .findAll("[data-cy=entity-reorder-row] span.truncate")
    .map((name) => name.text());

const buttonWithText = (
  wrapper: Awaited<ReturnType<typeof mountEditor>>,
  text: string,
) => wrapper.findAll("button").find((button) => button.text().includes(text))!;

describe("EntityReorder across pages", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true, text: async () => csv });
    vi.stubGlobal("fetch", fetchMock);
  });

  it("shows the page of the full order", async () => {
    const wrapper = await mountEditor();
    expect(visibleNames(wrapper)).toEqual(["a.jpg", "b.jpg", "c.jpg"]);
    await buttonWithText(wrapper, "2").trigger("click");
    expect(visibleNames(wrapper)).toEqual(["d.jpg", "e.jpg", "f.jpg"]);
  });

  it("moves the last row of a page to the start of the next one", async () => {
    const wrapper = await mountEditor();
    const lastRow = wrapper.findAll("[data-cy=entity-reorder-row]")[2];
    const down = lastRow.findAll("button")[1];
    expect(down.attributes("title")).toContain("reorder.to-start-of-page");

    await down.trigger("click");

    expect(visibleNames(wrapper)).toEqual(["a.jpg", "b.jpg", "d.jpg"]);
    expect(wrapper.text()).toContain('reorder.go-to-page {"page":2}');
    await buttonWithText(wrapper, "reorder.go-to-page").trigger("click");
    expect(visibleNames(wrapper)).toEqual(["c.jpg", "e.jpg", "f.jpg"]);
  });

  it("takes an absolute position that lands on another page", async () => {
    const wrapper = await mountEditor();
    const input = wrapper.find("[data-cy=entity-reorder-row] input");
    await input.setValue("7");
    await input.trigger("blur");

    expect(visibleNames(wrapper)).toEqual(["b.jpg", "c.jpg", "d.jpg"]);
    await buttonWithText(wrapper, "3").trigger("click");
    expect(visibleNames(wrapper)).toEqual(["a.jpg"]);
  });

  it("drops a dragged row on the next page zone or on a page number", async () => {
    const wrapper = await mountEditor();
    const dataTransfer = { setData: vi.fn(), effectAllowed: "" };
    const drag = async (rowIndex: number) => {
      await wrapper
        .findAll("[data-cy=entity-reorder-row]")
        [rowIndex].trigger("dragstart", { dataTransfer });
      await new Promise((resolve) => setTimeout(resolve));
      await flushPromises();
    };

    await drag(0);
    const nextZone = wrapper
      .findAll("div")
      .findLast((div) => div.text().includes("reorder.drop-start-of-page"))!;
    await nextZone.trigger("drop");
    expect(visibleNames(wrapper)).toEqual(["b.jpg", "c.jpg", "d.jpg"]);

    await drag(0);
    await buttonWithText(wrapper, "3").trigger("drop");
    await buttonWithText(wrapper, "3").trigger("click");
    expect(visibleNames(wrapper)).toEqual(["b.jpg"]);
  });

  it("saves the whole order, not only the visible page", async () => {
    const wrapper = await mountEditor();
    const saveButton = buttonWithText(wrapper, "reorder.save");
    expect(saveButton.attributes("disabled")).toBeDefined();

    await wrapper
      .findAll("[data-cy=entity-reorder-row]")[0]
      .findAll("button")[1]
      .trigger("click");
    await saveButton.trigger("click");
    await flushPromises();

    const [url, request] = fetchMock.mock.calls[1];
    expect(url).toBe("/api/upload/csv?parentId=asset-1");
    expect(
      request.body.split("\n").map((line: string) => line.split(",")[0]),
    ).toEqual(["id", "b", "a", "c", "d", "e", "f", "g"]);
    expect(wrapper.emitted("close")).toEqual([[true]]);
  });
});
