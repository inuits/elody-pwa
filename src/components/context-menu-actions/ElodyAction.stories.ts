import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import ElodyAction from "./ElodyAction.vue";
import { useEditMode } from "@/composables/useEdit";
import {
  ContextMenuElodyActionEnum,
  DamsIcons,
  Entitytyping,
  RouteNames,
} from "@/generated-types/queries";

// Context-menu item for built-in Elody actions (delete relation/entity,
// update metadata, share, download query result, …). Delete actions are
// disabled while the parent entity is in edit mode.
const storyConfig = {
  customization: {},
  features: { hasTenantSelect: false, hideSuperTenant: false },
  routerConfig: [{ name: RouteNames.Home, children: [] }],
};

const baseArgs = {
  entityType: Entitytyping.Mediafile,
  entityId: "mediafile-1",
  parentEntityId: "manifestation-1",
  bulkOperationsContext: undefined,
  refetchEntities: () => undefined,
};

const meta: Meta<typeof ElodyAction> = {
  title: "ContextMenuActions/ElodyAction",
  component: ElodyAction,
  tags: ["autodocs"],
  argTypes: {
    action: {
      control: "select",
      options: Object.values(ContextMenuElodyActionEnum),
    },
  },
  render: (args) => ({
    components: { ElodyAction },
    setup() {
      provide("config", storyConfig);
      // Edit state is a module singleton: drop it so a previous visit to
      // the DisabledDuringEdit story doesn't leak into this one. Deleting
      // recreates a fresh (non-edit) state on next access; assigning
      // `isEdit.value` directly doesn't work because the state is stored in
      // a reactive record, which hands the ref back unwrapped.
      useEditMode("GlobalEditState", "delete");
      return { args };
    },
    template:
      '<div class="w-72 rounded-md border border-neutral-50 bg-neutral-0 py-1"><ElodyAction v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof ElodyAction>;

export const DeleteRelation: Story = {
  args: {
    ...baseArgs,
    label: "contextMenu.contextMenuElodyAction.deleteRelation",
    icon: DamsIcons.Trash,
    action: ContextMenuElodyActionEnum.DeleteRelation,
  },
};

export const UpdateMetadata: Story = {
  args: {
    ...baseArgs,
    label: "contextMenu.contextMenuElodyAction.updateMetadata",
    icon: DamsIcons.EditAlt,
    action: ContextMenuElodyActionEnum.UpdateMetadata,
    formQuery: "GetMediafileEditForm",
  },
};

export const Share: Story = {
  args: {
    ...baseArgs,
    label: "contextMenu.contextMenuElodyAction.share",
    icon: DamsIcons.Link,
    action: ContextMenuElodyActionEnum.Share,
  },
};

// Delete actions get disabled (with an explanatory tooltip) while the parent
// entity is in edit mode.
export const DisabledDuringEdit: Story = {
  args: {
    ...baseArgs,
    label: "contextMenu.contextMenuElodyAction.deleteRelation",
    icon: DamsIcons.Trash,
    action: ContextMenuElodyActionEnum.DeleteRelation,
  },
  render: (args) => ({
    components: { ElodyAction },
    setup() {
      provide("config", storyConfig);
      // No entityFormData is injected in Storybook, so the component falls
      // back to the global edit state.
      useEditMode().enableEdit();
      return { args };
    },
    template:
      '<div class="w-72 rounded-md border border-neutral-50 bg-neutral-0 py-1"><ElodyAction v-bind="args" /></div>',
  }),
};
