import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ContextMenuActionsShell from "../ContextMenuActionsShell.vue";
import BaseButton from "@/components/base/BaseButtonNew.vue";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { Unicons } from "@/types";

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

/**
 * More than one promoted action: separate buttons before a labelled
 * "Actions" trigger instead of a split button.
 */
export const PromotedAndMenu: Story = {
  render: () => ({
    components,
    setup,
    template: frame(`
      <context-menu-actions-shell :has-promoted-actions="true" :has-overflow-actions="true">
        <template #promoted>
          <base-button button-style="secondary" button-size="sm" label="Preview" icon="Eye" :force-show-label="true" />
          <base-button button-style="primary" button-size="sm" label="Open record" :force-show-label="true" />
        </template>
        <template #overflow>${menuItems}</template>
      </context-menu-actions-shell>`),
  }),
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
