<template>
  <div>
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
          />
        </div>
        <input v-model="manualID" type="text" placeholder="id" />
        <BaseButton label="create" @click="create" />
      </form>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType, ref, watch } from 'vue';
  import MetaEditDataField from './MetaEditDataField.vue';
  import {
    CreateEntityDocument,
    CreateEntityMutation,
    Entitytyping,
    GetFormsDocument,
  } from '@/queries';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import BaseButton from './base/BaseButton.vue';
  import urlSlug from 'url-slug';
  import { useRouter } from 'vue-router';

  export default defineComponent({
    name: 'CreateEntityForm',
    components: { MetaEditDataField, BaseButton },
    props: {
      entityType: {
        type: String as PropType<Entitytyping>,
        required: true,
      },
    },
    setup(props) {
      const router = useRouter();
      const { result } = useQuery(GetFormsDocument, {
        type: props.entityType,
      });

      const EntityTitle = ref<string>('');

      const manualID = ref<string>('');

      const { mutate } = useMutation<CreateEntityMutation>(CreateEntityDocument);

      watch(EntityTitle, (value: string) => {
        manualID.value = urlSlug(value);
      });

      const create = async () => {
        await mutate({
          data: {
            type: props.entityType,
            id: '',
            metadata: [],
            title: EntityTitle.value,
            identifiers: [manualID.value],
          },
        });
        router.push({ name: 'SingleEntity', params: { id: manualID.value } });
      };

      return { result, create, EntityTitle, manualID };
    },
  });
</script>
