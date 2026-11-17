import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { nextTick, onMounted, provide } from "vue";
import { useRouter } from "vue-router";
import EntityPickerComponent from "../EntityPickerComponent.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";
import { useBaseModal } from "@/composables/useBaseModal";
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
  allowedViewModes: null,
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

const pickerField = (mode?: EntityPickerSearchMode) => ({
  picker: {
    __typename: "PanelMetaData",
    key: "picker",
    label: "",
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
    components: { BaseModal, DynamicForm },
    setup() {
      registerFixtures();
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
      const { openModal, closeModal, getModalInfo } = useBaseModal();
      onMounted(async () => {
        if (getModalInfo(TypeModals.DynamicForm).open)
          closeModal(TypeModals.DynamicForm);
        await nextTick();
        openModal(TypeModals.DynamicForm, ModalStyle.CenterWide);
      });
      return {
        TypeModals,
        router: useRouter(),
        fields: pickerField(options.mode),
        open: () => getModalInfo(TypeModals.DynamicForm).open,
        close: () => closeModal(TypeModals.DynamicForm),
      };
    },
    template: `
      <base-modal
        :modal-type="TypeModals.DynamicForm"
        :cancel-button-availabe="false"
        modal-color="bg-background-light"
        modal-height-style="max-h-[90vh]"
        title="Add existing assets"
        @hide-modal="close"
      >
        <div class="flex flex-col w-full pt-4">
          <dynamic-form
            v-if="open()"
            dynamic-form-query="StoryAddExistingAssets"
            :router="router"
            :modal-form-fields="fields"
            :show-form-title="false"
          />
        </div>
      </base-modal>`,
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
