<template>
  <div class="p-6 bg-neutral-0">
    <div v-if="!editMode">
      <BaseButton @click="startEdit" label="Edit" />
    </div>
    <div v-else>
      <BaseButton @click="discardEdit" label="Discard" />
      <BaseButton @click="saveEdit" label="Save" />
    </div>

    <div v-for="item in data" :key="item.value" class="flex flex-col mb-2 mt-2">
      <span class="label" :class="{ loading }" data-test="meta-label">
        {{ item.key }}
      </span>
      <span v-if="!editMode" class="value" :class="{ loading }" data-test="meta-info">
        {{ item.value }}
      </span>
      <div v-else>
        Input
      </div>
    </div>

    <div v-if="editMode">
      New field input
    </div>
  </div>
</template>

<script lang="ts">
  import { Metadata } from '@/queries';
  import { defineComponent, PropType, ref, watch } from 'vue';
  import BaseButton from '@/components/base/BaseButton.vue';

  export default defineComponent({
    name: 'MetaView',
    components: { BaseButton },
    props: {
      error: { type: String, default: '' },
      loading: { type: Boolean, default: false },
      editMode: { type: Boolean, default: false },
      metadata: { type: Array as PropType<Metadata[]>, required: true },
      startEdit: { type: Function as PropType<() => void>, required: true },
      discardEdit: { type: Function as PropType<() => void>, required: true },
      saveEdit: { type: Function as PropType<() => void>, required: true },
      modelValue: { type: Boolean, default: false },
    },
    emits: ['update:modelValue'],
    setup(props) {
      const data = ref(props.metadata);
      watch(props, (x) => (data.value = x.metadata));
      return { data };
    },
  });
</script>

<style lang="postcss" scoped>
  .label {
    @apply rounded font-body text-xs text-neutral-60;
  }
  .value {
    @apply rounded font-body text-sm text-neutral-700 mt-0.5;
  }
  .label.loading,
  .value.loading {
    @apply bg-neutral-20 text-neutral-20;
  }
</style>
