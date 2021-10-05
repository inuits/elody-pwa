<script lang="ts">
  import { defineComponent, inject, PropType } from 'vue';

  export default defineComponent({
    name: 'AddSaveCallback',
    props: {
      callback: { type: Function as PropType<() => void>, required: true },
    },
    setup(props) {
      const addSaveCallBacks: any = inject('addSaveCallBacks');

      if (addSaveCallBacks && props.callback) {
        addSaveCallBacks(props.callback);
      }
    },
  });
</script>
