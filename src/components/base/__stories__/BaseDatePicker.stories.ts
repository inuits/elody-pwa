import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import BaseDatePicker from "../BaseDatePicker.vue";

const meta: Meta<typeof BaseDatePicker> = {
  // Story id base-basedatepicker--default, per MANIFEST.md.
  title: "Base/BaseDatePicker",
  component: BaseDatePicker,
  parameters: {
    docs: {
      description: {
        component:
          "Calendar popup for date and datetime fields, themed through the " +
          "library's own --dp-* variables rather than fought with overrides. " +
          "Typing stays first-class — the placeholder is the format itself, " +
          "dd-mm-jjjj, and typed input parses on blur. Today wears a " +
          "commit-teal ring; the selected day is the tenant accent with a " +
          "white numeral, so the calendar follows the tenant toolbar. " +
          "Picking fills the input; the commit stays with Bewaar.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseDatePicker>;

export const Default: Story = {
  render: () => ({
    components: { BaseDatePicker },
    setup: () => ({ date: ref("2026-08-18") }),
    template: `
      <div style="max-width:280px;padding-bottom:420px">
        <p style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">Datum</p>
        <base-date-picker v-model="date" type="date" />
      </div>`,
  }),
};

/** The time variant adds hh:mm below the grid. */
export const WithTime: Story = {
  render: () => ({
    components: { BaseDatePicker },
    setup: () => ({ date: ref("2026-08-18T10:30:00+00:00") }),
    template: `
      <div style="max-width:280px;padding-bottom:460px">
        <p style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">Datum en tijd</p>
        <base-date-picker v-model="date" type="datetime-local" />
      </div>`,
  }),
};
