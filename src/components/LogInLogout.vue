<template>
  <div>
    <div
      class="flex flex-row items-center hover:text-accent-accent cursor-pointer whitespace-nowrap"
    >
      <unicon
        v-if="auth.isAuthenticated.value === false"
        @click="auth.redirectToLogin()"
        :name="Unicons.UserCircle.name"
        height="21"
        class="mt-1 ml-5"
      />
      <transition v-if="isExpanded">
        <span
          v-if="auth.isAuthenticated.value === false"
          @click="auth.redirectToLogin()"
          class="overflow-hidden px-4 font-bold"
          ss
        >
          {{ t("navigation.log-in") }}
        </span>
      </transition>
    </div>

    <div
      v-if="auth.isAuthenticated.value === true"
      class="flex flex-col items-center whitespace-nowrap"
    >
      <div class="mb-3 flex flex-row items-center whitespace-nowrap">
        <base-tooltip
          v-if="!isExpanded"
          class="hover:text-accent-accent cursor-pointer"
          position="top-right"
          :tooltip-offset="8"
        >
          <template #activator="{ on }">
            <div v-on="on">
              <unicon
                :name="Unicons.UserCircle.name"
                height="20"
                class="mt-1 ml-5"
              />
            </div>
          </template>
          <template #default>
            <span class="w-max hover:text-accent-accent">
              <div>
                {{ getUserName(auth) }}
              </div>
            </span>
          </template>
        </base-tooltip>
        <unicon
          v-if="isExpanded"
          :name="Unicons.UserCircle.name"
          height="20"
          class="mt-1 ml-5"
        />
        <transition v-if="isExpanded">
          <span class="overflow-hidden px-4 font-bold">
            {{ getUserName(auth) }}
          </span>
        </transition>
      </div>
      <div
        class="flex flex-row items-center hover:text-accent-accent cursor-pointer whitespace-nowrap"
      >
        <base-tooltip
          v-if="!isExpanded"
          position="top-right"
          :tooltip-offset="8"
        >
          <template #activator="{ on }">
            <div v-on="on">
              <unicon
                @click="() => openConfirmationModal()"
                :name="Unicons.SignOut.name"
                height="20"
                class="mt-1 ml-5"
              />
            </div>
          </template>
          <template #default>
            <span class="w-max hover:text-accent-accent">
              <div>
                {{ t("navigation.log-out") }}
              </div>
            </span>
          </template>
        </base-tooltip>
        <unicon
          v-if="isExpanded"
          @click="() => openConfirmationModal()"
          :name="Unicons.SignOut.name"
          height="20"
          class="mt-1 ml-5"
        />
        <transition v-if="isExpanded">
          <span
            @click="() => openConfirmationModal()"
            class="overflow-hidden px-4 font-bold"
          >
            {{ t("navigation.log-out") }}
          </span>
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useTenant from "@/composables/useTenant";
import { inject } from "vue";
import { TypeModals } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useApp } from "@/composables/useApp";
import { useAuth } from "session-vue-3-oidc-library";
import { useBaseModal } from "@/composables/useBaseModal";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { getUserName } from "../helpers";
import BaseTooltip from "@/components/base/BaseTooltip.vue";

defineProps({
  isExpanded: Boolean,
});

const auth = useAuth();
const config = inject<{
  features: { hasTenantSelect: boolean };
  allowAnonymousUsers: boolean;
}>("config");

const route = useRoute();
const { initApp } = useApp();
const { t } = useI18n();
const { initializeConfirmModal } = useConfirmModal();
const { closeModal } = useBaseModal();
const { setTennantInSession } = useTenant();

const performLogout = async () => {
  await auth.logout();
  setTennantInSession("");
  if (route.meta.requiresAuth === true) await auth.redirectToLogin();
  await initApp(auth, config);
};

const openConfirmationModal = () => {
  initializeConfirmModal({
    confirmButton: {
      buttonCallback: async () => {
        await performLogout();
      },
    },
    declineButton: {
      buttonCallback: () => {
        closeModal(TypeModals.Confirm);
      },
    },
    translationKey: "logout-modal",
    openImmediately: true,
  });
};
</script>

<style></style>
