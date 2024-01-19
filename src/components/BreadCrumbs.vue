<template>
  <div>
    <div class="flex h-10 z-[70] relative">
      <div
        :class="[
          'flex justify-center items-center bg-neutral-light h-full',
          { 'rounded-t-xl rounded-br-xl': showHistory },
          { 'rounded-xl': !showHistory },
        ]"
      >
        <div
          class="flex items-center px-2 cursor-pointer"
          @click="navigateToEntity(visitedRoutes[0])"
        >
          <unicon
            v-if="Unicons[selectedMenuItem?.icon as unknown as DamsIcons]"
            height="24"
            :name="Unicons[selectedMenuItem?.icon as unknown as DamsIcons].name"
          ></unicon>
          <CustomIcon
            v-else
            :icon="(selectedMenuItem?.icon as string)"
            :size="24"
            color="text-body"
          />
        </div>
        <div
          v-if="visitedRoutes.length > 3"
          @click="toggleList()"
          class="flex cursor-pointer"
        >
          <unicon height="24" :name="Unicons.EllipsisH.name"></unicon>
          <p class="ml-1">{{ visitedRoutes.length - 2 }}</p>
        </div>
        <unicon
          v-if="visitedRoutes.length > 2"
          height="24"
          :name="Unicons.AngleRight.name"
        ></unicon>
        <p
          v-if="previousRoute?.routeName && previousRoute !== visitedRoutes[0]"
          :class="[
            'px-2 ',
            { 'cursor-pointer': visitedRoutes.length > 2 },
            { 'max-w-[40vw] truncate': truncatePreviousRouteName },
          ]"
          @mouseenter="truncatePreviousRouteName = false"
          @mouseleave="truncatePreviousRouteName = true"
          @click="navigateToEntity(previousRoute)"
        >
          {{ t(previousRoute?.routeName) }}
        </p>
      </div>
      <div class="flex h-full justify-center items-center px-2">
        <unicon height="24" :name="Unicons.AngleRight.name" />
      </div>
      <div
        :class="[
          'flex max-w-[45vw] items-center subtitle text-neutral-black truncate',
          { 'max-w-[40vw] truncate': !truncatePreviousRouteName },
        ]"
      >
        {{ getCurrentRouteTitle }}
      </div>
    </div>
    <div
      v-if="showHistory"
      class="absolute bg-neutral-light rounded-b-md z-[70]"
    >
      <ul>
        <li
          v-show="showHistory"
          v-for="(route, index) in [...visitedRoutes].slice(0, -2).reverse()"
          :key="route.id"
          @click="navigateToEntity(route)"
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
                'cursor-pointer hover:bg-neutral-lightest w-full flex px-4',
                { 'justify-between': route.icon },
                { 'justify-end': !route.icon },
              ]"
            >
              <div class="mr-2" v-if="route.icon">
                <unicon
                  v-if="Unicons[route.icon]"
                  height="24"
                  :name="Unicons[route.icon].name"
                ></unicon>
                <CustomIcon
                  v-else
                  :icon="route.icon"
                  :size="24"
                  color="text-body"
                />
              </div>
              <p>{{ t(route.routeName) }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div
      v-if="showHistory"
      class="absolute top-0 left-0 h-screen w-screen z-[60]"
      @click="showHistory = false"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import type { DamsIcons } from "@/generated-types/queries";
import type { VisitedRoute } from "@/composables/useBreadcrumbs";
import CustomIcon from "./CustomIcon.vue";
import { ref, inject, computed } from "vue";
import { Unicons } from "@/types";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import { useI18n } from "vue-i18n";
import { useMenuHelper } from "@/composables/useMenuHelper";
import { useRouter } from "vue-router";

const config: any = inject("config");
const { t } = useI18n();
const { currentRouteTitle, visitedRoutes, previousRoute, resetVisitedRoutes } =
  useBreadcrumbs(config, t);
const { selectedMenuItem } = useMenuHelper();
const showHistory = ref<boolean>(false);
const truncatePreviousRouteName = ref<boolean>(true);
const router = useRouter();

router.beforeEach(() => {
  showHistory.value = false;
});

const getCurrentRouteTitle = computed<string>(() => {
  try {
    return t(currentRouteTitle.value);
  } catch {
    return currentRouteTitle.value;
  }
});

const toggleList = () => {
  if (!visitedRoutes.value.length) {
    return;
  }
  showHistory.value = !showHistory.value;
};

const navigateToEntity = (historyRoute: VisitedRoute) => {
  if (!historyRoute) return;
  if (historyRoute.path) {
    resetVisitedRoutes();
    router.push(historyRoute.path);
    return;
  }
  if (!historyRoute.id) {
    router.push({ name: "Home" });
    return;
  }
  router.push({
    params: { id: historyRoute.id },
  });
};
</script>

<style scoped></style>
