import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { inject, provide, watch } from "vue";
import type { ApolloClient } from "@apollo/client/core";
import { DefaultApolloClient } from "@vue/apollo-composable";
import TenantSwitcher from "../TenantSwitcher.vue";
import useTenant from "@/composables/useTenant";
import { registerQueryFixture } from "@/main";

type Args = { tenants: string[] };

const meta: Meta<Args> = {
  title: "Navigation/TenantSwitcher",
  component: TenantSwitcher as never,
  parameters: {
    docs: {
      description: {
        component:
          "Picks the tenant whose data the app shows, for deployments with " +
          "more than one tenant. It is disabled while a record is being " +
          "edited, so a switch cannot drop unsaved changes.",
      },
    },
  },
  argTypes: { tenants: { control: "object" } },
};

export default meta;
type Story = StoryObj<Args>;

const config = {
  features: { hasTenantSelect: true, hideSuperTenant: true },
};

export const Default: Story = {
  args: { tenants: ["Stadsarchief", "Letterenhuis", "Museum Plantin-Moretus"] },
  render: (args) => ({
    components: { TenantSwitcher },
    setup() {
      provide("config", config);
      const apolloClient = inject(DefaultApolloClient) as ApolloClient<never>;
      const { getTenants } = useTenant(apolloClient, config);
      watch(
        () => args.tenants,
        (tenants) => {
          registerQueryFixture("getTenants", {
            Tenants: {
              __typename: "Entities",
              results: tenants.map((label, index) => ({
                __typename: "Tenant",
                uuid: `tenant:${index}`,
                intialValues: { label, code: `tenant-${index}` },
              })),
            },
          });
          getTenants();
        },
        { deep: true, immediate: true },
      );
    },
    template: `<div style="max-width:320px"><tenant-switcher /></div>`,
  }),
};
