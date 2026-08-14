import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import TenantSwitcher from "./TenantSwitcher.vue";

// Dropdown in the header to switch the active tenant. The tenant list comes
// from a GetTenants query — empty with the Storybook Apollo client — so the
// dropdown renders with its label and an empty option list.
const meta: Meta<typeof TenantSwitcher> = {
  title: "Menu/TenantSwitcher",
  component: TenantSwitcher,
  tags: ["autodocs"],
  render: () => ({
    components: { TenantSwitcher },
    setup() {
      provide("config", {
        customization: {},
        features: { hasTenantSelect: true, hideSuperTenant: false },
      });
    },
    template: '<div class="w-96 p-4"><TenantSwitcher /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof TenantSwitcher>;

export const Default: Story = {};
