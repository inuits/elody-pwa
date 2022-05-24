<template>
  <div>
    <h1>create story form...</h1>
    <div class="p-6 bg-neutral-0 pb-20">
      <form v-if="result">
        <div
          v-for="field in result.Form.fields"
          :key="field.__typename === 'MetadataField' ? field.key : 'no key'"
        >
          <MetaEditDataField
            v-if="field && field.__typename === 'MetadataField'"
            :field-key="field.key"
            :label="field.label"
            v-model="EntityTitle"
          />
          <!--  <MetaEditRelationField
            v-else-if="field && field.__typename === 'RelationField'"
            :structure="field"
            :label="field.label"
          /> -->
        </div>
        <input type="text" placeholder="id" v-model="manualID" />
        <BaseButton label="create" @click="create" />
      </form>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import MetaEditRelationField from '../components/MetaEditRelationField.vue';
  import MetaEditDataField from '../components/MetaEditDataField.vue';
  import {
    CreateEntityDocument,
    CreateEntityMutation,
    GetFormsDocument,
  } from '@/queries';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import BaseButton from '../components/base/BaseButton.vue';

  export default defineComponent({
    name: 'CreateStory',
    components: { MetaEditDataField, /* MetaEditRelationField */ BaseButton },
    setup() {
      const { result } = useQuery(GetFormsDocument, {
        type: 'story',
      });

      const EntityTitle = ref<String>('');

      const manualID = ref<String>('');

      const log = (field: any) => {
        console.log('field ', field);
      };

      watch(result, () => {
        console.log('result ', result.value);
      });

      const { mutate } = useMutation<CreateEntityMutation>(CreateEntityDocument);

      const create = async () => {
        /* await mutate({
          data: {
            type: 'frame',
            id: '',
            uuid: '',
            metadata: [],
            title: titeltest.value,
          },
        }); */
        console.log(
          await mutate({
            data: {
              type: 'story',
              id: '',
              metadata: [],
              title: EntityTitle.value,
              identifiers: [manualID.value],
            },
          }),
        );
      };

      return { result, create, log, EntityTitle, manualID };
    },
  });
</script>
