<template>
  <!-- Collapsed rail: named icon buttons with a tooltip; expanded: icon + label rows. -->
  <div class="!bg-background-light flex flex-col gap-3 whitespace-nowrap">
    <BaseTooltip
      v-if="auth.isAuthenticated.value === false"
      position="top-right"
      :tooltip-offset="8"
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
      <BaseTooltip position="top-right" :tooltip-offset="8">
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
            <unicon :name="Unicons.UserCircle.name" height="20" aria-hidden="true" />
            <span v-if="isExpanded">{{ getUserName() }}</span>
          </component>
        </template>
        <template v-if="!isExpanded" #default>{{ getUserName() }}</template>
      </BaseTooltip>
      <BaseTooltip position="top-right" :tooltip-offset="8">
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
import { Unicons } from "@/types";
import { auth } from "@/main";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { useAuth } from "@/composables/useAuth";

defineProps({
  isExpanded: Boolean,
});

const { t } = useI18n();
const { confirm } = useConfirmModal();
const { performLogout, getUserName, elodyUser } = useAuth();

const rowClass =
  "ml-5 flex items-center gap-4 font-bold text-nav-item hover:text-nav-item-hover hover:no-underline";

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
