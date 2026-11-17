import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { nextTick, onMounted, provide } from "vue";
import BulkOperationsModal from "../BulkOperationsModal.vue";
import BulkOperationsMergeModal from "../BulkOperationsMergeModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useModalActions } from "@/composables/useModalActions";
import { useBlockingLoader } from "@/composables/useBlockingLoader";
import { useBulkOperations } from "@/composables/useBulkOperations";
import {
  MergeEvaluationStatus,
  MergeSurvivorStrategy,
  ModalStyle,
  RouteNames,
  TypeModals,
  type MergeSurvivorSuggestionConfig,
} from "@/generated-types/queries";
import { registerQueryFixture, router } from "@/main";

const context = RouteNames.Assets;

const row = (key: string, label: string) => ({
  __typename: "PanelMetaData",
  key,
  label,
});

const entityView = {
  __typename: "ColumnList",
  column: {
    __typename: "Column",
    elements: {
      __typename: "ColumnElements",
      metadata: {
        __typename: "WindowElement",
        panels: {
          __typename: "WindowElementPanel",
          info: {
            __typename: "MetadataPanel",
            title: row("title", "Title"),
            identifier: row("identifier", "Inventory number"),
            date: row("date", "Date"),
            description: row("description", "Description"),
            creator: row("creator", "Creator"),
          },
        },
      },
    },
  },
};

const entities: Record<string, Record<string, unknown>> = {
  "a-1": {
    title: "Tales from the North Sea",
    identifier: "OST-1950-014",
    date: "1950",
    description: "Photo album of the Ostend fishing fleet.",
    creator: "Jan Persoon",
  },
  "a-2": {
    title: "Tales from the North Sea (scan)",
    identifier: "OST-1950-014-B",
    date: "1950",
    description: "",
    creator: "J. Persoon",
  },
};

const entity = (id: string) => ({
  __typename: "BaseEntity",
  id,
  uuid: id,
  type: "asset",
  intialValues: { __typename: "IntialValues", ...entities[id] },
  entityView,
});

const evaluations = [
  {
    __typename: "MergeEvaluation",
    id: "a-1",
    strategy: MergeSurvivorStrategy.IdentifierIntegrity,
    status: MergeEvaluationStatus.Valid,
    score: 1,
    details: { expected_id: "OST-1950-014" },
    immutableFields: [
      {
        __typename: "MergeImmutableField",
        key: "identifier",
        identityValue: "OST-1950-014",
      },
    ],
  },
  {
    __typename: "MergeEvaluation",
    id: "a-2",
    strategy: MergeSurvivorStrategy.IdentifierIntegrity,
    status: MergeEvaluationStatus.Invalid,
    score: 0,
    details: { expected_id: "OST-1950-014" },
    immutableFields: [
      {
        __typename: "MergeImmutableField",
        key: "identifier",
        identityValue: "OST-1950-014-B",
      },
    ],
  },
];

const suggestion: MergeSurvivorSuggestionConfig = {
  __typename: "MergeSurvivorSuggestionConfig",
  strategy: MergeSurvivorStrategy.IdentifierIntegrity,
  autoSelect: true,
  requireRecommendedSurvivor: true,
};

const registerFixtures = () => {
  registerQueryFixture("getEntityById", (variables: { id: string }) => ({
    Entity: entity(variables.id),
  }));
  registerQueryFixture("GetMergePreview", {
    mergePreview: { __typename: "MergePreview", inboundReferenceCount: 3 },
  });
  registerQueryFixture("GetMergeEvaluations", {
    mergeEvaluations: evaluations,
  });
};

const addDetailRoute = () => {
  if (router.hasRoute("SingleEntity")) return;
  router.addRoute({
    name: "SingleEntity",
    path: "/:type/:id",
    component: { template: "<div />" },
  });
};

const selection = [
  { id: "a-2", type: "asset" },
  { id: "a-1", type: "asset" },
];

const render = (survivorSuggestion?: MergeSurvivorSuggestionConfig) => () => ({
  components: { BulkOperationsModal },
  setup() {
    registerFixtures();
    addDetailRoute();
    useBlockingLoader().stopBlocking();
    provide("config", { features: { hasBulkSelect: true } });
    onMounted(async () => {
      const { openModal, closeAllModals } = useBaseModal();
      const { enqueueItemForBulkProcessing, dequeueAllItemsForBulkProcessing } =
        useBulkOperations();
      closeAllModals();
      dequeueAllItemsForBulkProcessing(context);
      selection.forEach((entry) =>
        enqueueItemForBulkProcessing(context, entry),
      );
      useModalActions().setCallbackFunctions([]);
      await nextTick();
      openModal(
        TypeModals.BulkOperationsMerge,
        ModalStyle.CenterWide,
        undefined,
        undefined,
        true,
        context,
        { survivorSuggestion },
      );
    });
  },
  template: `<bulk-operations-modal />`,
});

const modal = () => document.querySelector<HTMLElement>("dialog[open]");
const waitFor = async <T>(find: () => T | null | undefined, tries = 160) => {
  for (let i = 0; i < tries && !find(); i++)
    await new Promise((resolve) => setTimeout(resolve, 50));
  return find();
};

const meta: Meta<typeof BulkOperationsMergeModal> = {
  title: "BulkOperations/MergeModal",
  component: BulkOperationsMergeModal,
  parameters: {
    docs: {
      description: {
        component:
          "Merge two selected records into one: pick the record that " +
          "remains, then for every field whose values differ, which value " +
          "it keeps. The other record is deleted.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BulkOperationsMergeModal>;

export const Default: Story = { render: render() };

export const ValuesChosen: Story = {
  name: "Values chosen",
  render: render(),
  play: async () => {
    const choice = await waitFor(() =>
      modal()?.querySelector<HTMLInputElement>(
        "[data-testid=choice-creator-right]",
      ),
    );
    choice?.click();
    modal()
      ?.querySelector<HTMLInputElement>("[data-testid=choice-title-right]")
      ?.click();
  },
};

export const Recommended: Story = { render: render(suggestion) };

export const Blocked: Story = {
  render: render(suggestion),
  play: async () => {
    await waitFor(() =>
      modal()?.querySelector("[data-testid=survivor-hint-1]"),
    );
    modal()
      ?.querySelector<HTMLInputElement>("[data-testid=survivor-0]")
      ?.click();
  },
};
