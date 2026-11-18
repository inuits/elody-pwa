import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, watch } from "vue";
import EntityElementWrapper from "../EntityElementWrapper.vue";
import ViewModesList from "@/components/library/view-modes/ViewModesList.vue";
import {
  BaseLibraryModes,
  Entitytyping,
  GetPreviewComponentsDocument,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { apolloClient } from "@/main";

type WrapperArgs = {
  label: string;
  entityId: string;
  isCollapsed: boolean;
  baseLibraryMode: BaseLibraryModes;
  useVshowInsteadOfVif: boolean;
  previewLabel: string;
  headerStyle: "normal" | "none";
  onToggleElementCollapse?: (entityId: string, label: string) => void;
};

const meta: Meta<WrapperArgs> = {
  title: "Base/EntityElementWrapper",
  component: EntityElementWrapper,
  argTypes: {
    baseLibraryMode: {
      control: "select",
      options: Object.values(BaseLibraryModes),
    },
    headerStyle: { control: "inline-radio", options: ["normal", "none"] },
    previewLabel: { control: "text" },
    onToggleElementCollapse: { action: "toggleElementCollapse" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The panel shell around every entity element on a detail page: a " +
          "white card with an accent-light header band that collapses the " +
          "body. Lists, viewers and maps render inside its content slot.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<WrapperArgs>;

const CONTEXT = BulkOperationsContextEnum.EntityElementMedia;

const mediafile = (id: string, title: string, attribution: string) => ({
  id,
  uuid: id,
  type: Entitytyping.Mediafile,
  teaserMetadata: {
    title: { key: "title", label: "File name", __typename: "Metadata" },
    attribution: { key: "attribution", label: "Attribution", __typename: "Metadata" },
  },
  intialValues: { title, attribution },
  relationValues: {},
});

const list = {
  entities: [
    mediafile("m1", "harbour-1920.tif", "City Archive"),
    mediafile("m2", "fish-market.jpg", "Jan Persoon"),
    mediafile("m3", "lighthouse.png", "Marie Vermeulen"),
  ],
  placeholderEntities: [],
  entitiesLoading: false,
  bulkOperationsContext: CONTEXT,
  listItemRouteName: "",
  enableSelection: true,
  enableNavigation: false,
  entityType: Entitytyping.Mediafile,
  configPerViewMode: {},
};

const render: Story["render"] = (args) => ({
  components: { EntityElementWrapper, ViewModesList },
  setup() {
    apolloClient.writeQuery({
      query: GetPreviewComponentsDocument,
      variables: { entityType: Entitytyping.Mediafile },
      data: { PreviewComponents: { __typename: "PreviewComponents" } },
    });
    useBulkOperations().dequeueAllItemsForBulkProcessing(CONTEXT);
    const collapsed = ref(args.isCollapsed);
    watch(
      () => args.isCollapsed,
      (value) => (collapsed.value = value),
    );
    const toggle = (entityId: string, label: string) => {
      collapsed.value = !collapsed.value;
      args.onToggleElementCollapse?.(entityId, label);
    };
    return { args, collapsed, toggle, list };
  },
  template: `
    <div style="max-width:720px">
      <entity-element-wrapper
        :label="args.label"
        :entity-id="args.entityId"
        :is-collapsed="collapsed"
        :base-library-mode="args.baseLibraryMode"
        :use-vshow-instead-of-vif="args.useVshowInsteadOfVif"
        :preview-label="args.previewLabel || undefined"
        :header-style="args.headerStyle"
        @toggle-element-collapse="toggle"
      >
        <template #content>
          <view-modes-list v-bind="list" mode="list" />
        </template>
      </entity-element-wrapper>
    </div>`,
});

const args: WrapperArgs = {
  label: "Media",
  entityId: "d37b9928-cece-54dc-a527-d27f7dce1c9e",
  isCollapsed: false,
  baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  useVshowInsteadOfVif: false,
  previewLabel: "",
  headerStyle: "normal",
};

export const Default: Story = { args, render };

export const Collapsed: Story = {
  args: { ...args, label: "Parent (Assets)", isCollapsed: true },
  render,
};
