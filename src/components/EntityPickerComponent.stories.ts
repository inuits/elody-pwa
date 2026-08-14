import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import EntityPickerComponent from "./EntityPickerComponent.vue";
import { EntityPickerMode, RouteNames } from "@/generated-types/queries";

// The relation picker: an embedded library in confirm-selection mode
// (search pill, result rows, selected state, confirm). Titled
// "Modals/EntityPicker" so the manifest id `modals-entitypicker--default`
// resolves. Results come from the backend; under Storybook's mock client the
// story shows the picker chrome with the list in its empty/loading state.
const meta: Meta<typeof EntityPickerComponent> = {
  title: "Modals/EntityPicker",
  component: EntityPickerComponent,
  tags: ["autodocs"],
  decorators: [
    () => ({
      // The embedded BaseLibrary reads home routes from the injected config.
      setup() {
        provide("config", {
          customization: {},
          features: {},
          routerConfig: [{ name: RouteNames.Home, children: [] }],
        });
      },
      template: '<div class="h-[480px] p-4"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof EntityPickerComponent>;

export const Default: Story = {
  args: {
    entityUuid: "storybook-entity-1",
    acceptedTypes: ["person"],
    customQuery: "GetEntities",
    showButton: true,
    enableBulkOperations: true,
    enableAdvancedFilters: false,
    entityPickerMode: EntityPickerMode.Emit,
    baseLibraryHeight: "360px",
    selectionEnabled: true,
  },
};
