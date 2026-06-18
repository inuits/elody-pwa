<template>
  <div class="!bg-background-light">
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
      <span
        v-if="auth.isAuthenticated.value === false && isExpanded"
        @click="auth.redirectToLogin()"
        class="overflow-hidden px-4 font-bold"
      >
        {{ t("navigation.log-in") }}
      </span>
    </div>

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
            <router-link :to="`/user/${elodyUser.id}`"
              ><div v-on="on">
                <unicon
                  :name="Unicons.UserCircle.name"
                  height="20"
                  class="mt-1 ml-5"
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
          class="mt-1 ml-5"
        />
        <span v-if="isExpanded" class="overflow-hidden px-4 font-bold">
          {{ getUserName() }}
        </span>
      </div>
      <div
        class="flex flex-row hover:text-accent-accent cursor-pointer whitespace-nowrap"
      >
        <base-tooltip
          v-if="!isExpanded"
          position="top-right"
          :tooltip-offset="8"
        >
          <template #activator="{ on }">
            <div v-on="on">
              <unicon
                @click="openConfirmationModal"
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
          @click="openConfirmationModal"
          :name="Unicons.SignOut.name"
          height="20"
          class="mt-1 ml-5"
        />
        <span
          v-if="isExpanded"
          @click="openConfirmationModal"
          class="overflow-hidden px-4 font-bold"
        >
          {{ t("navigation.log-out") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { TypeModals } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { auth } from "@/main";
import { useBaseModal } from "@/composables/useBaseModal";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useI18n } from "vue-i18n";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { useAuth } from "@/composables/useAuth";

defineProps({
  isExpanded: Boolean,
});

const { t } = useI18n();
const { initializeConfirmModal } = useConfirmModal();
const { closeModal } = useBaseModal();
const { performLogout, getUserName, elodyUser } = useAuth();

const openConfirmationModal = () => {
  initializeConfirmModal({
    confirmButton: {
      buttonCallback: performLogout,
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

