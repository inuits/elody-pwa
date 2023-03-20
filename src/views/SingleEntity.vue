<template>
  <BaseSingleEntity
    v-if="useOldComponent"
    :isSelectionDisplayed="true"
    :isMetaDisplayed="true"
    :isMediaFileSingle="false"
    :entityType="Entitytyping.Asset"
  />
  <entity-single v-else></entity-single>
</template>

<script lang="ts" setup>
import BaseSingleEntity from "@/components/base/BaseSingleEntity.vue";
import { inject } from "vue";
import EntitySingle from "../components/EntitySingle.vue";
import { Entitytyping } from "@/generated-types/queries";

const config: any = inject("config");
const useOldComponent = config.features.useOldSingleEntityComponent;
</script>
