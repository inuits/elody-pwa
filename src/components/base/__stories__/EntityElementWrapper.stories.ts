import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, watch } from "vue";
import EntityElementWrapper from "../EntityElementWrapper.vue";
import { BaseLibraryModes } from "@/generated-types/queries";

type WrapperArgs = {
  label: string;
  entityId: string;
  isCollapsed: boolean;
  baseLibraryMode: BaseLibraryModes;
  useVshowInsteadOfVif: boolean;
  previewLabel: string;
  headerStyle: "normal" | "none";
  content: string;
  onToggleElementCollapse?: (entityId: string, label: string) => void;
};

const meta: Meta<WrapperArgs> = {
  title: "Base/EntityElementWrapper",
  component: EntityElementWrapper,
  argTypes: {
    baseLibraryMode: {
      control: "select",
      options: Object.values(BaseLibraryModes),
    },
    headerStyle: { control: "inline-radio", options: ["normal", "none"] },
    previewLabel: { control: "text" },
    content: { control: "text", description: "Placeholder for the content slot" },
    onToggleElementCollapse: { action: "toggleElementCollapse" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The panel shell around every entity element on a detail page: a " +
          "white card with an accent-light header band that collapses the " +
          "body. Lists, viewers and maps render inside its content slot.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<WrapperArgs>;

const render: Story["render"] = (args) => ({
  components: { EntityElementWrapper },
  setup() {
    const collapsed = ref(args.isCollapsed);
    watch(
      () => args.isCollapsed,
      (value) => (collapsed.value = value),
    );
    const toggle = (entityId: string, label: string) => {
      collapsed.value = !collapsed.value;
      args.onToggleElementCollapse?.(entityId, label);
    };
    return { args, collapsed, toggle };
  },
  template: `
    <div style="max-width:720px">
      <entity-element-wrapper
        :label="args.label"
        :entity-id="args.entityId"
        :is-collapsed="collapsed"
        :base-library-mode="args.baseLibraryMode"
        :use-vshow-instead-of-vif="args.useVshowInsteadOfVif"
        :preview-label="args.previewLabel || undefined"
        :header-style="args.headerStyle"
        @toggle-element-collapse="toggle"
      >
        <template #content><p>{{ args.content }}</p></template>
      </entity-element-wrapper>
    </div>`,
});

const args: WrapperArgs = {
  label: "Media",
  entityId: "d37b9928-cece-54dc-a527-d27f7dce1c9e",
  isCollapsed: false,
  baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  useVshowInsteadOfVif: false,
  previewLabel: "",
  headerStyle: "normal",
  content: "Slot content: a list, viewer or map renders here.",
};

export const Default: Story = { args, render };

export const Collapsed: Story = {
  args: { ...args, label: "Parent (Assets)", isCollapsed: true },
  render,
};
