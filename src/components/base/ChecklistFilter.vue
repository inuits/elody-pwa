<template>
  <div>
    <AndOrToggle v-model:AndOrValue="returnObject.AndOrValue" texton="En" textoff="Of" />
  </div>
  <div>
    <ul v-for="option in options?.FilterOptions" :key="option">
      <li>
        <input
          :id="option.label"
          v-model="returnObject.value"
          type="checkbox"
          :name="option.label"
          :value="option.value"
        />
        <label
          :for="option.label"
          class="ml-2 align-center p-10px cursor-pointer display-inline-block"
        >
          {{ option.label.charAt(0).toUpperCase() + option.label.slice(1) }}</label
        >
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
  import { GetFilterOptionsDocument } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import { defineComponent, ref, watch } from 'vue';
  import AndOrToggle from './AndOrToggle.vue';
  export default defineComponent({
    name: 'ChecklistFilter',
    components: { AndOrToggle },
    props: {
      filterkey: {
        type: [String],
        required: true,
      },
    },
    emits: ['update:listValue'],
    setup(props, { emit }) {
      type returnObject = {
        key: string;
        value: boolean[] | undefined;
        AndOrValue: boolean;
      };

      const returnObject = ref<returnObject>({
        key: props.filterkey,
        value: [],
        AndOrValue: true,
      });

      const { result: options } = useQuery(GetFilterOptionsDocument, {
        key: props.filterkey,
      });

      watch(returnObject.value, () => {
        if (returnObject.value.value == undefined) {
          returnObject.value.value = [];
        }

        emit('update:listValue', returnObject.value);
      });

      return { options, returnObject };
    },
  });
</script>
