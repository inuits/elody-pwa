<template>
  <!-- Catalogue Breadcrumb: grey capsules joined by a light "›". -->
  <nav
    v-if="breadCrumbRoutesExist"
    :aria-label="t('navigation.breadcrumb')"
    class="relative z-notification flex min-w-0 flex-wrap items-center gap-2"
  >
    <template v-if="breadcrumbRoutes.length > 1">
      <button
        type="button"
        data-cy="breadcrumb-history"
        :aria-label="t('navigation.breadcrumb-history')"
        :aria-expanded="showHistory ? 'true' : 'false'"
        class="flex items-center gap-1 rounded-pill bg-surface-muted p-(--crumb-pad) text-table font-bold text-text-body hover:text-accent-ink"
        @click="toggleList()"
      >
        <unicon height="16" :name="Unicons.EllipsisH.name" aria-hidden="true" />
        {{ breadcrumbRoutes.length - 1 }}
      </button>
      <span class="text-border-dashed" aria-hidden="true">›</span>
    </template>
    <template v-if="previousRoute?.title">
      <a
        :href="crumbHref(previousRoute)"
        class="max-w-[40vw] truncate rounded-pill bg-surface-muted p-(--crumb-pad) text-table font-bold text-text-body hover:text-accent-ink hover:no-underline"
        :title="resolveTitle(previousRoute.title)"
        @click="onCrumbClick($event, previousRoute)"
      >
        {{ resolveTitle(previousRoute.title) }}
      </a>
      <span class="text-border-dashed" aria-hidden="true">›</span>
    </template>
    <span
      aria-current="page"
      class="flex min-w-0 items-center gap-1.5 rounded-pill bg-surface-muted p-(--crumb-pad) text-table font-bold text-text-body"
    >
      <MetadataFormatter v-if="typePillLabel" v-bind="typePillLabel" />
      <!-- Handoff: the current item is never cut off; a long title wraps the row instead. -->
      <span>{{ currentRouteTitle }}</span>
    </span>
    <ul
      v-if="showHistory"
      class="absolute left-0 top-full z-notification mt-1 min-w-48 rounded-card border border-border-subtle bg-surface p-1 shadow-overlay"
    >
      <li
        v-for="breadcrumbRoute in [...breadcrumbRoutes].slice(0, -1).reverse()"
        :key="breadcrumbRoute.title || breadcrumbRoute.overviewPage"
      >
        <a
          :href="crumbHref(breadcrumbRoute)"
          data-cy="breadcrumb-history-item"
          class="flex w-full items-center gap-2 rounded-button px-2 py-1 text-table text-text-body hover:bg-accent-wash hover:text-accent-ink hover:no-underline"
          @click="onCrumbClick($event, breadcrumbRoute)"
        >
          <template v-if="breadcrumbRoute.icon">
            <unicon
              v-if="Unicons[breadcrumbRoute.icon]"
              height="16"
              :name="Unicons[breadcrumbRoute.icon].name"
              aria-hidden="true"
            />
            <CustomIcon
              v-else
              :icon="breadcrumbRoute.icon"
              :size="16"
              color="text-body"
            />
          </template>
          {{ resolveTitle(breadcrumbRoute.title) }}
        </a>
      </li>
    </ul>
    <div
      v-if="showHistory"
      class="fixed inset-0 z-backdrop"
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

const { t, locale } = useI18n();
const config: any = inject("config");

const resolveTitle = (
  value: string | TranslationEntry[] | undefined,
): string => {
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

const showHistory = ref<boolean>(false);
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
  () => [
    locale.value,
    rootRoute.value?.rootTitle,
    rootRoute.value?.typePillLabel,
  ],
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
    secondaryButtonStyle: "commit",
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

const crumbTarget = (route: any) => {
  const type = Array.isArray(route.type) ? route.type[0] : route.type;
  if (route.id && route.routeName)
    return { name: route.routeName, params: { id: route.id, type } };
  if (route.id) return { params: { id: route.id, type } };
  if (route.overviewPage) return { name: route.overviewPage };
  return { name: "Home" };
};

const crumbHref = (route: any) => router.resolve(crumbTarget(route)).href;

// A modified or non-primary click opens the link elsewhere; the browser handles it.
const onCrumbClick = (event: MouseEvent, route: any) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (event.button !== 0) return;
  event.preventDefault();
  checkNavigationAvailable(route);
};

const navigateToEntity = (route: any) => {
  const target = crumbTarget(route);
  if (route.id && !route.routeName) router.replace(target);
  else if (route.overviewPage && !route.id) {
    // A leave prompt can cancel the navigation: keep the path until it lands.
    router.push(target).then((failure) => {
      if (!failure)
        clearBreadcrumbPathAndAddOverviewPage(
          route.title ?? route.overviewPage,
        );
    });
  } else router.push(target);
};
</script>

