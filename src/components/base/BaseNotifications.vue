<template>
  <Notifications pause-on-hover aria-live="polite">
    <template #body="{ item, class: classes, close }">
      <div
        data-cy="notification"
        :class="classes"
        :role="item.type === 'error' ? 'alert' : undefined"
        @click="close"
      >
        <div class="flex items-start gap-2">
          <div class="grow min-w-0">
            <div v-if="item.title" class="notification-title">
              {{ item.title }}
            </div>
            <div v-if="item.text" class="notification-content">
              {{ item.text }}
            </div>
          </div>
          <button
            type="button"
            data-cy="notification-close"
            class="shrink-0 rounded-button text-text-on-inverted opacity-80 hover:opacity-100"
            :aria-label="closeLabel"
            @click.stop="close"
          >
            <unicon :name="Unicons.Close.name" height="16" width="16" />
          </button>
        </div>
      </div>
    </template>
  </Notifications>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Notifications } from "@kyvg/vue3-notification";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";

const { t, te } = useI18n();
const closeLabel = computed<string>(() =>
  te("actions.labels.close") ? t("actions.labels.close") : "Close",
);
</script>
