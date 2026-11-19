import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onMounted } from "vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseNotifications from "@/components/base/BaseNotifications.vue";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useAsyncAction } from "@/composables/useAsyncAction";
import { DamsIcons } from "@/generated-types/queries";

const meta: Meta = {
  title: "Components/Notification",
  parameters: {
    docs: {
      description: {
        component:
          "Toasts from useBaseNotification(), rendered by the " +
          "@kyvg/vue3-notification <notifications> host that App.vue mounts. " +
          "Success, warning and error share the inverted surface; warnings " +
          "and errors add an accent bar. They stack in the top right, close " +
          "on click or with their close button, pause while hovered and " +
          "disappear after 10 seconds unless persistent. Errors are " +
          "announced at once; the others through a polite live region.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Types: Story = {
  render: () => ({
    components: { BaseNotifications },
    setup() {
      const {
        displaySuccessNotification,
        displayWarningNotification,
        displayErrorNotification,
      } = useBaseNotification();
      const persistent = { duration: -1 };
      onMounted(() => {
        displaySuccessNotification(
          "notifications.success.entityUpdated.title",
          "notifications.success.entityUpdated.description",
          persistent,
        );
        displayWarningNotification(
          "notifications.warning.entity-not-updated.title",
          "notifications.warning.entity-not-updated.description",
          persistent,
        );
        displayErrorNotification(
          "notifications.errors.generic.title",
          "notifications.errors.generic.description",
          persistent,
        );
      });
    },
    template: `<div style="min-height:280px"><base-notifications /></div>`,
  }),
};

export const AfterAnAction: Story = {
  name: "After an action",
  parameters: {
    docs: {
      description: {
        story:
          "The button shows its loading state while the action runs; the " +
          "result arrives as a toast. A failing action shows the generic " +
          "error toast (useAsyncAction).",
      },
    },
  },
  render: () => ({
    components: { BaseButtonNew, BaseNotifications },
    setup() {
      const { displaySuccessNotification } = useBaseNotification();
      const { isBusy, run } = useAsyncAction();
      const save = () =>
        run(async () => {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          displaySuccessNotification(
            "notifications.success.entityUpdated.title",
            "notifications.success.entityUpdated.description",
          );
        });
      const fail = () =>
        run(async () => {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          throw new Error("Story: the action failed");
        });
      return { isBusy, save, fail, DamsIcons };
    },
    template: `
      <div style="min-height:280px">
        <div style="display:flex;gap:var(--button-gap)">
          <base-button-new
            class="!w-auto"
            label="Save"
            :icon="DamsIcons.Save"
            button-style="commit"
            button-size="sm"
            :loading="isBusy"
            @click="save"
          />
          <base-button-new
            class="!w-auto"
            label="Try a failing action"
            button-style="secondary"
            button-size="sm"
            :disabled="isBusy"
            @click="fail"
          />
        </div>
        <base-notifications />
      </div>`,
  }),
};
