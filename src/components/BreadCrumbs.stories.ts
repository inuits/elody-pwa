import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BreadCrumbs from "./BreadCrumbs.vue";
import {
  breadcrumbRoutes,
  rootRoute,
  type BreadcrumbRoute,
} from "@/composables/useBreadcrumbs";

// BreadCrumbs renders from module-level breadcrumb state (normally filled
// while navigating entity detail pages); the stories seed that state.
const seedBreadcrumbs = (routes: BreadcrumbRoute[], rootTitle: string) => {
  breadcrumbRoutes.value = routes;
  rootRoute.value = {
    rootId: "asset-1902-c-14",
    rootTitle,
    typePillLabel: undefined,
  };
};

const meta: Meta<typeof BreadCrumbs> = {
  title: "Components/BreadCrumbs",
  component: BreadCrumbs,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof BreadCrumbs>;

export const WithHistory: Story = {
  render: () => ({
    components: { BreadCrumbs },
    setup() {
      seedBreadcrumbs(
        [
          {
            id: "",
            overviewPage: "Assets",
            title: "Collectie Schone Kunsten",
            type: "asset",
          },
          {
            id: "asset-1898-a-02",
            overviewPage: "",
            title: "Deelcollectie Barokschilderkunst",
            type: "asset",
          },
        ],
        "Portret van een dame (1902-C-14)",
      );
    },
    template: '<div class="p-4 h-40 relative"><BreadCrumbs /></div>',
  }),
};

export const RootOnly: Story = {
  render: () => ({
    components: { BreadCrumbs },
    setup() {
      seedBreadcrumbs([], "Mediafiles");
    },
    template: '<div class="p-4 h-24 relative"><BreadCrumbs /></div>',
  }),
};
