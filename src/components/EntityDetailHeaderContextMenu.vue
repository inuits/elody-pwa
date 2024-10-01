<template>
  <div
    v-if="contextMenuActions"
    class="h-full flex justify-center items-center cursor-pointer"
  >
    <unicon
      :name="Unicons.EllipsisVThinline.name"
      @click.stop="(event: MouseEvent) => contextMenuHandler.openContextMenu({x: event?.clientX, y: event?.clientY})"
    />
    <base-context-menu :context-menu="contextMenuHandler.getContextMenu()">
      <context-menu-action
        :context-menu-actions="
          contextMenuActions.GetEntityDetailContextMenuActions
        "
        :entity-id="entityId"
        :entity-type="entityType as Entitytyping"
        @toggle-loading="toggleLoading"
      />
    </base-context-menu>
  </div>
</template>

<script setup lang="ts">
import { Unicons } from "@/types";
import ContextMenuAction from "@/components/context-menu-actions/ContextMenuAction.vue";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import { ref, computed } from "vue";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import { useQuery } from "@vue/apollo-composable";
import {
  Entitytyping,
  GetEntityDetailContextMenuActionsDocument,
  type GetEntityDetailContextMenuActionsQuery,
} from "@/generated-types/queries";
import { asString } from "@/helpers";
import { useRoute } from "vue-router";

const route = useRoute();
const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());
const entityId = computed<string>(() => asString(route.params["id"]));
const entityType = computed<string>(() => asString(route.params["type"]));

const { result: contextMenuActions } =
  useQuery<GetEntityDetailContextMenuActionsQuery>(
    GetEntityDetailContextMenuActionsDocument
  );
</script>

<style scoped></style>
