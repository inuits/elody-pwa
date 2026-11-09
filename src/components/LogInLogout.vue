<template>
  <div
    :class="[
      'flex flex-col gap-(--nav-rail-gap) whitespace-nowrap',
      { 'items-center': !isExpanded },
    ]"
  >
    <!-- Collapsed rail: named icon buttons with a tooltip; expanded: icon + label rows. -->
    <BaseTooltip
      v-if="auth.isAuthenticated.value === false"
      position="top-right"
      :tooltip-offset="8"
      :show-delay="0"
    >
      <template #activator="{ on, describedBy }">
        <button
          v-on="on"
          type="button"
          data-cy="log-in"
          :aria-describedby="describedBy"
          :aria-label="isExpanded ? undefined : t('navigation.log-in')"
          :class="rowClass"
          @click="auth.redirectToLogin()"
        >
          <unicon :name="Unicons.UserCircle.name" height="20" aria-hidden="true" />
          <span v-if="isExpanded">{{ t("navigation.log-in") }}</span>
        </button>
      </template>
      <template v-if="!isExpanded" #default>
        {{ t("navigation.log-in") }}
      </template>
    </BaseTooltip>
    <template v-else>
      <BaseTooltip position="top-right" :tooltip-offset="8" :show-delay="0">
        <template #activator="{ on, describedBy }">
          <component
            :is="elodyUser ? RouterLink : 'span'"
            v-on="on"
            data-cy="profile"
            :to="elodyUser ? `/user/${elodyUser.id}` : undefined"
            :role="!elodyUser && !isExpanded ? 'img' : undefined"
            :aria-describedby="describedBy"
            :aria-label="isExpanded ? undefined : getUserName()"
            :class="[rowClass, { 'cursor-default': !elodyUser }]"
          >
            <span
              data-test="user-avatar"
              aria-hidden="true"
              class="shrink-0 flex items-center justify-center size-(--nav-rail-avatar-size) rounded-full bg-accent-light text-accent-ink text-micro font-semibold"
            >
              {{ initials }}
            </span>
            <span v-if="isExpanded" data-test="profile-name">{{
              getUserName()
            }}</span>
          </component>
        </template>
        <template v-if="!isExpanded" #default>{{ getUserName() }}</template>
      </BaseTooltip>
      <BaseTooltip position="top-right" :tooltip-offset="8" :show-delay="0">
        <template #activator="{ on, describedBy }">
          <button
            v-on="on"
            type="button"
            data-cy="log-out"
            :aria-describedby="describedBy"
            :aria-label="isExpanded ? undefined : t('navigation.log-out')"
            :class="rowClass"
            @click="openConfirmationModal"
          >
            <unicon :name="Unicons.SignOut.name" height="20" aria-hidden="true" />
            <span v-if="isExpanded">{{ t("navigation.log-out") }}</span>
          </button>
        </template>
        <template v-if="!isExpanded" #default>
          {{ t("navigation.log-out") }}
        </template>
      </BaseTooltip>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { Unicons } from "@/types";
import { auth } from "@/main";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { useAuth } from "@/composables/useAuth";

const props = defineProps({
  isExpanded: Boolean,
});

const { t } = useI18n();
const { confirm } = useConfirmModal();
const { performLogout, getUserName, elodyUser } = useAuth();

// navigation.md: rail items like the menu items (muted, light wash on hover)
const rowClass = computed(() => [
  "flex items-center rounded-(--nav-rail-item-radius) text-text-muted hover:bg-accent-highlight hover:no-underline",
  props.isExpanded
    ? "w-full min-h-(--nav-rail-item-height) px-2 gap-2 text-table"
    : "justify-center w-(--nav-rail-item-width) h-(--nav-rail-item-height)",
]);

const initials = computed(() => {
  const words = getUserName().trim().split(/\s+/);
  const letters = words.length > 1 ? [words[0], words.at(-1)!] : words;
  return letters.map((word) => word.charAt(0).toUpperCase()).join("");
});

const openConfirmationModal = async () => {
  const choice = await confirm({
    title: t("confirm.logout-modal.title"),
    message: t("confirm.logout-modal.message"),
    confirmLabel: t("confirm.logout-modal.confirm"),
    cancelLabel: t("confirm.logout-modal.cancel"),
  });
  if (choice !== "confirm") return;
  performLogout();
};
</script>
