import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, watch } from "vue";
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
          "dd-mm-yyyy, and typed input parses on blur. Today wears a " +
          "commit-teal ring; the selected day is the tenant accent with a " +
          "white numeral, so the calendar follows the tenant toolbar. " +
          "Picking fills the input; the commit stays with Save.",
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
        <p style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">Date</p>
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
        <p style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">Date and time</p>
        <base-date-picker v-model="date" type="datetime-local" />
      </div>`,
  }),
};

/** The calendar open under its field: month and year header, Monday-first grid. */
export const Open: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLInputElement>(".dp__input")?.click();
  },
};

/** Empty, filled, date and time, and disabled. */
export const States: Story = {
  render: () => ({
    components: { BaseDatePicker },
    setup: () => ({
      empty: ref(undefined),
      date: ref("2026-08-18"),
      dateTime: ref("2026-08-18T10:30:00+00:00"),
    }),
    template: `
      <div style="display:grid;grid-template-columns:110px 260px;gap:12px 14px;align-items:center;font-size:var(--text-label)">
        <span>empty</span>
        <base-date-picker v-model="empty" type="date" />

        <span>date</span>
        <base-date-picker v-model="date" type="date" />

        <span>date and time</span>
        <base-date-picker v-model="dateTime" type="datetime-local" />

        <span>disabled</span>
        <base-date-picker v-model="date" type="date" disabled />
      </div>`,
  }),
};

export const Playground: Story = {
  args: {
    modelValue: "2026-08-18",
    type: "date",
    placeholder: "Select date",
    disabled: false,
  },
  argTypes: {
    modelValue: { control: "text", type: { name: "string", required: false } },
    type: { control: "inline-radio", options: ["date", "datetime-local"] },
    "onUpdate:modelValue": { action: "update:modelValue" },
  },
  render: (args) => ({
    components: { BaseDatePicker },
    setup() {
      const value = ref(args.modelValue);
      watch(
        () => args.modelValue,
        (v) => (value.value = v),
      );
      return { args, value };
    },
    template: `
      <div style="max-width:280px;padding-bottom:460px">
        <base-date-picker v-bind="args" v-model="value" />
      </div>`,
  }),
};
