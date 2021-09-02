<template>
  <div class="p-6 bg-neutral-0">
    <BaseButton label="Discard" @click="discard" />
    <BaseButton label="Save" @click="save" />

    <Form @submit="onSubmit">
      <div v-for="row in values" :key="row.key" class="my-2">
        <span class="label" :class="{ loading }">{{ row.key }}</span>
        <Field name="row.key" />
      </div>
    </Form>
  </div>
  <div class="p-6 bg-neutral-20">
    <h2>Add meta data</h2>
    <Dropdown v-model="newType" label="Type" :options="[]" />
    <InputField v-model="newValue" label="Value" />
    <BaseButton label="Add" :icon="Unicons.PlusCircle.name" @click="add" />
  </div>
</template>

<script lang="ts">
  import { Metadata } from '@/queries';
  import { defineComponent, PropType, ref } from 'vue';
  import { useForm, Field, Form } from 'vee-validate';
  import BaseButton from '@/components/base/BaseButton.vue';
  import Dropdown from '@/components/base/Dropdown.vue';
  import InputField from '@/components/base/InputField.vue';
  import { Unicons } from '@/types';
  import { MetaKey } from '@/queries';

  export default defineComponent({
    name: 'MetaView',
    components: { BaseButton, Dropdown, Field, Form, InputField },
    props: {
      error: { type: String, default: '' },
      loading: { type: Boolean, default: false },
      metadata: { type: Array as PropType<Metadata[]>, required: true },
      discard: { type: Function as PropType<() => void>, required: true },
      save: { type: Function as PropType<(x: Metadata[]) => void>, required: true },
    },
    setup(props) {
      const newType = ref(MetaKey.Description);
      const newValue = ref('');
      const { values, setValues, handleSubmit } = useForm({
        initialValues: props.metadata,
      });
      return {
        Unicons,
        values,
        newType,
        newValue,
        onSubmit: handleSubmit(props.save),
        add() {
          setValues([...values, { key: newType.value, value: newValue.value }]);
          newValue.value = '';
        },
      };
    },
  });
</script>

<style lang="postcss" scoped></style>
