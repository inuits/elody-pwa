<template>
  <div>
    <div class="flex h-10">
      <div
        :class="[
          'flex justify-center items-center bg-neutral-light w-10 h-full cursor-pointer',
          { 'rounded-t-xl': showHistory },
          { 'rounded-xl': !showHistory },
        ]"
        @click="showHistory = !showHistory"
      >
        <unicon
          v-if="selectedMenuItem?.icon && Unicons[selectedMenuItem?.icon as unknown as DamsIcons]"
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
      <div class="flex h-full justify-center items-center px-2">
        <unicon height="24" :name="Unicons.AngleRight.name" />
      </div>
      <div class="flex h-full items-center subtitle text-neutral-black">
        {{ currentRouteTitle }}
      </div>
    </div>
    <div
      v-if="showHistory"
      class="absolute bg-neutral-light rounded-tr-md rounded-b-md"
    >
      <ul>
        <li
          v-show="visitedRoutes.length"
          v-for="(route, index) in visitedRoutes.reverse()"
          :key="route.id"
          @click="navigateToEntity(route)"
        >
          <div class="flex flex-col items-end w-full p-4">
            <unicon
              v-if="index !== 0"
              height="24"
              :name="Unicons.AngleUp.name"
            ></unicon>
            <div
              class="cursor-pointer hover:bg-neutral-lightest w-full flex justify-end"
            >
              <p>{{ route.routeName }}</p>
            </div>
          </div>
        </li>
        <li v-show="!visitedRoutes.length" class="p-4">
          {{ t("breadcrumbs.noVisitedRoutes") }}
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
import { ref } from "vue";
import type { VisitedRoute } from "@/composables/useBreadcrumbs";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const showHistory = ref<boolean>(false);
const { currentRouteTitle, visitedRoutes } = useBreadcrumbs();
const { selectedMenuItem } = useMenuHelper();
const router = useRouter();
const { t } = useI18n();

const navigateToEntity = (historyRoute: VisitedRoute) => {
  router.push({
    params: { id: historyRoute.id },
  });
};

router.beforeEach(() => {
  showHistory.value = false;
});
</script>

<style scoped></style>
