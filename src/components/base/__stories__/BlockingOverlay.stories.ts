import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { watch } from "vue";
import BlockingOverlay from "../BlockingOverlay.vue";
import { useBlockingLoader } from "@/composables/useBlockingLoader";

type OverlayArgs = { isBlocking: boolean; fixed: boolean; message: string };

const meta: Meta<OverlayArgs> = {
  title: "Base/BlockingOverlay",
  component: BlockingOverlay,
  parameters: {
    docs: {
      description: {
        component:
          "A spinner scrim that blocks input while a long operation runs. " +
          "Fixed, it covers the whole app; absolute, it covers only its " +
          "positioned parent, which modals use inside their dialog. The " +
          "message comes from useBlockingLoader().",
      },
    },
  },
};

export default meta;
type Story = StoryObj<OverlayArgs>;

export const Default: Story = {
  args: { isBlocking: true, fixed: false, message: "Saving changes…" },
  render: (args) => ({
    components: { BlockingOverlay },
    setup() {
      const { blockingMessage } = useBlockingLoader();
      watch(
        () => args.message,
        (message) => (blockingMessage.value = message || undefined),
        { immediate: true },
      );
      return { args };
    },
    template: `
      <div style="position:relative;height:240px;max-width:480px;padding:16px;
                  border:1px solid var(--color-border-panel);background:var(--color-surface)">
        <p>Content underneath the overlay.</p>
        <blocking-overlay :is-blocking="args.isBlocking" :fixed="args.fixed" />
      </div>`,
  }),
};
