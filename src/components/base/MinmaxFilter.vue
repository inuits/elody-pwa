<template>
  <div class="flex md:justify-around">
    <MinMaxField
      id="inputBox"
      v-model="returnObject.value.min"
      :debounce="true"
      placeholder="min"
      :bg-color="'neutral-20'"
      label="min"
      min="0"
    />
    <MinMaxField
      v-model="returnObject.value.max"
      :debounce="true"
      placeholder="max"
      :bg-color="'neutral-20'"
      label="max"
      :min="returnObject.value.min + 1"
    />
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType, ref, watch } from 'vue';
  import MinMaxField from '@/components/base/MinMaxField.vue';

  export default defineComponent({
    name: 'MinmaxFilter',
    components: {
      MinMaxField,
    },
    props: {
      filterkey: {
        type: [String],
        required: true,
      },
    },
    emits: ['update:minmaxValue'],
    setup(props, { emit }) {
      type returnObjectType = {
        key: string;
        value: { min: number | undefined; max: number | undefined };
      };

      const returnObject = ref<returnObjectType>({
        key: props.filterkey,
        value: { min: undefined, max: undefined },
      });

      watch(returnObject.value, () => {
        if (
          (returnObject.value.value.min != undefined ||
            returnObject.value.value.max != undefined) &&
          (returnObject.value.value.min != 0 || returnObject.value.value.max != 0)
        ) {
          emit('update:minmaxValue', returnObject.value);
        } else {
          emit('update:minmaxValue', {
            key: props.filterkey,
            value: undefined,
          });
        }
      });

      return { returnObject };
    },
  });
</script>
