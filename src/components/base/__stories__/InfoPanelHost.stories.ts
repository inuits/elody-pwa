import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onUnmounted, watch } from "vue";
import InfoPanelHost from "../InfoPanelHost.vue";
import { useInfoPanel } from "@/composables/useInfoPanel";

type HostArgs = { open: boolean; title: string; content: string };

const meta: Meta<HostArgs> = {
  title: "Base/InfoPanelHost",
  component: InfoPanelHost,
  parameters: {
    docs: {
      description: {
        component:
          "Mounted once in AppModals. It shows the info panel that " +
          "useInfoPanel().openPanel() asked for, and clears it on close.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<HostArgs>;

export const Default: Story = {
  args: {
    open: true,
    title: "About this field",
    content: "<p>Opened through <code>useInfoPanel().openPanel()</code>.</p>",
  },
  render: (args) => ({
    components: { InfoPanelHost },
    setup() {
      const { openPanel, closePanel } = useInfoPanel();
      watch(
        () => [args.open, args.title, args.content],
        () =>
          args.open
            ? openPanel({ title: args.title, content: args.content })
            : closePanel(),
        { immediate: true },
      );
      onUnmounted(closePanel);
    },
    template: `<div style="min-height:320px"><info-panel-host /></div>`,
  }),
};
