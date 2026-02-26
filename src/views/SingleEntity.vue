<template>
  <entity-single v-if="pageStatus === PageStatus.Success"></entity-single>
  <access-denied v-if="pageStatus === PageStatus.Forbidden"></access-denied>
  <unauthorized v-if="pageStatus === PageStatus.Unauthorized"></unauthorized>
  <not-found v-if="pageStatus === PageStatus.NotFound"></not-found>
</template>

<script lang="ts" setup>
import EntitySingle from "@/views/EntitySingle.vue";
import { usePageStatus } from "@/composables/usePageStatus";
import { PageStatus } from "@/generated-types/queries";
import NotFound from "@/views/errorViews/NotFound.vue";
import AccessDenied from "@/views/errorViews/AccessDenied.vue";
import Unauthorized from "@/views/errorViews/Unauthorized.vue";

const { pageStatus } = usePageStatus();
</script>
