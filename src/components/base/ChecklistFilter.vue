<template>
  <div>
    <AndOrToggle v-model:AndOrValue="isAnd" texton="En" textoff="Of" />
  </div>
  <div>
    <ul v-for="option in options?.FilterOptions" :key="option">
      <li>
        <input
          :id="option.label"
          v-model="inputFieldMulti"
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
  import {
    defaultReturnMultiSelectObject,
    FilterInList,
  } from '@/composables/useFilterHelper';
  import { GetFilterOptionsDocument, Maybe } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import { computed, defineComponent, PropType, ref } from 'vue';
  import AndOrToggle from './AndOrToggle.vue';
  export default defineComponent({
    name: 'ChecklistFilter',
    components: { AndOrToggle },
    props: {
      listValue: {
        type: Object as PropType<FilterInList>,
        required: false,
        default: undefined,
      },
      filterkey: {
        type: [String],
        required: true,
      },
    },
    emits: ['update:listValue'],
    setup(props, { emit }) {
      emit('update:listValue', defaultReturnMultiSelectObject(props.filterkey));
      const { result: options } = useQuery(GetFilterOptionsDocument, {
        key: props.filterkey,
      });

      const andOr = ref<'and' | 'or'>('and');
      const isAnd = computed<boolean>({
        get() {
          return andOr.value === 'and';
        },
        set(newValue) {
          if (newValue) {
            andOr.value = 'and';
          } else {
            andOr.value = 'or';
          }
          props.listValue &&
            props.listValue.input.multiSelectInput &&
            emit(
              'update:listValue',
              defaultReturnMultiSelectObject(props.filterkey, {
                value: props.listValue.input.multiSelectInput.value,
                AndOrValue: newValue,
              }),
            );
        },
      });

      const inputFieldMulti = computed<Maybe<Maybe<string>[]> | undefined>({
        get() {
          return props.listValue && props.listValue.input.multiSelectInput
            ? props.listValue.input.multiSelectInput.value
            : undefined;
        },
        set(value) {
          if (props.listValue) {
            emit(
              'update:listValue',
              defaultReturnMultiSelectObject(props.filterkey, {
                value: value,
                AndOrValue: isAnd.value,
              }),
            );
          }
        },
      });

      return { options, inputFieldMulti, isAnd };
    },
  });
</script>
