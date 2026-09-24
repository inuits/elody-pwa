import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { reactive } from "vue";

vi.mock("@/main", () => ({ apolloClient: {} }));

vi.mock("@/composables/useComments", () => ({
  extractTaggedRelations: () => [],
  createFieldMetadataFrom: (fields: any[], values: Record<string, any>) =>
    fields
      .filter((field) => values[field.key])
      .map((field) => ({ key: field.key, value: values[field.key] })),
}));

const createdForms: string[] = [];
const formStore = new Map<string, any>();

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    createForm: (key: string, values: any) => {
      createdForms.push(key);
      const form = reactive({
        values,
        setFieldValue: vi.fn(),
        meta: { initialValues: values, valid: true },
      });
      formStore.set(key, form);
      return form;
    },
    getForm: (key: string) => formStore.get(key),
    deleteForm: (key: string) => formStore.delete(key),
    addEditableMetadataKeys: vi.fn(),
  }),
}));

let formExistedAtChildMount: boolean | undefined;
vi.mock("@/components/entityElements/WYSIWYG/EntityElementWYSIWYG.vue", () => ({
  default: {
    name: "EntityElementWYSIWYG",
    props: ["formId", "element", "displayInline"],
    template: "<div class='mock-editor' />",
    mounted() {
      formExistedAtChildMount = formStore.has((this as any).formId);
    },
  },
}));

vi.mock("@/components/base/BaseButtonNew.vue", () => ({
  default: {
    name: "BaseButtonNew",
    props: ["label", "icon", "buttonStyle", "disabled"],
    template: "<button :disabled='disabled'>{{ label }}</button>",
  },
}));

vi.mock("@/components/metadata/MetadataWrapper.vue", () => ({
  default: {
    name: "MetadataWrapper",
    props: ["formId", "metadata", "isEdit", "formFlow"],
    template: "<div class='mock-create-field' />",
  },
}));

const { default: CommentComposer } = await import("../CommentComposer.vue");

const composerElement: any = {
  label: "element-labels.comment-body",
  metadataKey: "body",
  extensions: [],
  taggingConfiguration: {
    taggableEntityConfiguration: [
      {
        tag: "user",
        relationType: "refTaggedUsers",
        taggableEntityType: "user",
      },
    ],
  },
};

const mountComposer = (props: Record<string, unknown> = {}) =>
  mount(CommentComposer, {
    props: {
      scratchFormId: "comment-new-W-1",
      composer: composerElement,
      submitLabel: "Post",
      onSubmit: vi.fn(),
      ...props,
    },
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

  it("clears itself only after the post resolves, never before", async () => {
    formStore.clear();
    let resolvePost: () => void = () => {};
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePost = resolve;
        }),
    );

    const wrapper = mountComposer({
      scratchFormId: "comment-new-W-2",
      onSubmit,
    });
    const form = formStore.get("comment-new-W-2");
    form.values.intialValues.body = "<p>hello</p>";
    await wrapper.vm.$nextTick();

    await wrapper.find("button").trigger("click");
    expect(onSubmit).toHaveBeenCalledWith("<p>hello</p>", [], []);
    // Clearing here would throw the author's text away if the request then failed.
    expect(form.setFieldValue).not.toHaveBeenCalled();

    resolvePost();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(form.setFieldValue).toHaveBeenCalledWith("intialValues.body", "");

    wrapper.unmount();
  });

  it("leaves an edit composer's content alone, since its parent unmounts it", async () => {
    formStore.clear();
    const onSubmit = vi.fn(() => Promise.resolve());

    const wrapper = mountComposer({
      scratchFormId: "comment-edit-CMT-3",
      initialBody: "<p>existing</p>",
      onSubmit,
    });

    await wrapper.find("button").trigger("click");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onSubmit).toHaveBeenCalled();
    expect(
      formStore.get("comment-edit-CMT-3").setFieldValue,
    ).not.toHaveBeenCalled();

    wrapper.unmount();
  });

  it("removes its scratch form on unmount so a remount starts clean", () => {
    formStore.clear();
    const wrapper = mountComposer({ scratchFormId: "comment-reply-CMT-1" });
    expect(formStore.has("comment-reply-CMT-1")).toBe(true);

    wrapper.unmount();
    expect(formStore.has("comment-reply-CMT-1")).toBe(false);
  });

  describe("create fields", () => {
    const categoryField: any = {
      __typename: "PanelMetaData",
      label: "element-labels.comment-category",
      key: "category",
      inputField: { type: "dropdownSingleselectMetadata", options: [] },
    };

    it("renders an editable field per configured create field in its own form", () => {
      formStore.clear();
      const wrapper = mountComposer({
        scratchFormId: "comment-new-W-3",
        createFields: [categoryField],
      });

      const fields = wrapper.findAllComponents({ name: "MetadataWrapper" });
      expect(fields).toHaveLength(1);
      expect(fields[0].props()).toMatchObject({
        formId: "comment-new-W-3",
        metadata: categoryField,
        isEdit: true,
        formFlow: "create",
      });

      wrapper.unmount();
    });

    it("renders no create fields when none are configured", () => {
      formStore.clear();
      const wrapper = mountComposer({ scratchFormId: "comment-new-W-4" });
      expect(wrapper.findAll(".mock-create-field")).toHaveLength(0);
      wrapper.unmount();
    });

    it("seeds an empty value per create field so the form knows the field", () => {
      formStore.clear();
      const wrapper = mountComposer({
        scratchFormId: "comment-new-W-5",
        createFields: [categoryField],
      });
      expect(formStore.get("comment-new-W-5").values.intialValues).toEqual({
        body: "",
        category: "",
      });
      wrapper.unmount();
    });

    it("submits the filled in create fields as metadata and clears them", async () => {
      formStore.clear();
      const onSubmit = vi.fn(() => Promise.resolve());
      const wrapper = mountComposer({
        scratchFormId: "comment-new-W-6",
        createFields: [categoryField],
        onSubmit,
      });
      const form = formStore.get("comment-new-W-6");
      form.values.intialValues.body = "<p>hello</p>";
      form.values.intialValues.category = "Fictie";
      await wrapper.vm.$nextTick();

      await wrapper.find("button").trigger("click");
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(onSubmit).toHaveBeenCalledWith(
        "<p>hello</p>",
        [],
        [{ key: "category", value: "Fictie" }],
      );
      expect(form.setFieldValue).toHaveBeenCalledWith(
        "intialValues.category",
        "",
      );

      wrapper.unmount();
    });

    it("blocks posting while the form is invalid, e.g. a required create field is empty", async () => {
      formStore.clear();
      const onSubmit = vi.fn();
      const wrapper = mountComposer({
        scratchFormId: "comment-new-W-7",
        createFields: [categoryField],
        onSubmit,
      });
      const form = formStore.get("comment-new-W-7");
      form.values.intialValues.body = "<p>hello</p>";
      form.meta.valid = false;
      await wrapper.vm.$nextTick();

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
      await wrapper.find("button").trigger("click");
      expect(onSubmit).not.toHaveBeenCalled();

      wrapper.unmount();
    });
  });
});
