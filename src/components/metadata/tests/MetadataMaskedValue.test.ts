import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

vi.mock("@/main", () => ({
  i18n: { global: { t: (key: string) => key } },
  apolloClient: { query: vi.fn() },
}));

const loadDocumentMock = vi.fn().mockResolvedValue({ kind: "Document" });
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: loadDocumentMock }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

import MetadataMaskedValue from "../MetadataMaskedValue.vue";
import { apolloClient } from "@/main";

const MASK = "•".repeat(12);

const mountComponent = (props: Record<string, unknown>) =>
  mount(MetadataMaskedValue, {
    props: { metadataKey: "_key", ...props },
    global: {
      stubs: {
        unicon: { template: "<div></div>", props: ["name"] },
        BaseCopyToClipboard: true,
      },
    },
  });

const value = (wrapper: any) =>
  wrapper.find('[data-cy="metadata-masked-value"]').text();
const toggle = (wrapper: any) =>
  wrapper.find('[data-cy="metadata-masked-toggle"]');

describe("MetadataMaskedValue — value carried in the payload", () => {
  it("masks the value it was given", () => {
    const wrapper = mountComponent({ value: "elk_secret" });

    expect(value(wrapper)).toBe(MASK);
    expect(wrapper.text()).not.toContain("elk_secret");
  });

  it("reveals and re-hides on click", async () => {
    const wrapper = mountComponent({ value: "elk_secret" });

    await toggle(wrapper).trigger("click");
    expect(value(wrapper)).toBe("elk_secret");

    await toggle(wrapper).trigger("click");
    expect(value(wrapper)).toBe(MASK);
  });

  it("offers no toggle when there is nothing to show", () => {
    const wrapper = mountComponent({ value: "" });

    expect(toggle(wrapper).exists()).toBe(false);
  });

  it("labels the toggle for the current state", async () => {
    const wrapper = mountComponent({ value: "elk_secret" });

    expect(toggle(wrapper).attributes("aria-label")).toBe(
      "metadata.labels.show-value",
    );
    await toggle(wrapper).trigger("click");
    expect(toggle(wrapper).attributes("aria-label")).toBe(
      "metadata.labels.hide-value",
    );
  });

  it("never queries when no reveal query is configured", async () => {
    const wrapper = mountComponent({ value: "elk_secret" });

    await toggle(wrapper).trigger("click");
    await flushPromises();

    expect(apolloClient.query).not.toHaveBeenCalled();
  });
});

describe("MetadataMaskedValue — value fetched on request", () => {
  const revealProps = {
    value: "",
    revealQuery: "GetTokenSecret",
    entityId: "TOK-1",
  };

  beforeEach(() => {
    vi.mocked(apolloClient.query).mockReset();
    loadDocumentMock.mockClear();
  });

  it("shows a toggle even though the payload carries no value", () => {
    const wrapper = mountComponent(revealProps);

    expect(toggle(wrapper).exists()).toBe(true);
    expect(value(wrapper)).toBe(MASK);
  });

  it("does not call the endpoint before it is asked to", () => {
    mountComponent(revealProps);

    expect(apolloClient.query).not.toHaveBeenCalled();
  });

  it("fetches on the first press and renders what came back", async () => {
    vi.mocked(apolloClient.query).mockResolvedValue({
      data: { Entity: { intialValues: { _key: "elk_fetched" } } },
    } as any);

    const wrapper = mountComponent(revealProps);
    await toggle(wrapper).trigger("click");
    await flushPromises();

    expect(loadDocumentMock).toHaveBeenCalledWith("GetTokenSecret");
    expect(vi.mocked(apolloClient.query).mock.calls[0][0]).toMatchObject({
      variables: { id: "TOK-1" },
      fetchPolicy: "no-cache",
    });
    expect(value(wrapper)).toBe("elk_fetched");
  });

  it("does not re-fetch when hidden and shown again", async () => {
    vi.mocked(apolloClient.query).mockResolvedValue({
      data: { Entity: { intialValues: { _key: "elk_fetched" } } },
    } as any);

    const wrapper = mountComponent(revealProps);
    // show, hide, show again
    for (let press = 0; press < 3; press++) {
      await toggle(wrapper).trigger("click");
      await flushPromises();
    }

    expect(apolloClient.query).toHaveBeenCalledTimes(1);
    expect(value(wrapper)).toBe("elk_fetched");
  });

  it("reports an already-spent value when the endpoint returns nothing", async () => {
    vi.mocked(apolloClient.query).mockResolvedValue({
      data: { Entity: { intialValues: { _key: "" } } },
    } as any);

    const wrapper = mountComponent(revealProps);
    await toggle(wrapper).trigger("click");
    await flushPromises();

    expect(value(wrapper)).toBe("metadata.labels.value-unavailable");
  });

  it("reports unavailability when the query fails", async () => {
    vi.mocked(apolloClient.query).mockRejectedValue(new Error("boom"));

    const wrapper = mountComponent(revealProps);
    await toggle(wrapper).trigger("click");
    await flushPromises();

    expect(value(wrapper)).toBe("metadata.labels.value-unavailable");
  });

  it("only offers to copy once a value is actually on screen", async () => {
    vi.mocked(apolloClient.query).mockResolvedValue({
      data: { Entity: { intialValues: { _key: "elk_fetched" } } },
    } as any);

    const wrapper = mountComponent({ ...revealProps, copyToClipboard: true });
    expect(wrapper.findComponent({ name: "BaseCopyToClipboard" }).exists()).toBe(
      false,
    );

    await toggle(wrapper).trigger("click");
    await flushPromises();

    expect(wrapper.findComponent({ name: "BaseCopyToClipboard" }).exists()).toBe(
      true,
    );
  });
});
