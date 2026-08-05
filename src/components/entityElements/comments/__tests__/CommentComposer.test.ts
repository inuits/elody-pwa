/**
 * Mount test for the composer.
 *
 * It exists for one specific regression: EntityElementWYSIWYG reads its form inside
 * its own onMounted, and a child's onMounted runs BEFORE its parent's. If the composer
 * creates its scratch form in onMounted rather than synchronously in setup, the editor
 * finds no form, every keystroke no-ops in setFieldValue, and the composer can never
 * report content — while still rendering perfectly and passing lint.
 */
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

vi.mock("@/main", () => ({ apolloClient: {} }));

// Kept deliberately light. useEdit.test.ts calls vi.resetModules() and re-imports its
// whole graph per test against a 5s timeout, so every heavy module this file pulls into
// the shared registry pushes that pre-existing test closer to timing out. Only the one
// helper the composer actually uses is stubbed in.
vi.mock("@/composables/useComments", () => ({
  extractTaggedRelations: () => [],
}));

const createdForms: string[] = [];
const formStore = new Map<string, any>();

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    createForm: (key: string, values: any) => {
      createdForms.push(key);
      const form = {
        values,
        setFieldValue: vi.fn(),
        meta: { initialValues: values },
      };
      formStore.set(key, form);
      return form;
    },
    getForm: (key: string) => formStore.get(key),
    deleteForm: (key: string) => formStore.delete(key),
    addEditableMetadataKeys: vi.fn(),
  }),
}));

// Stand in for the real editor element: it asserts, at child-onMounted time, that the
// parent's scratch form already exists.
let formExistedAtChildMount: boolean | undefined;
vi.mock(
  "@/components/entityElements/WYSIWYG/EntityElementWYSIWYG.vue",
  () => ({
    default: {
      name: "EntityElementWYSIWYG",
      props: ["formId", "element", "displayInline"],
      template: "<div class='mock-editor' />",
      mounted() {
        formExistedAtChildMount = formStore.has((this as any).formId);
      },
    },
  }),
);

// Deliberately NOT mocking @/composables/useEdit: doing so leaks into the shared
// module registry and breaks useEdit.test.ts when both files run in one worker. The
// real composable is harmless here — the composer only calls enableEdit().

vi.mock("@/components/base/BaseButtonNew.vue", () => ({
  default: {
    name: "BaseButtonNew",
    props: ["label", "icon", "buttonStyle", "disabled"],
    template: "<button :disabled='disabled'>{{ label }}</button>",
  },
}));

const { default: CommentComposer } = await import("../CommentComposer.vue");

const composerElement: any = {
  label: "element-labels.comment-body",
  metadataKey: "body",
  extensions: [],
  taggingConfiguration: {
    taggableEntityConfiguration: [
      { tag: "user", relationType: "refTaggedUsers", taggableEntityType: "user" },
    ],
  },
};

const mountComposer = (props: Record<string, unknown> = {}) =>
  mount(CommentComposer, {
    props: {
      scratchFormId: "comment-new-W-1",
      composer: composerElement,
      submitLabel: "Post",
      ...props,
    },
    // The editor child must NOT be stubbed: its mounted hook is what records whether
    // the parent's form already existed.
    global: { mocks: { $t: (key: string) => key } },
  } as any);

describe("CommentComposer", () => {
  it("creates its scratch form before the editor child mounts", () => {
    formExistedAtChildMount = undefined;
    createdForms.length = 0;
    formStore.clear();

    const wrapper = mountComposer();

    expect(createdForms).toContain("comment-new-W-1");
    // The assertion that matters: creating the form in onMounted makes this false.
    expect(formExistedAtChildMount).toBe(true);

    wrapper.unmount();
  });

  it("seeds the form with the initial body under the configured metadata key", () => {
    createdForms.length = 0;
    formStore.clear();

    const wrapper = mountComposer({
      scratchFormId: "comment-edit-CMT-9",
      initialBody: "<p>existing</p>",
    });

    expect(formStore.get("comment-edit-CMT-9").values.intialValues.body).toBe(
      "<p>existing</p>",
    );

    wrapper.unmount();
  });

  it("removes its scratch form on unmount so a remount starts clean", () => {
    formStore.clear();
    const wrapper = mountComposer({ scratchFormId: "comment-reply-CMT-1" });
    expect(formStore.has("comment-reply-CMT-1")).toBe(true);

    wrapper.unmount();
    expect(formStore.has("comment-reply-CMT-1")).toBe(false);
  });
});
