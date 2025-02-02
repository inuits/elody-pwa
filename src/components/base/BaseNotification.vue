<template>
  <transition>
    <div
      data-cy="base-notification"
      v-if="notification.shown && notification.title && !someModalIsOpened"
      class="absolute m-4 p-4 w-2/12 bg-neutral-20 top-0 right-0 rounded-md z-[100]"
    >
      <button
        class="absolute top-2 right-2"
        @click.stop="() => (notification.shown = false)"
      >
        x
      </button>
      <div
        :class="`w-full border-b-2 mb-2 font-bold ${
          typeColors[notification.type].border
        }`"
      >
        <h2
          data-cy="notification-title"
          :class="`${typeColors[notification.type].text}`"
        >
          {{ t(notification.title) }}
        </h2>
      </div>
      <div>
        <p data-cy="notification-description" class="break-words">
          {{ t(notification.description) }}
        </p>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";

export enum NotificationType {
  default = "default",
  warning = "warning",
  error = "error",
  success = "success",
}

export type Notification = {
  displayTime: number;
  type: NotificationType;
  title: string;
  description: string;
  shown: boolean;
};

const notification = ref<Notification>({
  displayTime: 10,
  type: NotificationType.error,
  title: "",
  description: "",
  shown: false,
});

export const useNotification = () => {
  const createNotification = (newNotifcation: Notification) => {
    notification.value = newNotifcation;
  };

  const createNotificationOverwrite = (
    type: NotificationType,
    title: string,
    description: string,
    displayTime: number = 10,
  ) => {
    const baseNotification = { displayTime, shown: true };
    const notificationOverwrite = { type, title, description };
    Object.assign(baseNotification, notificationOverwrite);
    createNotification(baseNotification as Notification);
  };

  return { notification, createNotification, createNotificationOverwrite };
};

export default defineComponent({
  name: "BaseNotification",
  setup() {
    const { t } = useI18n();
    const { notification } = useNotification();
    const { someModalIsOpened } = useBaseModal();
    const typeColors = {
      default: { border: "border-neutral-700", text: "text-neutral-700" },
      warning: {
        border: "border-yellow-default",
        text: "text-yellow-default",
      },
      error: { border: "border-red-default", text: "text-red-default" },
      success: { border: "border-green-default", text: "text-green-default" },
    };

    const secondsToMilliseconds = (seconds: number): number => {
      return seconds * 1000;
    };

    watch(
      () => notification.value.shown,
      (shown) => {
        if (shown) {
          if (someModalIsOpened.value)
            // Remove this if no notifications pop-up when a modal is open
            console.info(
              `A modal is open at this time show the '${notification.value.title}' error inside of the modal instead of using notifications`,
            );

          setTimeout(() => {
            notification.value.shown = false;
          }, secondsToMilliseconds(notification.value.displayTime));
        }
      },
    );

    return { NotificationType, typeColors, notification, someModalIsOpened, t };
  },
});
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: transform 0.5s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  transform: translateX(100%);
}
</style>
