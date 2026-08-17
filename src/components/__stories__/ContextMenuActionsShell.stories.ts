import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ContextMenuActionsShell from "../ContextMenuActionsShell.vue";
import BaseButton from "@/components/base/BaseButton.vue";

const meta: Meta<typeof ContextMenuActionsShell> = {
  // Story ids contextmenuactions-contextmenuactionsshell--overflow-menu and
  // --split-button, per MANIFEST.md.
  title: "ContextMenuActions/ContextMenuActionsShell",
  component: ContextMenuActionsShell,
  parameters: {
    docs: {
      description: {
        component:
          "Row and panel actions. The trigger is always labelled — never a " +
          "bare ⋮ — because the label is the only thing that makes the " +
          "actions discoverable; a glyph tells you something is there but " +
          "not what. The chevron is the ⌄/⌃ pair, which replaced the " +
          "right-pointing chevron the system retired.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContextMenuActionsShell>;

const menuItems = `
  <div style="display:flex;flex-direction:column">
    <div>Dupliceer</div>
    <div>Exporteer</div>
    <div style="color:var(--color-danger)">Verwijder</div>
  </div>`;

/** The labelled trigger on its own — click it to open the menu. */
export const OverflowMenu: Story = {
  render: () => ({
    components: { ContextMenuActionsShell },
    template: `
      <div style="padding:40px 0">
        <context-menu-actions-shell :has-promoted-actions="false" :has-overflow-actions="true">
          <template #overflow>${menuItems}</template>
        </context-menu-actions-shell>
      </div>`,
  }),
};

/**
 * Promoted actions sit before the menu as pills. A pill only ever starts
 * something reversible — navigation or preview — never a mutation.
 */
export const SplitButton: Story = {
  render: () => ({
    components: { ContextMenuActionsShell, BaseButton },
    template: `
      <div style="padding:40px 0">
        <context-menu-actions-shell :has-promoted-actions="true" :has-overflow-actions="true">
          <template #promoted>
            <base-button button-style="primary" button-size="sm" label="Open record" />
          </template>
          <template #overflow>${menuItems}</template>
        </context-menu-actions-shell>
      </div>`,
  }),
};
