import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import BreadCrumbs from "../BreadCrumbs.vue";
import {
  breadcrumbRoutes,
  rootRoute,
} from "@/composables/useBreadcrumbs";

/**
 * The trail state is module-level in useBreadcrumbs, so the story seeds it
 * directly: two ancestors and the current record's root title.
 */
const seedTrail = () => {
  breadcrumbRoutes.value = [
    {
      id: "story-work",
      overviewPage: "Werken",
      title: "Battle Chasers (werk)",
      type: "work_word",
    },
    {
      id: "story-expression",
      overviewPage: "Expressies",
      title: "Battle Chasers compleet (expressie)",
      type: "reading",
    },
  ] as never;
  rootRoute.value = {
    rootId: "story-manifestation",
    rootTitle: "Battle Chasers compleet 2",
    typePillLabel: undefined,
  } as never;
};

const configFixture = {
  routerConfig: [{ name: "Home", children: [] }],
  features: {},
};

const meta: Meta<typeof BreadCrumbs> = {
  // Story id components-breadcrumb--default, embedded by navigation.md.
  title: "Components/Breadcrumb",
  component: BreadCrumbs,
  parameters: {
    docs: {
      description: {
        component:
          "The detail header's trail: ancestors collapse behind a counted " +
          "… control, the nearest ancestor stays clickable beside it, and " +
          "the current record's title ends the trail unlinked. The history " +
          "list drops down from the counter; every step is a real button.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BreadCrumbs>;

export const Default: Story = {
  render: () => ({
    components: { BreadCrumbs },
    setup() {
      seedTrail();
      provide("config", configFixture);
      return {};
    },
    template: `
      <div style="min-height:220px;padding:var(--spacing-ds-8)">
        <bread-crumbs />
      </div>`,
  }),
};
