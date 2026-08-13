import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseTab from "./BaseTab.vue";
import BaseTabs from "./BaseTabs.vue";

// BaseTab registers itself with the "TabsProvider" injection from BaseTabs,
// so stories always render it inside a BaseTabs parent.
const meta: Meta<typeof BaseTab> = {
  title: "Components/BaseTab",
  component: BaseTab,
  tags: ["autodocs"],
  render: () => ({
    components: { BaseTabs, BaseTab },
    template: `
      <div class="w-[36rem] p-4">
        <BaseTabs :tabs="['Beschrijving', 'Media']" :tab-navigation-disabled="false">
          <BaseTab>
            <p class="font-bold">Portret van een dame</p>
            <p>Olieverf op doek, ca. 1650. Objectnummer 1902-C-14.</p>
          </BaseTab>
          <BaseTab>
            <p>3 mediafiles: voorzijde.tiff, keerzijde.tiff, detail_signatuur.jpg</p>
          </BaseTab>
        </BaseTabs>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof BaseTab>;

export const InsideBaseTabs: Story = {};
