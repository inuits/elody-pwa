import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import MenuNav from "./MenuNav.vue";

// The full sidebar navigation. Menu items come from the GetMenu query —
// empty with the Storybook Apollo client — so the story shows the chrome:
// logo, environment pill and the login/logout section.
const meta: Meta<typeof MenuNav> = {
  title: "Menu/MenuNav",
  component: MenuNav,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof MenuNav>;

const renderWithEnvironment = (environment?: string) => () => ({
  components: { MenuNav },
  setup() {
    provide("config", {
      customization: {},
      features: { hasTenantSelect: false, hideSuperTenant: false },
      DEPLOYMENT_ENVIRONMENT: environment,
    });
  },
  template: '<div class="h-screen"><MenuNav /></div>',
});

export const Default: Story = {
  render: renderWithEnvironment(undefined),
};

// Non-production deployments show an environment pill under the logo.
export const WithEnvironmentPill: Story = {
  render: renderWithEnvironment("uat"),
};
