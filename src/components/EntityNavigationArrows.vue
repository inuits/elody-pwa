<template>
  <div v-if="visible" class="flex items-center justify-between w-full">
    <BaseTooltip position="bottom-start" :tooltip-offset="4">
      <template #activator="{ on }">
        <BaseButtonNew
          v-on="on"
          data-cy="entity-navigation-previous"
          class="!w-[30px] !h-[30px] !p-0"
          :icon="DamsIcons.ArrowCircleLeft"
          :icon-height="30"
          :disabled="!previousEntity"
          @click="navigateTo(previousEntity)"
        />
      </template>
      <span class="text-sm text-text-placeholder">{{
        t("entity-navigation.open-previous")
      }}</span>
    </BaseTooltip>
    <BaseTooltip position="bottom-end" :tooltip-offset="4">
      <template #activator="{ on }">
        <BaseButtonNew
          v-on="on"
          data-cy="entity-navigation-next"
          class="!w-[30px] !h-[30px] !p-0"
          :icon="DamsIcons.ArrowCircleRight"
          :icon-height="30"
          :disabled="!nextEntity"
          @click="navigateTo(nextEntity)"
        />
      </template>
      <span class="text-sm text-text-placeholder">{{
        t("entity-navigation.open-next")
      }}</span>
    </BaseTooltip>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { DamsIcons, type Entity } from "@/generated-types/queries";
import { useEntityPageConfig } from "@/composables/useEntityPageConfig";
import { useEntityNavigation } from "@/composables/useEntityNavigation";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { showNavigationArrows } = useEntityPageConfig();
const { getPreviousEntity, getNextEntity, getNavigationRoute, hasNavigationEntities } =
  useEntityNavigation();

const entityId = computed(() => String(route.params["id"] ?? ""));

const isSingleEntityPage = computed(
  () => route.name === "SingleEntity" || route.name === "SingleMediafile",
);

const previousEntity = computed<Entity | undefined>(() =>
  isSingleEntityPage.value ? getPreviousEntity(entityId.value) : undefined,
);

const nextEntity = computed<Entity | undefined>(() =>
  isSingleEntityPage.value ? getNextEntity(entityId.value) : undefined,
);

const ownsRouteState: boolean = inject("OwnsRouteState", true);

const visible = computed(
  () =>
    ownsRouteState &&
    isSingleEntityPage.value &&
    showNavigationArrows.value &&
    hasNavigationEntities(),
);

const navigateTo = (entity: Entity | undefined) => {
  if (!entity) return;
  router.push(getNavigationRoute(entity));
};
</script>

<style scoped></style>
