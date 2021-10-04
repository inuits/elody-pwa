<template>
  <div class="p-6 bg-neutral-0">
        <BaseButton label="Save" @click="save" />
    <Form @submit="onSubmit">
      <div v-for="item in formMetadata" :key="item.key" class="flex flex-col mb-2 mt-2">
        <span class="text-sm flex" :class="{ loading }">{{ item.key }}</span>
        <Field name="item.value" />
      </div>
    </Form>
    <!-- <Form @submit="onSubmit">
      <div v-for="row in values" :key="row.key" class="flex flex-col mb-2 mt-2 overflow-y-auto">
        <span class="text-sm flex" :class="{ loading }" data-test="meta-label">
          {{ row.key }}
        </span>
         <InputField
          v-model="row.value"
          :debounce="true"
          placeholder=""
          :bgColor="'neutral-20'"
      />
      </div>
    </form> -->
    <MetaAdd @addMetadata="newMetadata"/>
  </div>
</template>

<script lang="ts">
  import { Metadata } from '@/queries';
  import { defineComponent, PropType, ref } from 'vue';
  import { useForm, Field, Form } from 'vee-validate';
  import { Unicons } from '@/types';
  import MetaAdd from '@/components/MetaAdd.vue';


  export default defineComponent({
    name: 'MetaView',
    components: { Form, Field, MetaAdd },
    props: {
      error: { type: String, default: '' },
      loading: { type: Boolean, default: false },
      metadata: { type: Array as PropType<Metadata[]>, required: true },
      discard: { type: Function as PropType<() => void>, required: true },
      save: { type: Function as PropType<(x: Metadata[]) => void>, required: true },
    },
    emits: ['updatedMetadata'],
    setup(props, {emit}) {
      let formMetadata = ref(props.metadata);
      const newMetadata = (metadata: Metadata) => {
        formMetadata.value.push(metadata);
        console.log(formMetadata.value.map(val => {return val.key;}));
      };
      const { values, handleSubmit } = useForm({initialValues: formMetadata});

      const saveChanges = () => {
        emit('updatedMetadata', values);
      };
      

      return {
        Unicons,
        values,
        newMetadata,
        onSubmit: handleSubmit(props.save),
      };
    },
  });
</script>

<style lang="postcss" scoped></style>
