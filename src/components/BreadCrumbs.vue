<template>
  <div v-if="breadCrumbRoutesExist">
    <div
      class="flex flex-wrap gap-2 min-[900px]:h-10 min-[900px]:flex-nowrap relative z-notification"
    >
      <div
        :class="[
          'flex justify-center items-center bg-accent-highlight h-full',
          { 'rounded-t-xl rounded-br-xl': showHistory },
          { 'rounded-xl': !showHistory },
        ]"
      >
        <div
          v-if="breadcrumbRoutes.length > 1"
          @click="toggleList()"
          class="flex cursor-pointer"
        >
          <unicon height="24" :name="Unicons.EllipsisH.name"></unicon>
          <p class="ml-1">{{ breadcrumbRoutes.length - 1 }}</p>
        </div>
        <unicon
          v-if="breadcrumbRoutes.length > 1"
          height="24"
          :name="Unicons.AngleRight.name"
        ></unicon>
        <p
          v-if="previousRoute?.title"
          :class="[
            'px-2 cursor-pointer',
            { 'max-w-[40vw] truncate': truncatePreviousRouteName },
          ]"
          @mouseenter="
            truncatePreviousRouteName = t(previousRoute.title).includes(' ')
          "
          @mouseleave="truncatePreviousRouteName = true"
          @click="checkNavigationAvailable(previousRoute)"
        >
          {{ t(previousRoute?.title) }}
        </p>
      </div>
      <div
        v-if="previousRoute"
        class="flex h-full justify-center items-center px-2"
      >
        <unicon height="24" :name="Unicons.AngleRight.name" />
      </div>
      <div
        :class="[
          `flex max-w-[10vw] min-[1200px]:max-w-[20vw] min-[1250px]:max-w-[25vw] min-[1330px]:max-w-[30vw] min-[1400px]:max-w-[33vw] min-[1550px]:max-w-[40vw] min-[1650px]:max-w-[45vw]
            items-center subtitle text-neutral-black truncate`,
          { 'max-w-[40vw] truncate': !truncatePreviousRouteName },
        ]"
      >
        <div class="mr-2" v-if="typePillLabel">
          <MetadataFormatter class="p-2" v-bind="typePillLabel" />
        </div>
        {{ currentRouteTitle }}
      </div>
    </div>
    <div
      v-if="showHistory"
      class="absolute bg-accent-highlight rounded-b-md z-notification"
    >
      <ul>
        <li
          v-show="showHistory"
          v-for="breadcrumbRoute in [...breadcrumbRoutes]
            .slice(0, -1)
            .reverse()"
          :key="breadcrumbRoute.title || breadcrumbRoute.overviewPage"
          @click="checkNavigationAvailable(breadcrumbRoute)"
        >
          <div class="flex flex-col items-end w-full">
            <div class="px-4">
              <unicon
                v-if="index !== 0"
                height="24"
                :name="Unicons.AngleUp.name"
              ></unicon>
            </div>
            <div
              :class="[
                'cursor-pointer hover:bg-background-normal w-full flex px-4',
                { 'justify-between': breadcrumbRoute.icon },
                { 'justify-end': !breadcrumbRoute.icon },
              ]"
            >
              <div class="mr-2" v-if="breadcrumbRoute.icon">
                <unicon
                  v-if="Unicons[breadcrumbRoute.icon]"
                  height="24"
                  :name="Unicons[breadcrumbRoute.icon].name"
                ></unicon>
                <CustomIcon
                  v-else
                  :icon="breadcrumbRoute.icon"
                  :size="24"
                  color="text-body"
                />
              </div>
              <p>{{ t(breadcrumbRoute.title) }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div
      v-if="showHistory"
      class="absolute top-0 left-0 h-screen w-screen z-backdrop"
      @click="showHistory = false"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import CustomIcon from "./CustomIcon.vue";
import { ref, computed, inject, watch } from "vue";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import {
  useBreadcrumbs,
  breadcrumbRoutes,
  rootRoute,
} from "@/composables/useBreadcrumbs";
import { useEditMode } from "@/composables/useEdit";
import { asString } from "@/helpers";
import { TypeModals } from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";
import { useBaseModal } from "@/composables/useBaseModal";
import { useConfirmModal } from "@/composables/useConfirmModal";
import MetadataFormatter from "@/components/metadata/MetadataFormatter.vue";

const { t, locale } = useI18n();
const config: any = inject("config");

const showHistory = ref<boolean>(false);
const truncatePreviousRouteName = ref<boolean>(true);
const breadCrumbRoutesExist = computed(
  () => breadcrumbRoutes.value.length > 0 || !!currentRouteTitle.value,
);
const router = useRouter();
const { clearBreadcrumbPathAndAddOverviewPage, previousRoute } =
  useBreadcrumbs(config);
const { discardEditForForm } = useFormHelper();
const { initializeConfirmModal } = useConfirmModal();
const { closeModal } = useBaseModal();

const currentRouteTitle = ref<string>("");
const typePillLabel = ref<any>(undefined);

watch(
  () => [locale.value, rootRoute.value?.rootTitle],
  () => {
    const titleKey = rootRoute.value?.rootTitle as string;
    typePillLabel.value = rootRoute.value?.typePillLabel;
    if (titleKey) {
      currentRouteTitle.value = t(titleKey);
    } else {
      currentRouteTitle.value = "";
    }
  },
  { immediate: true },
);

router.beforeEach(() => {
  showHistory.value = false;
});

const toggleList = () => {
  if (!breadcrumbRoutes.value.length) {
    return;
  }
  showHistory.value = !showHistory.value;
};

const openDiscardModal = (route: any) => {
  const id = asString(route.id);
  const useEditHelper = useEditMode(id);
  initializeConfirmModal({
    confirmButton: {
      buttonCallback: () => {
        useEditHelper.discard();
        discardEditForForm(id);
        closeModal(TypeModals.Confirm);
        navigateToEntity(route);
      },
    },
    secondaryConfirmButton: {
      buttonCallback: async () => {
        await useEditHelper.save();
        closeModal(TypeModals.Confirm);
        navigateToEntity(route);
      },
      buttonStyle: "accentAccent",
    },
    declineButton: {
      buttonCallback: () => {
        closeModal(TypeModals.Confirm);
      },
    },
    translationKey: "discard-edit",
    openImmediately: true,
  });
};

const checkNavigationAvailable = (route: any) => {
  const useEditHelper = useEditMode(route.id);
  if (useEditHelper.isEdit) openDiscardModal(route);
  else navigateToEntity(route);
};

const navigateToEntity = (route: any) => {
  if (route.id) {
    router.replace({
      params: {
        id: route.id,
        type: Array.isArray(route.type) ? route.type[0] : route.type,
      },
    });
  } else if (route.overviewPage) {
    router.push({ name: route.overviewPage });
    clearBreadcrumbPathAndAddOverviewPage(route.overviewPage);
  } else router.push({ name: "Home" });
};
</script>

<style scoped></style>
