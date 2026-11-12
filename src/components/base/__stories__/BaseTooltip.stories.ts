import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseTooltip from "../BaseTooltip.vue";
import { Unicons } from "@/types";

const meta: Meta<typeof BaseTooltip> = {
  title: "Base/BaseTooltip",
  component: BaseTooltip,
  parameters: {
    docs: {
      description: {
        component:
          "Supplementary text on hover and focus: hidden by default, shown " +
          "after 300ms (0 on the nav rail), hidden again when the pointer or " +
          "focus leaves or on Escape. Leaving before the delay cancels it.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseTooltip>;

export const States: Story = {
  render: () => ({
    components: { BaseTooltip },
    setup: () => ({ Unicons }),
    template: `
      <div style="display:grid;grid-template-columns:280px max-content;gap:18px 16px;align-items:center;justify-items:start;font-size:var(--text-label);margin-top:40px">
          <span>300ms delay (default): hover or Tab, then Escape</span>
          <span>
            <base-tooltip position="top" :tooltip-offset="8">
              <template #activator="{ on, describedBy }">
                <button v-on="on" :aria-describedby="describedBy" aria-label="Help" type="button">
                  <unicon :name="Unicons.QuestionCircle.name" height="18" />
                </button>
              </template>
              Fields marked with a star are required
            </base-tooltip>
          </span>
          <span>no delay (nav rail)</span>
          <span>
            <base-tooltip position="right" :tooltip-offset="8" :show-delay="0">
              <template #activator="{ on, describedBy }">
                <button v-on="on" :aria-describedby="describedBy" aria-label="Library" type="button">
                  <unicon :name="Unicons.BookOpen.name" height="18" />
                </button>
              </template>
              Library
            </base-tooltip>
          </span>
          <span>full value of truncated text</span>
          <span>
            <base-tooltip position="top" :tooltip-offset="8">
              <template #activator="{ on, describedBy }">
                <span v-on="on" :aria-describedby="describedBy" tabindex="0"
                      style="display:inline-block;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                  A Book of Hours of the Scheldt, second edition
                </span>
              </template>
              A Book of Hours of the Scheldt, second edition
            </base-tooltip>
          </span>
      </div>`,
  }),
};

const placements = [
  "top",
  "top-start",
  "top-end",
  "right",
  "right-start",
  "right-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end",
];

export const Playground: StoryObj<
  InstanceType<typeof BaseTooltip>["$props"] & { text: string }
> = {
  args: {
    position: "top",
    tooltipOffset: 8,
    maxWidth: "14rem",
    enableAutoPlacement: true,
    showDelay: 300,
    text: "Fields marked with a star are required",
  },
  argTypes: {
    position: { control: "select", options: placements },
    tooltipOffset: { control: { type: "range", min: 0, max: 32 } },
    showDelay: { control: { type: "number", min: 0, step: 100 } },
  },
  render: (args) => ({
    components: { BaseTooltip },
    setup: () => ({ args, Unicons }),
    template: `
      <div style="padding:80px;display:flex;justify-content:center">
        <base-tooltip
          :position="args.position"
          :tooltip-offset="args.tooltipOffset"
          :max-width="args.maxWidth"
          :enable-auto-placement="args.enableAutoPlacement"
          :show-delay="args.showDelay"
        >
          <template #activator="{ on, describedBy }">
            <button v-on="on" :aria-describedby="describedBy" aria-label="Help" type="button">
              <unicon :name="Unicons.QuestionCircle.name" height="18" />
            </button>
          </template>
          {{ args.text }}
        </base-tooltip>
      </div>`,
  }),
};
