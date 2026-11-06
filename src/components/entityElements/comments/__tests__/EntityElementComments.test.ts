import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

const thread = (id: string, status: string): any => ({
  subject: { id, uuid: id, type: "comment", intialValues: {} },
  replies: [],
  replyCount: 0,
  status,
});

const threads = [
  thread("CMT-1", "open"),
  thread("CMT-2", "resolved"),
  thread("CMT-3", "archived"),
];

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => `t:${key}` }),
}));

vi.mock("@/composables/useComments", () => ({
  createFieldsOf: () => [],
  useComments: () => ({
    threadsFor: () => threads,
    isLoadingFor: () => false,
    load: vi.fn(),
    post: vi.fn(),
  }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ openModal: vi.fn() }),
}));

vi.mock("@/composables/useEntityPageConfig", () => ({
  useEntityPageConfig: () => ({ seenTrackingForType: () => undefined }),
}));

vi.mock("@/composables/useSeenItems", () => ({
  useSeenState: () => ({ isNew: () => false }),
}));

vi.mock("@/generated-types/queries", () => ({
  DamsIcons: {},
  Entitytyping: { Comment: "comment" },
  ModalStyle: {},
  TypeModals: {},
}));

vi.mock("@/components/base/BaseButtonNew.vue", () => ({
  default: { name: "BaseButtonNew", template: "<button />" },
}));

vi.mock("@/components/base/EntityElementWrapper.vue", () => ({
  default: {
    name: "EntityElementWrapper",
    template: "<div><slot name='content' /></div>",
  },
}));

vi.mock("@/components/entityElements/comments/CommentComposer.vue", () => ({
  default: { name: "CommentComposer", template: "<div />" },
}));

vi.mock("@/components/entityElements/comments/CommentItem.vue", () => ({
  default: {
    name: "CommentItem",
    props: ["comment", "status"],
    template: "<div class='comment-item' />",
  },
}));

const { default: EntityElementComments } =
  await import("../EntityElementComments.vue");

describe("EntityElementComments", () => {
  it("shows every thread of the entity, archived ones included", () => {
    const wrapper = mount(EntityElementComments, {
      props: {
        element: { label: "comments", readOnly: true } as any,
        id: "M-1",
      },
    });

    const items = wrapper.findAllComponents({ name: "CommentItem" });
    expect(items.map((item) => item.props("comment").id)).toEqual([
      "CMT-1",
      "CMT-2",
      "CMT-3",
    ]);
    expect(items[2].props("status")).toBe("archived");
  });
});
