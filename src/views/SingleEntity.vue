<template>
  <BaseSingleEntity
    v-if="useOldComponent"
    :isSelectionDisplayed="true"
    :isMetaDisplayed="true"
    :isMediaFileSingle="false"
    :entityType="Entity"
  />
  <entity-single v-else></entity-single>
</template>

<script lang="ts" setup>
import BaseSingleEntity from "@/components/base/BaseSingleEntity.vue";
import { inject } from "vue";
import EntitySingle from "../components/EntitySingle.vue";

const config: any = inject("config");
const useOldComponent = config.features.useOldSingleEntityComponent;
</script>
