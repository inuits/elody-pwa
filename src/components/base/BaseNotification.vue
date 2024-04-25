<template>
  <transition>
    <div
      v-if="notification.shown && notification.title"
      class="absolute m-4 p-4 w-2/12 bg-neutral-20 top-0 right-0 rounded-md z-[100]"
    >
      <div
        :class="`w-full border-b-2 mb-2 font-bold ${
          typeColors[notification.type].border
        }`"
      >
        <h2 :class="`${typeColors[notification.type].text}`">
          {{ notification.title }}
        </h2>
      </div>
      <div>
        <p class="break-words">{{ notification.description }}</p>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";

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
    displayTime: number = 10
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
    const { notification } = useNotification();
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
          setTimeout(() => {
            notification.value.shown = false;
          }, secondsToMilliseconds(notification.value.displayTime));
        }
      }
    );

    return { NotificationType, typeColors, notification };
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
