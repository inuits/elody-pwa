import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ChangesPreview from "../ChangesPreview.vue";
import {
  changeRequest,
  changesPreviewConfig,
  providePreviewConfig,
  registerChangedEntity,
  registerPreviewFixtures,
} from "./previewFixtures";

const meta: Meta<typeof ChangesPreview> = {
  title: "Components/ChangesPreview",
  component: ChangesPreview,
  parameters: {
    docs: {
      description: {
        component:
          "The right half of a changes preview: the related entity's fields that the change touches, " +
          "under the window's label as a block heading, then any changed lists. Fields the change does not touch are left out.",
      },
    },
  },
  argTypes: {
    changesPreview: { control: "object" },
    entity: { control: "object" },
  },
  render: (args) => ({
    components: { ChangesPreview },
    setup() {
      registerPreviewFixtures();
      registerChangedEntity();
      providePreviewConfig();
      return { args };
    },
    template: `
      <div style="max-width:420px;background:var(--color-surface);padding:16px">
        <changes-preview :key="JSON.stringify(args)" v-bind="args" />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof ChangesPreview>;

export const Default: Story = {
  args: {
    changesPreview: changesPreviewConfig as never,
    entity: changeRequest as never,
  },
};
