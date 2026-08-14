<template>
  <nav v-if="breadCrumbRoutesExist" :aria-label="breadcrumbAriaLabel">
    <div
      class="flex flex-wrap gap-2 min-[900px]:h-10 min-[900px]:flex-nowrap relative z-notification"
    >
      <!-- pill capsule: ancestors are real links so middle-click works -->
      <div
        class="flex justify-center items-center bg-surface-muted h-full rounded-pill px-1"
      >
        <button
          v-if="breadcrumbRoutes.length > 1"
          type="button"
          :aria-expanded="showHistory"
          :aria-label="breadcrumbAriaLabel"
          class="flex items-center cursor-pointer rounded-pill border-none bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-accent-accent"
          @click="toggleList()"
        >
          <unicon height="24" :name="Unicons.EllipsisH.name"></unicon>
          <p class="ml-1">{{ breadcrumbRoutes.length - 1 }}</p>
        </button>
        <unicon
          v-if="breadcrumbRoutes.length > 1"
          height="24"
          :name="Unicons.AngleRight.name"
        ></unicon>
        <a
          v-if="previousRoute?.title"
          :href="resolveHref(previousRoute)"
          :class="[
            'px-2 cursor-pointer text-text-body no-underline',
            { 'max-w-[40vw] truncate': truncatePreviousRouteName },
          ]"
          @mouseenter="
            truncatePreviousRouteName = resolveTitle(previousRoute.title).includes(' ')
          "
          @mouseleave="truncatePreviousRouteName = true"
          @click.prevent="checkNavigationAvailable(previousRoute)"
        >
          {{ resolveTitle(previousRoute?.title) }}
        </a>
      </div>
      <div
        v-if="previousRoute"
        class="flex h-full justify-center items-center px-2"
      >
        <unicon height="24" :name="Unicons.AngleRight.name" />
      </div>
      <!-- the current record: never truncated, 15px heading -->
      <div aria-current="page" class="flex items-center text-heading font-bold text-text-body">
        <div class="mr-2" v-if="typePillLabel">
          <MetadataFormatter class="p-2" v-bind="typePillLabel" />
        </div>
        {{ currentRouteTitle }}
      </div>
    </div>
    <div
      v-if="showHistory"
      class="absolute bg-neutral-white border border-neutral-30 rounded-overlay shadow-overlay z-notification"
    >
      <ul>
        <li
          v-show="showHistory"
          v-for="breadcrumbRoute in [...breadcrumbRoutes]
            .slice(0, -1)
            .reverse()"
          :key="breadcrumbRoute.title || breadcrumbRoute.overviewPage"
        >
        <a
          :href="resolveHref(breadcrumbRoute)"
          class="block text-text-body no-underline"
          @click.prevent="checkNavigationAvailable(breadcrumbRoute)"
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
              <p>{{ resolveTitle(breadcrumbRoute.title) }}</p>
            </div>
          </div>
        </a>
        </li>
      </ul>
    </div>
    <div
      v-if="showHistory"
      class="absolute top-0 left-0 h-screen w-screen z-backdrop"
      @click="showHistory = false"
    ></div>
  </nav>
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
import { useFormHelper } from "@/composables/useFormHelper";
import { useConfirmModal } from "@/composables/useConfirmModal";
import MetadataFormatter from "@/components/metadata/MetadataFormatter.vue";
import type { TranslationEntry } from "@/composables/useMultilingualField";

const { t, te, locale } = useI18n();
const config: any = inject("config");

const resolveTitle = (value: string | TranslationEntry[] | undefined): string => {
  if (!value) return "";
  if (Array.isArray(value)) {
    return (
      value.find((entry) => entry.lang === locale.value)?.value ??
      value[0]?.value ??
      ""
    );
  }
  return t(value);
};

const breadcrumbAriaLabel = computed<string>(() =>
  te("navigation.breadcrumb") ? t("navigation.breadcrumb") : "Breadcrumb",
);

// Real hrefs for ancestor links (middle-click support); navigation itself
// still runs through the edit-discard guard on plain click.
const resolveHref = (route: any): string | undefined => {
  try {
    if (route.id)
      return router.resolve({
        params: {
          id: route.id,
          type: Array.isArray(route.type) ? route.type[0] : route.type,
        },
      }).href;
    if (route.overviewPage)
      return router.resolve({ name: route.overviewPage }).href;
  } catch {
    return undefined;
  }
  return undefined;
};

const showHistory = ref<boolean>(false);
const truncatePreviousRouteName = ref<boolean>(true);
const breadCrumbRoutesExist = computed(
  () => breadcrumbRoutes.value.length > 0 || !!currentRouteTitle.value,
);
const router = useRouter();
const { clearBreadcrumbPathAndAddOverviewPage, previousRoute } =
  useBreadcrumbs(config);
const { discardEditForForm } = useFormHelper();
const { confirm } = useConfirmModal();

const currentRouteTitle = ref<string>("");
const typePillLabel = ref<any>(undefined);

watch(
  () => [locale.value, rootRoute.value?.rootTitle, rootRoute.value?.typePillLabel],
  () => {
    typePillLabel.value = rootRoute.value?.typePillLabel;
    currentRouteTitle.value = resolveTitle(rootRoute.value?.rootTitle);
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

const openDiscardModal = async (route: any) => {
  const id = asString(route.id);
  const useEditHelper = useEditMode(id);
  const choice = await confirm({
    title: t("confirm.discard-edit.title"),
    message: t("confirm.discard-edit.message"),
    confirmLabel: t("confirm.discard-edit.confirm"),
    cancelLabel: t("confirm.discard-edit.cancel"),
    secondaryLabel: t("confirm.discard-edit.secondary-confirm"),
    secondaryButtonStyle: "accentAccent",
  });
  if (choice === "secondary") {
    await useEditHelper.save();
    navigateToEntity(route);
    return;
  }
  if (choice === "confirm") {
    useEditHelper.discard();
    discardEditForForm(id);
    navigateToEntity(route);
  }
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
