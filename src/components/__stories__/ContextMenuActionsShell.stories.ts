import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ContextMenuActionsShell from "../ContextMenuActionsShell.vue";
import BaseButton from "@/components/base/BaseButtonNew.vue";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { Unicons } from "@/types";
import { provide } from "vue";
import ListItem from "@/components/ListItem.vue";
import { isCompact } from "@/composables/useNavMenu";
import {
  ActionTone,
  BaseLibraryModes,
  ContextMenuElodyActionEnum,
  ContextMenuFormFlow,
} from "@/generated-types/queries";

const meta: Meta<typeof ContextMenuActionsShell> = {
  title: "ContextMenuActions/ContextMenuActionsShell",
  component: ContextMenuActionsShell,
  parameters: {
    docs: {
      description: {
        component:
          "Row and panel actions. Outside a list row the trigger is always " +
          "labelled, because the label is what makes the actions " +
          "discoverable. One promoted action plus a menu joins into a split " +
          "button; destructive items sit last in danger ink.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContextMenuActionsShell>;

const components = { ContextMenuActionsShell, BaseButton, BaseContextMenuItem };
const setup = () => ({
  Unicons,
  danger: { "--menu-item-ink": "var(--color-danger-ink)" },
});

const menuItems = `
  <base-context-menu-item :icon="Unicons.Copy.name" label="Duplicate" />
  <base-context-menu-item :icon="Unicons.Download.name" label="Export" />
  <base-context-menu-item :icon="Unicons.Trash.name" label="Delete" :style="danger" />`;

const openMenu = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  canvasElement
    .querySelector<HTMLElement>(
      '[data-cy="split-button-chevron"], [data-cy="overflow-menu-trigger"]',
    )
    ?.click();
};

const frame = (inner: string) =>
  `<div style="padding:8px 0 240px">${inner}</div>`;

/** The labelled "Actions" trigger on its own: no promoted action. */
export const OverflowMenu: Story = {
  render: () => ({
    components,
    setup,
    template: frame(`
      <context-menu-actions-shell :has-promoted-actions="false" :has-overflow-actions="true">
        <template #overflow>${menuItems}</template>
      </context-menu-actions-shell>`),
  }),
};

/**
 * One primary action and its alternatives in one capsule. The primary fires
 * at once; only the chevron opens the menu.
 */
export const SplitButton: Story = {
  render: () => ({
    components,
    setup,
    template: frame(`
      <context-menu-actions-shell
        :has-promoted-actions="true"
        :has-overflow-actions="true"
        split
        context-label="Portrait of a lady"
      >
        <template #promoted>
          <base-button button-style="primary" button-size="sm" label="Open record" :force-show-label="true" />
        </template>
        <template #overflow>${menuItems}</template>
      </context-menu-actions-shell>`),
  }),
};

/** The split button with its menu open: destructive item last, in danger ink. */
export const SplitButtonOpen: Story = {
  ...SplitButton,
  play: openMenu,
};

/** A disabled item keeps its place and explains why on a help icon. */
export const DisabledItem: Story = {
  render: () => ({
    components,
    setup,
    template: frame(`
      <context-menu-actions-shell :has-promoted-actions="false" :has-overflow-actions="true">
        <template #overflow>
          <base-context-menu-item :icon="Unicons.Copy.name" label="Duplicate" />
          <base-context-menu-item
            :icon="Unicons.Download.name"
            label="Export"
            disable
            tooltip-label="Only records with media can be exported"
          />
          <base-context-menu-item :icon="Unicons.Trash.name" label="Delete" :style="danger" />
        </template>
      </context-menu-actions-shell>`),
  }),
  play: openMenu,
};

/** The "Actions" menu open: destructive item last, in danger ink. */
export const OverflowMenuOpen: Story = {
  ...OverflowMenu,
  play: openMenu,
};

/** A more specific trigger label where the menu has one subject. */
export const CustomTriggerLabel: Story = {
  render: () => ({
    components,
    setup,
    template: frame(`
      <context-menu-actions-shell
        :has-promoted-actions="false"
        :has-overflow-actions="true"
        trigger-label="Saved searches"
      >
        <template #overflow>
          <base-context-menu-item label="Save current search" />
          <base-context-menu-item label="Open a saved search" />
        </template>
      </context-menu-actions-shell>`),
  }),
};

const elodyAction = (
  label: string,
  icon: string,
  action: ContextMenuElodyActionEnum,
  tone = ActionTone.Default,
) => ({
  __typename: "ContextMenuElodyAction",
  label,
  icon,
  action,
  tone,
  hidden: false,
  formFlow: ContextMenuFormFlow.Update,
});

const rowButtons = {
  __typename: "Buttons",
  contextMenu: {
    __typename: "ContextMenuActions",
    share: elodyAction("Share", "Link", ContextMenuElodyActionEnum.Share),
    edit: elodyAction("Edit", "Edit", ContextMenuElodyActionEnum.UpdateMetadata),
    delete: elodyAction("Delete", "Trash", ContextMenuElodyActionEnum.DeleteEntity, ActionTone.Danger),
  },
};

const rowSetup = () => {
  provide("config", { features: {}, routerConfig: [{ name: "Home", children: [] }] });
  return {
    buttons: rowButtons,
    mode: BaseLibraryModes.NormalBaseLibrary,
    teaser: [{ label: "Title", key: "title", value: "Portrait of a lady" }],
  };
};

const rowTemplate = frame(`
  <ul style="max-width:620px;padding:0;list-style:none">
    <list-item
      item-id="story-row"
      :teaser-metadata="teaser"
      :buttons="buttons"
      :bulk-operations-context="undefined"
      relation="no-relation-found"
      :base-library-mode="mode"
      view-mode="list"
      :is-enable-navigation="false"
      :preview-component-enabled="true"
      :preview-component-feature-enabled="true"
    />
  </ul>`);

/** In a list row the trigger is a bare ⋮ under the "Actions" column header. */
export const InListRow: Story = {
  render: () => ({
    components: { ListItem },
    setup: rowSetup,
    template: rowTemplate,
  }),
};

/**
 * Below 48rem the menu is a bottom sheet. From a list row it shows the record
 * on top and its preview as the first item.
 */
export const SmallScreenSheet: Story = {
  render: () => ({
    components: { ListItem },
    setup() {
      isCompact.value = true;
      return rowSetup();
    },
    template: rowTemplate,
  }),
  play: openMenu,
};
