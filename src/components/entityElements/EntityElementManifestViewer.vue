<template>
  <entity-element-wrapper
      :isCollapsed="element.isCollapsed"
      :label="element.label"
      class="h-[80vh]"
  >
    <template v-slot:content>
      <ManifestViewer
          v-if="element.manifestUrl"
          :manifest-url="element.manifestUrl"
      />
      <div v-else><p>{{t('manifest-viewer.no-manifest')}}</p></div>
    </template>
  </entity-element-wrapper>
</template>
<script lang="ts" setup>
import ManifestViewer from "@/components/ManifestViewer.vue";
import {useI18n} from "vue-i18n";
import type {ManifestViewerElement} from "@/generated-types/queries";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";

const props = defineProps<{
  element: ManifestViewerElement
}>()

const {t} = useI18n()
</script>
