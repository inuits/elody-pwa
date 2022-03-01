<template>
  <div>
    <InputField
      v-model="returnObject.value"
      :debounce="true"
      :placeholder="text"
      :bg-color="'neutral-20'"
    />
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import InputField from '@/components/base/InputField.vue';
  export default defineComponent({
    name: 'TextFilter',
    components: {
      InputField,
    },
    props: {
      text: {
        type: String,
        required: false,
        default: '',
      },
      filterkey: {
        type: String,
        required: true,
      },
    },
    emits: ['update:inputValue'],
    setup(props, { emit }) {
      type returnObject = {
        key: string;
        value: string | undefined;
      };

      const returnObject = ref<returnObject>({ key: props.filterkey, value: '' });

      watch(returnObject.value, () => {
        if (returnObject.value.value != '' && returnObject.value.value != undefined) {
          emit('update:inputValue', returnObject.value);
        } else {
          emit('update:inputValue', returnObject.value);
        }
      });

      return { returnObject };
    },
  });
</script>
