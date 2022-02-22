<template>
  <div class="p-6 bg-neutral-20 w-full">
    <h2>Add meta data</h2>
    <!-- <Dropdown v-model="newType" label="Type" :options="labels" />
    <InputField v-model="newValue" label="Value" />
    <BaseButton
      label="Add"
      :icon="Unicons.PlusCircle.name"
      :icon-color="'var(--color-neutral-10)'"
      :bg-color="'blue-400'"
      :txt-color="'neutral-0'"
      @click="add"
    /> -->
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import BaseButton from '@/components/base/BaseButton.vue';
  import Dropdown from '@/components/base/Dropdown.vue';
  import InputField from '@/components/base/InputField.vue';
  import { useQuery } from '@vue/apollo-composable';
  import { Unicons } from '@/types';

  export default defineComponent({
    name: 'MetaAdd',
    // components: { Dropdown, BaseButton, InputField },
    emits: ['addMetadata'],
    setup(props, { emit }) {
      // const newType = ref(MetaKey.Type);
      // const newValue = ref('');
      // const { result } = useQuery(GetEnumsByNameDocument, { enumName: 'MetaKey' });

      // const add = () => {
      //   emit('addMetadata', { key: newType.value, value: newValue.value });
      // };

      // const labels = computed(() =>
      //   result.value?.__type?.enumValues
      //     ?.filter((val: any) => val.name !== MetaKey.Title)
      //     .map((val: any) => {
      //       return val.name;
      //     }),
      // );

      return {
        // add,
        // labels,
        // Unicons,
        // newValue,
        // newType,
      };
    },
  });
</script>
