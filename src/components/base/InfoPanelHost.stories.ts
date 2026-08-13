import type { Meta, StoryObj } from "@storybook/vue3-vite";
import InfoPanelHost from "./InfoPanelHost.vue";
import BaseButtonNew from "./BaseButtonNew.vue";
import { useInfoPanel } from "@/composables/useInfoPanel";

const meta: Meta<typeof InfoPanelHost> = {
  title: "Base/InfoPanelHost",
  component: InfoPanelHost,
  tags: ["autodocs"],
  // Renders whatever panel is active in the useInfoPanel composable state;
  // the story drives that state with a button.
  render: () => ({
    components: { InfoPanelHost, BaseButtonNew },
    setup() {
      const { openPanel } = useInfoPanel();
      const open = () =>
        openPanel({
          title: "Handleiding metadata invoer",
          content:
            "<p>Vul minstens een <strong>titel</strong> en een <strong>objectnummer</strong> in. " +
            "Datums volgen het formaat <code>DD/MM/JJJJ</code>.</p>",
        });
      return { open };
    },
    template: `
      <div class="h-96 p-4">
        <BaseButtonNew
          label="Open info panel"
          button-style="accentAccent"
          :force-show-label="true"
          @click="open"
        />
        <InfoPanelHost />
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof InfoPanelHost>;

export const Default: Story = {};
