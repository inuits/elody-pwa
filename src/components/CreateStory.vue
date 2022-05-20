<template>
  <div>
    <h1>create story form...</h1>
    <div class="p-6 bg-neutral-0 pb-20">
      <form v-if="result">
        <div
          v-for="field in result.Form.fields"
          :key="field?.__typename === 'MetadataField' ? field.key : 'no key'"
        >
          <MetaEditDataField
            v-if="field && field.__typename === 'MetadataField'"
            :field-key="field.key"
            :label="field.label"
          />
          <MetaEditRelationField
            v-else-if="field && field.__typename === 'RelationField'"
            :structure="field"
            :label="field.label"
          />
        </div>
      </form>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, watch } from 'vue';
  import MetaEditRelationField from '../components/MetaEditRelationField.vue';
  import MetaEditDataField from '../components/MetaEditDataField.vue';
  import { GetFormsDocument } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  export default defineComponent({
    name: 'CreateStory',
    components: { MetaEditDataField, MetaEditRelationField },
    setup() {
      const { result } = useQuery(GetFormsDocument, {
        type: 'story',
      });

      watch(result, () => {
        console.log('result ', result.value);
      });

      return { result };
    },
  });
</script>
