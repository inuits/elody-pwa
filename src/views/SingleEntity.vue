<template>
  <div class="h-full w-full flex relative">
    <div class="flex w-4/6">
      <IIIFViewer v-if="!loading" :image-url="mediafile?.original_file_location" />
      <div
        v-if="editMode"
        class="
          absolute
          bottom-6
          z-20
          flex flex-column
          rounded
          gap-x-2
          bg-neutral-0
          shadow-2xl
          px-4
          py-2
          ml-6
        "
      >
        <BaseButton
          :bg-color="'blue-400'"
          :txt-color="'neutral-0'"
          label="Save"
          @click="save()"
        />
        <BaseButton
          label="Discard"
          bg-color="'neutral-0'"
          :border-color="'red-default'"
          :txt-color="'red-default'"
          @click="discard()"
        />
      </div>
    </div>
    <Meta
      class="w-2/6"
      :entity-id="entityId"
      :metadata="metadata"
      :edit-mode="editMode"
      :entity-title="title"
    />
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, inject, provide, ref, Ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useQuery } from '@vue/apollo-composable';

  import BaseButton from '@/components/base/BaseButton.vue';
  import IIIFViewer from '@/components/IIIFViewer.vue';
  import Meta from '@/components/Meta.vue';
  import { GetEntityByIdDocument } from '@/queries';
  import { usePageTitle } from '@/components/TheHeader.vue';
  import { Unicons } from '@/types';
  import { useEditMode } from '@/components/EditToggle.vue';

  const asString = (x: string | string[]) => (Array.isArray(x) ? x[0] : x);

  export default defineComponent({
    name: 'SingleEntity',
    components: { IIIFViewer, BaseButton, Meta },
    setup() {
      const { editMode, disableEditMode } = useEditMode();
      const id = asString(useRoute().params['id']);
      const { result, error, loading, refetch } = useQuery(GetEntityByIdDocument, { id });
      const title = computed(() => result.value?.Entity?.title[0]?.value);

      const { updatePageTitle } = usePageTitle();

      watch(title, (value: string | undefined) => {
        value && updatePageTitle(value);
      });

      const saveCallbacks = ref<{ (): Promise<void> }[]>([]);

      provide('saveCallBacks', saveCallbacks.value);
      provide('addSaveCallBacks', (input: () => Promise<void>) =>
        saveCallbacks.value.push(input),
      );

      const save = () => {
        saveCallbacks.value.forEach((callback: () => Promise<void>) => {
          callback().then(() => {
            if (editMode) {
              editMode.value = false;
              refetch();
            }
          });
        });
      };

      const discard = () => {
        disableEditMode();
        saveCallbacks.value = [];
      };

      return {
        Unicons,
        editMode,
        loading,
        error,
        title,
        metadata: computed(() => result?.value?.Entity?.metadata || []),
        mediafile: computed(() => result?.value?.Entity?.mediafiles?.[0]),
        save,
        discard,
        entityId: computed(() => {
          return id;
        }),
      };
    },
  });
</script>
