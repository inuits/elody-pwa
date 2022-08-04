<template>
  <div class="flex flex-col w-full h-full">
    <div
      ref="dropzoneDiv"
      class="
        bg-white-background
        w-full
        bg-blue
        inline-block
        border-dashed border-4 border-blue-light
        rounded
        p-5
      "
      :class="{
        'flex  justify-center items-center cursor-pointer': fileCount === 0,
        'justify-items-center grid grid-cols-6 place-content-start gap-4 ':
          fileCount !== 0,
      }"
      style="height: -webkit-calc(100% - 40px);"
    >
      <div
        v-show="fileCount === 0"
        class="inline-block w-9/12 text-center"
      >
        <div class="dz-message"  data-dz-message>
          <span v-if="total === 0">Drag your files, or click here to add your files</span>
          <div v-else>
            <div v-show="total === failed + success" style="width: fit-content" class="px-5 text-left border-4 border-neutral-100 py-5 rounded-md">
              <div class="flex justify-between">
                <div class="text-lg text-center pb-8 text-red-dark">{{failed}} file(s) failed to upload.</div>
                <div class="text-lg text-center pb-8 text-green-default">{{success}} file(s) successfully uploaded.</div>
              </div>
              <div class="text-red-dark truncate" v-for="errorMessage in errorMessages" :key="errorMessage">
                - {{errorMessage}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button
      v-if="doUpload"
      type="button"
      class="
        py-2
        mt-3
        px-4
        w-full
        bg-blue-400
        text-neutral-0
        rounded-sm
        hover:shadow-xl
        text-sm
      "
      :class="fileCount === 0 ? 'opacity-25 cursor-none' : 'cursor-pointer'"
      tabindex="-1"
      :disabled="fileCount === 0"
      @click="doUpload"
    >
      <div class="flex justify-center" v-if="total !== failed + success">
        <div class="flex" style="width: fit-content">
          <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Uploading...
        </div>
      </div>
      <div v-else>
        upload
      </div>
    </button>
  </div>
  <div class="hidden">
    <div
      ref="dropzonePreviewDiv"
      class="
        dz-preview dz-file-preview
        w-40
        mi-h-28
        flex flex-col
        justify-center
        items-center
        hover:bg-blue-default10
        p-3
        rounded
        relative
      "
    >
      <a
        data-dz-remove
        class="
          cursor-pointer
          absolute
          flex
          justify-center
          items-center
          top-2
          right-2
          bg-red-default
          rounded-full
          w-6
          h-6
          shadow
          hover:shadow-xl
        "
      >
        <svg
          width="9"
          height="11"
          viewBox="0 0 7 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.5 3V8H1.5V3H5.5ZM4.75 0H2.25L1.75 0.5H0V1.5H7V0.5H5.25L4.75 0ZM6.5 2H0.5V8C0.5 8.55 0.95 9 1.5 9H5.5C6.05 9 6.5 8.55 6.5 8V2Z"
            fill="white"
          />
        </svg>
      </a>
      <svg
        width="32"
        height="39"
        viewBox="0 0 32 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M31 35.7749C31 36.9828 29.9722 38 28.7516 38H3.24839C2.02784 38 1 36.9828 1 35.7749V3.22509C1 2.01718 2.02784 1 3.24839 1H24.5118L31 7.42096V35.7749Z"
          fill="white"
          stroke="#BFC5E0"
          stroke-miterlimit="10"
        />
      </svg>

      <div class="dz-filename text-blue font-body text-sm mt-3 w-full">
        <span class="inline-block w-full text-center break-words" data-dz-name></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { PostMediaFileDocument, PostMediaFileMutation } from '@/queries';
  import useDropzoneHelper from '../composables/useDropzoneHelper';
  import { onMounted, ref, defineComponent, PropType } from 'vue';
  import { useMutation } from '@vue/apollo-composable';
  import Dropzone from 'dropzone';

  export default defineComponent({
    name: 'Dropzone',
    props: {
      progress: {
        type: [String, Number, Object] as PropType<any>,
        require: false,
        default: undefined,
      },
    },
    emits: ['update:progress'],
    setup(props, { emit }) {
      const { errorMessages, total, failed, success, increaseSuccessCounter, clearDropzoneErrorMessages, clearDropzoneCounters, getDropzoneSettings, increaseFailedCounter, setTotalCounter } = useDropzoneHelper();
      const { mutate, onDone, onError } = useMutation<PostMediaFileMutation>(PostMediaFileDocument);
      const dropzonePreviewDiv = ref<HTMLDivElement | undefined>(undefined);
      const dropzoneDiv = ref<HTMLDivElement | undefined>(undefined);
      const doUpload = ref<() => void | undefined>();
      const uploading = ref<boolean>(false);
      const fileCount = ref<number>(0);

      onMounted(async () => {
        if (dropzoneDiv.value && dropzonePreviewDiv) {
          const myDropzone = new Dropzone(dropzoneDiv.value, getDropzoneSettings(dropzonePreviewDiv));

          const updateFileCount = () => {
            if (myDropzone) {
              fileCount.value = myDropzone?.files.length;
            }
          };

          myDropzone.on('removedfile', (value: any) => {
            updateFileCount();
          });

          myDropzone.on('addedfile', (value: any) => {
            clearDropzoneCounters();
            clearDropzoneErrorMessages();
            updateFileCount();
          });

          onDone(() => {
            increaseSuccessCounter();
          });

          doUpload.value = () => {
            uploading.value = true;
            setTotalCounter(myDropzone.files.length);
            myDropzone.files.forEach((file: any) => {
              mutate({
                mediaFileInput: { filename: file.upload.filename, metadata: [] },
                file: file,
              });
            });
            myDropzone.removeAllFiles();
          };
        }
      });

      return {
        dropzonePreviewDiv,
        errorMessages,
        dropzoneDiv,
        fileCount,
        doUpload,
        success,
        failed,
        total,
      };
    },
  });
</script>
<style scoped>
  .dz-preview a {
    display: none;
  }
  .dz-preview:hover a {
    display: flex;
  }
</style>
