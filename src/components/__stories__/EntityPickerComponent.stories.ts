import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { nextTick, onMounted, provide, watch } from "vue";
import EntityPickerComponent from "../EntityPickerComponent.vue";
import DynamicFormModal from "@/components/dynamicForms/DynamicFormModal.vue";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";
import { useBaseModal } from "@/composables/useBaseModal";
import { useStateManagement } from "@/composables/useStateManagement";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import {
  BaseFieldType,
  EntityPickerSearchMode,
  ModalStyle,
  TypeModals,
  ViewModes,
} from "@/generated-types/queries";
import { registerQueryFixture } from "@/main";
import { registerLibraryFixtures } from "@/components/library/__stories__/libraryFixtures";
import { registerFilterFixtures } from "@/components/filters/__stories__/filterFixtures";

const asset = (id: string, title: string, year: string) => ({
  __typename: "Asset",
  id,
  uuid: id,
  type: "asset",
  intialValues: { __typename: "IntialValues", title, publication_year: year },
  allowedViewModes: {
    __typename: "AllowedViewModes",
    viewModes: [
      {
        __typename: "ViewModesWithConfig",
        viewMode: ViewModes.ViewModesList,
        config: [],
      },
    ],
  },
  teaserMetadata: {
    __typename: "teaserMetadata",
    title: {
      __typename: "PanelMetaData",
      key: "title",
      label: "Title",
      value: title,
    },
    publication_year: {
      __typename: "PanelMetaData",
      key: "publication_year",
      label: "Year of publication",
      value: year,
    },
  },
});

const assets = [
  asset("a-1", "The Adventures of Tintin", "1946"),
  asset("a-2", "The Smurfs and the Magic Flute", "1959"),
  asset("a-3", "Spike and Suzy: The Wild Weeping Willow", "1953"),
  asset("a-4", "Lucky Luke: Dalton City", "1969"),
  asset("a-5", "Gaston: Gala of Goofs", "1966"),
];

const registerFixtures = () => {
  registerLibraryFixtures();
  registerFilterFixtures();
  registerQueryFixture("GetBulkOperations", {
    BulkOperations: { __typename: "Asset" },
  });
  registerQueryFixture("getPreviewComponents", {
    PreviewComponents: { __typename: "Asset", previewComponent: null },
  });
  registerQueryFixture("getEntities", {
    Entities: {
      __typename: "EntitiesResults",
      count: assets.length,
      limit: 20,
      facets: [],
      results: assets,
    },
  });
};

const pickerForm = (mode?: EntityPickerSearchMode) => ({
  GetDynamicForm: {
    __typename: "Form",
    import: {
      __typename: "FormTab",
      formFields: {
        __typename: "FormFields",
        entityPicker: {
          __typename: "PanelMetaData",
          key: "entityPicker",
          label: "metadata.labels.entity-picker",
          inputField: {
            __typename: "InputField",
            type: BaseFieldType.BaseEntityPickerField,
            entityPickerSearchConfig: mode
              ? {
                  __typename: "EntityPickerSearchConfig",
                  mode,
                  metadataKeys: ["title"],
                  acceptedTypes: [],
                  staticFilters: [],
                }
              : null,
          },
        },
      },
    },
  },
});

const modal = () => document.querySelector<HTMLElement>("dialog[open]");
const waitFor = async <T>(find: () => T | null | undefined, tries = 160) => {
  for (let i = 0; i < tries && !find(); i++)
    await new Promise((resolve) => setTimeout(resolve, 50));
  return find();
};

const render =
  (options: { linked?: string[]; mode?: EntityPickerSearchMode } = {}) =>
  () => ({
    components: { DynamicFormModal },
    setup() {
      registerFixtures();
      registerQueryFixture("GetEntityPickerForm", { GetDynamicForm: null });
      useStateManagement().updateGlobalState("_displayPreferences", {
        lang: "en",
      });
      provide("config", {
        features: {},
        routerConfig: [{ name: "Home", children: [] }],
      });
      const picker = useEntityPickerModal();
      picker.resetState();
      picker.setAcceptedTypes(["asset" as never]);
      picker.setEntityUuid("story-parent");
      picker.setEntityId("story-parent");
      picker.setParentEntityType(["asset" as never]);
      picker.setRelationType("hasAsset");
      picker.setRefetchEntitiesFunction(async () => ({
        results: (options.linked ?? []).map((id) => ({ id })),
      }));
      useBulkOperations().dequeueAllItemsForBulkProcessing(
        BulkOperationsContextEnum.EntityElementListEntityPickerModal,
      );
      const { dynamicForm, dynamicFormLoaded } = useDynamicForm();
      watch(dynamicFormLoaded, (loaded) => {
        if (loaded) dynamicForm.value = pickerForm(options.mode);
      });
      const { openModal, closeModal, getModalInfo } = useBaseModal();
      onMounted(async () => {
        if (getModalInfo(TypeModals.DynamicForm).open)
          closeModal(TypeModals.DynamicForm);
        await nextTick();
        openModal(
          TypeModals.DynamicForm,
          ModalStyle.CenterWide,
          "GetEntityPickerForm",
          undefined,
          false,
          undefined,
          { title: "Add existing assets" },
        );
      });
    },
    template: `<dynamic-form-modal />`,
  });

const meta: Meta<typeof EntityPickerComponent> = {
  title: "Modals/EntityPicker",
  component: EntityPickerComponent,
  parameters: {
    docs: {
      description: {
        component:
          "The library picker: a list of entities with filters and " +
          "checkboxes inside the form modal. Confirm selection links the " +
          "selected entities to the open entity.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EntityPickerComponent>;

export const Default: Story = { render: render() };

export const FiltersOpen: Story = {
  name: "Filters open",
  render: render(),
  play: async () => {
    await waitFor(() => modal()?.querySelector("[data-cy=list-item]"));
    const toggle = await waitFor(() =>
      modal()?.querySelector<HTMLElement>("[data-cy=filters-toggle]"),
    );
    toggle?.click();
  },
};

export const Selected: Story = {
  render: render(),
  play: async () => {
    await waitFor(() => modal()?.querySelectorAll("[data-cy=list-item]")[2]);
    const rows = modal()!.querySelectorAll<HTMLElement>(
      "[data-cy=list-item] input[type=checkbox]",
    );
    rows[0]?.click();
    rows[2]?.click();
  },
};

export const AlreadyLinked: Story = {
  name: "Already linked",
  render: render({ linked: ["a-2", "a-4"] }),
};

export const SearchMode: Story = {
  name: "Search mode",
  render: render({ mode: EntityPickerSearchMode.Search }),
};
