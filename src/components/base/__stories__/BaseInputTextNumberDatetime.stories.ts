import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import BaseInputTextNumberDatetime from "../BaseInputTextNumberDatetime.vue";

const meta: Meta<typeof BaseInputTextNumberDatetime> = {
  // Story id base-baseinputtext--states, per MANIFEST.md.
  title: "Base/BaseInputText",
  component: BaseInputTextNumberDatetime,
  parameters: {
    docs: {
      description: {
        component:
          "Text, number and textarea share one ink, one size (--text-value, " +
          "the reading size) and one focus treatment: a 2px commit-teal ring " +
          "at 1px offset, on :focus-visible only, so a mouse click does not " +
          "ring. The three inputStyle values change chrome, nothing else.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseInputTextNumberDatetime>;

export const States: Story = {
  render: () => ({
    components: { BaseInputTextNumberDatetime },
    setup() {
      return {
        text: ref("Verhalen uit de Noordzee"),
        empty: ref(""),
        number: ref(1987),
        area: ref("Een langere annotatie van de catalograaf."),
      };
    },
    template: `
      <div style="display:grid;grid-template-columns:150px 260px;gap:10px 14px;align-items:center;font-size:var(--text-label)">
        <label for="s-borderless">default — borderless</label>
        <base-input-text-number-datetime id="s-borderless" v-model="text" input-style="default" />

        <label for="s-border">defaultWithBorder</label>
        <base-input-text-number-datetime id="s-border" v-model="text" input-style="defaultWithBorder" />

        <label for="s-dark">dark background</label>
        <base-input-text-number-datetime id="s-dark" v-model="text" input-style="defaultWithDarkBackgroundInput" />

        <label for="s-placeholder">placeholder</label>
        <base-input-text-number-datetime id="s-placeholder" v-model="empty" input-style="defaultWithBorder" placeholder="Geen waarde" />

        <label for="s-number">number — right aligned</label>
        <base-input-text-number-datetime id="s-number" v-model="number" type="number" input-style="defaultWithBorder" />

        <label for="s-disabled">disabled</label>
        <base-input-text-number-datetime id="s-disabled" v-model="text" input-style="defaultWithBorder" disabled />

        <label for="s-area">textarea</label>
        <base-input-text-number-datetime id="s-area" v-model="area" type="textarea" input-style="defaultWithBorder" />
      </div>`,
  }),
};
