<template>
  <div>
    <h1>create frame form...</h1>
    <div class="p-6 bg-neutral-0 pb-20">
      <form v-if="result">
        <div
          v-for="field in result.Form.fields"
          :key="field.__typename === 'MetadataField' ? field.key : 'no key'"
        >
          <MetaEditDataField
            v-if="field && field.__typename === 'MetadataField'"
            v-model="EntityTitle"
            :field-key="field.key"
            :label="field.label"
            @change="log(field)"
          />

          <!-- <MetaEditRelationField
            v-else-if="field && field.__typename === 'RelationField'"
            :structure="field"
            :label="field.label"
          /> -->
        </div>
        <input v-model="manualID" type="text" placeholder="id" />
        <BaseButton label="create" @click="create" />
      </form>
    </div>
  </div>
</template>
<script lang="ts">
  import {
    GetFormsDocument,
    CreateEntityDocument,
    CreateEntityMutation,
  } from '@/queries';
  import { useQuery, useMutation } from '@vue/apollo-composable';
  import { defineComponent, watch, ref } from 'vue';
  /*   import MetaEditRelationField from '../components/MetaEditRelationField.vue';
  emit van comp nog doen child emit naar parent modelvalue 
   */
  import BaseButton from '../components/base/BaseButton.vue';
  import MetaEditDataField from '../components/MetaEditDataField.vue';

  export default defineComponent({
    name: 'CreateFrame',
    components: { MetaEditDataField /* MetaEditRelationField */, BaseButton },

    setup() {
      const { result } = useQuery(GetFormsDocument, {
        type: 'frame',
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
              type: 'frame',
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
