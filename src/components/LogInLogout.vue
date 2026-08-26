<template>
  <div class="!bg-background-light">
    <button
      v-if="auth.isAuthenticated.value === false"
      type="button"
      class="session-action flex flex-row items-center hover:text-accent-accent cursor-pointer whitespace-nowrap"
      :aria-label="t('navigation.log-in')"
      @click="auth.redirectToLogin()"
    >
      <unicon :name="Unicons.UserCircle.name" height="21" class="mt-1 ml-2" />
      <span v-if="isExpanded" class="overflow-hidden px-4 font-bold">
        {{ t("navigation.log-in") }}
      </span>
    </button>

    <div
      v-if="auth.isAuthenticated.value === true"
      class="flex flex-col whitespace-nowrap"
    >
      <div class="mb-3 flex flex-row whitespace-nowrap">
        <base-tooltip
          v-if="!isExpanded && elodyUser"
          class="hover:text-accent-accent cursor-pointer"
          position="top-right"
          :tooltip-offset="8"
        >
          <template #activator="{ on }">
            <router-link :to="`/user/${elodyUser.id}`" :aria-label="getUserName()"
              ><div v-on="on">
                <unicon
                  :name="Unicons.UserCircle.name"
                  height="20"
                  class="mt-1 ml-2"
                /></div
            ></router-link>
          </template>
          <template #default>
            <span class="w-max hover:text-accent-accent">
              <div>
                {{ getUserName() }}
              </div>
            </span>
          </template>
        </base-tooltip>
        <unicon
          v-if="isExpanded"
          :name="Unicons.UserCircle.name"
          height="20"
          class="mt-1 ml-2"
        />
        <span v-if="isExpanded" class="overflow-hidden px-4 font-bold">
          {{ getUserName() }}
        </span>
      </div>
      <base-tooltip v-if="!isExpanded" position="top-right" :tooltip-offset="8">
        <template #activator="{ on }">
          <button
            type="button"
            class="session-action flex flex-row hover:text-accent-accent cursor-pointer whitespace-nowrap"
            :aria-label="t('navigation.log-out')"
            v-on="on"
            @click="openConfirmationModal"
          >
            <unicon :name="Unicons.SignOut.name" height="20" class="mt-1 ml-2" />
          </button>
        </template>
        <template #default>
          <span class="w-max hover:text-accent-accent">
            <div>
              {{ t("navigation.log-out") }}
            </div>
          </span>
        </template>
      </base-tooltip>
      <button
        v-if="isExpanded"
        type="button"
        class="session-action flex flex-row items-center hover:text-accent-accent cursor-pointer whitespace-nowrap"
        @click="openConfirmationModal"
      >
        <unicon :name="Unicons.SignOut.name" height="20" class="mt-1 ml-2" />
        <span class="overflow-hidden px-4 font-bold">
          {{ t("navigation.log-out") }}
        </span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";
import { auth } from "@/main";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useI18n } from "vue-i18n";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { useAuth } from "@/composables/useAuth";

defineProps({
  isExpanded: Boolean,
});

const { t } = useI18n();
const { confirm } = useConfirmModal();
const { performLogout, getUserName, elodyUser } = useAuth();

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

<style scoped>
.session-action:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-chip);
}
</style>
