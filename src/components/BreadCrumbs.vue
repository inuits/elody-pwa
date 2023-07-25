<template>
  <div>
    <div class="flex h-10">
      <div
        :class="[
          'flex justify-center items-center bg-neutral-light h-full',
          { 'rounded-t-xl rounded-br-xl': showHistory },
          { 'rounded-xl': !showHistory },
        ]"
      >
        <div
          class="px-2 cursor-pointer"
          @click="navigateToEntity({ id: '', routeName: '' })"
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
          v-if="previousRoute?.routeName"
          :class="[
            'px-2 ',
            { 'cursor-pointer': visitedRoutes.length > 2 },
            { 'max-w-[200px] truncate': truncatePreviousRouteName },
          ]"
          @mouseenter="truncatePreviousRouteName = false"
          @mouseleave="truncatePreviousRouteName = true"
          @click="navigateToEntity(previousRoute)"
        >
          {{ previousRoute?.routeName }}
        </p>
      </div>
      <div class="flex h-full justify-center items-center px-2">
        <unicon height="24" :name="Unicons.AngleRight.name" />
      </div>
      <div
        :class="[
          'flex h-full items-center subtitle text-neutral-black',
          { 'max-w-[200px] truncate': !truncatePreviousRouteName },
        ]"
      >
        {{ currentRouteTitle }}
      </div>
    </div>
    <div v-if="showHistory" class="absolute bg-neutral-light rounded-b-md">
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
              <p>{{ route.routeName }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import { useMenuHelper } from "@/composables/useMenuHelper";
import type { DamsIcons } from "@/generated-types/queries";
import CustomIcon from "./CustomIcon.vue";
import { ref, inject } from "vue";
import type { VisitedRoute } from "@/composables/useBreadcrumbs";
import { useRouter } from "vue-router";

const config: any = inject("config");
const showHistory = ref<boolean>(false);
const truncatePreviousRouteName = ref<boolean>(true);
const { currentRouteTitle, visitedRoutes, previousRoute } =
  useBreadcrumbs(config);
const { selectedMenuItem } = useMenuHelper();
const router = useRouter();

const toggleList = () => {
  if (!visitedRoutes.value.length) {
    return;
  }
  showHistory.value = !showHistory.value;
};

const navigateToEntity = (historyRoute: VisitedRoute) => {
  if (!historyRoute.id) {
    router.push({ name: "Home" });
    return;
  }
  router.push({
    params: { id: historyRoute.id },
  });
};

router.beforeEach(() => {
  showHistory.value = false;
});
</script>

<style scoped></style>
