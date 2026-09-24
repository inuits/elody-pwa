import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

vi.mock("@/main", () => ({ apolloClient: {} }));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => `t:${key}` }),
}));

vi.mock("@/components/SanitizedHtml.vue", () => ({
  default: { name: "SanitizedHtml", props: ["content"], template: "<div />" },
}));

vi.mock("@/helpers", () => ({
  convertDateToReadbleFormat: () => "",
}));

vi.mock("@/components/metadata/MetadataFormatter.vue", () => ({
  default: {
    name: "MetadataFormatter",
    props: ["formatter", "label", "valueOptions"],
    template: "<span class='mock-formatter'>{{ label }}</span>",
  },
}));

const { default: CommentItem } = await import("../CommentItem.vue");

const categoryField: any = {
  __typename: "PanelMetaData",
  label: "element-labels.comment-category",
  key: "category",
  inputField: {
    type: "dropdownSingleselectMetadata",
    options: [
      { label: "dropdown-labels.comment-category-fiction", value: "Fictie" },
    ],
  },
};

const comment = (intialValues: Record<string, unknown>): any => ({
  id: "CMT-1",
  uuid: "CMT-1",
  type: "comment",
  intialValues: { body: "<p>x</p>", ...intialValues },
});

describe("CommentItem create fields", () => {
  it("renders every filled in create field with the formatter it was fetched with", () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: comment({
          category: { formatter: "pill|auto", label: "Fictie" },
        }),
        createFields: [categoryField],
      },
    });

    const formatters = wrapper.findAllComponents({ name: "MetadataFormatter" });
    expect(formatters).toHaveLength(1);
    expect(formatters[0].props()).toEqual({
      formatter: "pill|auto",
      label: "Fictie",
      valueOptions: categoryField.inputField.options,
    });
  });

  it("places the create fields next to the status, before the comment body", () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: comment({
          category: { formatter: "pill|auto", label: "Fictie" },
        }),
        createFields: [categoryField],
        status: "open",
      },
    });

    const createFields = wrapper.find("[data-testid='comment-create-fields']");
    const status = wrapper.find("[data-testid='comment-status']");
    expect(createFields.element.parentElement).toBe(
      status.element.parentElement,
    );
    expect(
      createFields.element.compareDocumentPosition(status.element) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows the translated option label of a value fetched without formatter", () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: comment({ category: "Fictie" }),
        createFields: [categoryField],
      },
    });

    expect(wrapper.find("[data-testid='comment-create-fields']").text()).toBe(
      "t:dropdown-labels.comment-category-fiction",
    );
  });

  it("shows nothing for a create field the comment has no value for", () => {
    const wrapper = mount(CommentItem, {
      props: { comment: comment({}), createFields: [categoryField] },
    });
    expect(wrapper.find("[data-testid='comment-create-fields']").exists()).toBe(
      false,
    );
  });
});
