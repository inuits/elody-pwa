import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { nextTick, onMounted, provide } from "vue";
import BulkOperationsModal from "../BulkOperationsModal.vue";
import BulkOperationsEditModal from "../BulkOperationsEditModal.vue";
import ConfirmModal from "@/components/base/ConfirmModal.vue";
import ConfirmModalView from "@/components/ConfirmModalView.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useModalActions } from "@/composables/useModalActions";
import { useBulkEditForm } from "@/composables/useBulkEditForm";
import { useBlockingLoader } from "@/composables/useBlockingLoader";
import { useFormHelper } from "@/composables/useFormHelper";
import {
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import {
  ActionType,
  BulkEditModes,
  DamsIcons,
  InputFieldTypes,
  ModalStyle,
  RouteNames,
  TypeModals,
  ValidationRules,
} from "@/generated-types/queries";
import { PENDING_QUERY, registerQueryFixture } from "@/main";
import { registerLibraryFixtures } from "@/components/library/__stories__/libraryFixtures";

const context = RouteNames.Assets;
const formQueries = ["GetAssetCreateForm", "GetSetCreateForm"];

const field = (
  key: string,
  label: string,
  type: InputFieldTypes,
  required = false,
  extra: Record<string, unknown> = {},
) => ({
  __typename: "PanelMetaData",
  key,
  label,
  inputField: {
    __typename: "InputField",
    type,
    ...extra,
    validation: required
      ? { __typename: "Validation", value: [ValidationRules.Required] }
      : null,
  },
});

const tagsField = field(
  "hasTag",
  "Tags",
  InputFieldTypes.DropdownMultiselectRelations,
  false,
  {
    entityType: "tag",
    relationType: "hasTag",
    advancedFilterInputForRetrievingOptions: [
      { type: "text", key: ["name"], value: "*", match_exact: false },
    ],
    advancedFilterInputForSearchingOptions: {
      type: "text",
      key: ["name"],
      value: "*",
      match_exact: false,
      item_types: ["tag"],
    },
  },
);

const form = (type: string, fields: Record<string, unknown>) => ({
  GetDynamicForm: {
    __typename: "Form",
    label: `navigation.create-${type}`,
    [type]: {
      __typename: "FormTab",
      formFields: {
        __typename: "FormFields",
        ...fields,
        createAction: {
          __typename: "FormAction",
          label: "actions.labels.create",
          icon: DamsIcons.Create,
          actionType: ActionType.Submit,
          actionQuery: "CreateEntity",
          creationType: type,
        },
      },
    },
  },
});

const tag = (id: string, name: string) => ({
  __typename: "BaseEntity",
  id,
  uuid: id,
  type: "tag",
  intialValues: { __typename: "IntialValues", name },
});

const tags = [
  tag("t-1", "Harbour"),
  tag("t-2", "Fishing"),
  tag("t-3", "Lighthouse"),
];

const registerFixtures = () => {
  registerLibraryFixtures();
  registerQueryFixture(
    "GetAssetCreateForm",
    form("asset", {
      title: field("title", "Title", InputFieldTypes.Text, true),
      description: field(
        "description",
        "Description",
        InputFieldTypes.Textarea,
      ),
      rights: field("rights", "Rights statement", InputFieldTypes.Text),
      hasTag: tagsField,
    }),
  );
  registerQueryFixture(
    "GetSetCreateForm",
    form("set", {
      title: field("title", "Title", InputFieldTypes.Text, true),
      description: field(
        "description",
        "Description",
        InputFieldTypes.Textarea,
      ),
      rights: field("rights", "Rights statement", InputFieldTypes.Text),
    }),
  );
  registerQueryFixture("getEntities", {
    Entities: {
      __typename: "EntitiesResults",
      count: tags.length,
      limit: 20,
      facets: [],
      results: tags,
    },
  });
};

const item = (id: string, type: string, title: string, kind: string) => ({
  id,
  type,
  teaserMetadata: [
    { key: "title", label: "Title", value: title },
    { key: "type", label: "Type", value: kind },
  ],
});

const selection = [
  item("a-1", "asset", "Tales from the North Sea", "Asset"),
  item("a-2", "asset", "Coastal Fishing in the 20th Century", "Asset"),
  item("s-1", "set", "Ostend harbour, 1950s", "Set"),
] as InBulkProcessableItem[];

const openBulkEdit = async () => {
  const { openModal, closeAllModals } = useBaseModal();
  const { enqueueItemForBulkProcessing, dequeueAllItemsForBulkProcessing } =
    useBulkOperations();
  const { initializePropertiesForBulkUpdateMetadata, setCallbackFunctions } =
    useModalActions();
  closeAllModals();
  dequeueAllItemsForBulkProcessing(context);
  selection.forEach((entry) => enqueueItemForBulkProcessing(context, entry));
  initializePropertiesForBulkUpdateMetadata(selection);
  setCallbackFunctions([]);
  await nextTick();
  openModal(
    TypeModals.BulkOperationsEdit,
    ModalStyle.CenterWide,
    formQueries[0],
    undefined,
    true,
    context,
    { formQueries },
  );
};

const render = () => () => ({
  components: { BulkOperationsModal, ConfirmModal, ConfirmModalView },
  setup() {
    registerFixtures();
    useBulkEditForm().clearBulkEditFormCache();
    useBlockingLoader().stopBlocking();
    provide("config", {
      features: { hasBulkSelect: true },
      bulkSelectAllSizeLimit: 20,
    });
    onMounted(openBulkEdit);
  },
  template: `
    <bulk-operations-modal />
    <confirm-modal><confirm-modal-view /></confirm-modal>`,
});

const modal = () =>
  document
    .querySelector<HTMLElement>("dialog[open] [data-cy=dynamic-form]")
    ?.closest<HTMLElement>("dialog") ?? null;
const waitFor = async <T>(find: () => T | null | undefined, tries = 160) => {
  for (let i = 0; i < tries && !find(); i++)
    await new Promise((resolve) => setTimeout(resolve, 50));
  return find();
};

const typeInto = (
  input: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) => {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

const fillIn = async () => {
  const textarea = await waitFor(() =>
    modal()?.querySelector<HTMLTextAreaElement>("textarea"),
  );
  if (textarea) typeInto(textarea, "Digitised from the 2026 donation.");
  modal()
    ?.querySelector<HTMLElement>("[data-cy=bulk-edit-clear-rights]")
    ?.click();
  useFormHelper().setBulkEditRelationMode("bulk-edit", BulkEditModes.Replace);
};

const pressApply = async () => {
  await fillIn();
  const apply = await waitFor(() =>
    [...(modal()?.querySelectorAll<HTMLButtonElement>("button") ?? [])].find(
      (button) => button.textContent?.trim() === "Apply",
    ),
  );
  apply?.click();
};

const meta: Meta<typeof BulkOperationsEditModal> = {
  title: "BulkOperations/BulkEditModal",
  component: BulkOperationsEditModal,
  parameters: {
    docs: {
      description: {
        component:
          "Bulk edit, opened from the selection action bar: the selected " +
          "items on the left, one form merged from the forms of every type " +
          "in the selection on the right. Only touched or emptied fields " +
          "are written.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BulkOperationsEditModal>;

export const Default: Story = { render: render() };

export const Changed: Story = {
  render: render(),
  play: fillIn,
};

export const Confirm: Story = {
  render: render(),
  play: pressApply,
};

export const Applying: Story = {
  render: render(),
  beforeEach: () => {
    registerQueryFixture("BulkUpdateEntitiesWithJson", PENDING_QUERY);
  },
  play: async () => {
    await pressApply();
    const confirm = await waitFor(() =>
      [
        ...document.querySelectorAll<HTMLButtonElement>("dialog[open] button"),
      ].find(
        (button) =>
          button.textContent?.trim() === "Apply" && !modal()?.contains(button),
      ),
    );
    confirm?.click();
  },
};
