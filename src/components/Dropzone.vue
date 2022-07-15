<template>
  <div class="flex flex-col w-full">
    <div
      ref="dropzoneDiv"
      class="bg-white-background w-full h-75-screen bg-blue inline-block border-dashed border-4 border-blue-light rounded p-5"
      :class="{
        'flex  justify-center items-center cursor-pointer': fileCount === 0,
        'justify-items-center grid grid-cols-4 place-content-start gap-4 ':
          fileCount !== 0,
      }"
    >
      <div
        v-show="fileCount === 0"
        class="inline-block w-9/12 text-center"
        @click="() => dropzoneDiv && dropzoneDiv.click()"
      >
        <span class="text-lg text-blue-default50">
          <a class="text-purple cursor-pointer">
            Drag your files, or click here to add your files
          </a>
        </span>
      </div>
    </div>
    <button
      v-if="doUpload"
      type="button"
      class="py-2 mt-3 px-4 w-full bg-blue-400 text-neutral-0 rounded-sm hover:shadow-xl text-sm"
      :class="fileCount === 0 ? 'opacity-25 cursor-none' : 'cursor-pointer'"
      tabindex="-1"
      :disabled="fileCount === 0"
      @click="doUpload"
    >
      
      upload
    </button>
  </div>
  <!-- Template for the preview of files -->
  <div class="hidden">
    <div
      ref="dropzonePreviewDiv"
      class="dz-preview dz-file-preview w-40 mi-h-28 flex flex-col justify-center items-center hover:bg-blue-default10 p-3 rounded relative"
    >
      <a
        data-dz-remove
        class="cursor-pointer absolute flex justify-center items-center top-2 right-2 bg-red-default rounded-full w-6 h-6 shadow hover:shadow-xl"
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
        <span
          class="inline-block w-full text-center break-words"
          data-dz-name
        ></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { onMounted, ref, defineComponent, PropType } from 'vue';
  import { useMutation } from '@vue/apollo-composable';
  import { PostMediaFileDocument, PostMediaFileMutation } from '@/queries';
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
      const dropzoneDiv = ref<HTMLDivElement | undefined>(undefined);
      const dropzonePreviewDiv = ref<HTMLDivElement | undefined>(undefined);
      const uploading = ref<boolean>(false);
      const doUpload = ref<() => void | undefined>();
      const fileCount = ref<number>(0);
      const { mutate } = useMutation<PostMediaFileMutation>(PostMediaFileDocument);

      onMounted(async () => {
        if (dropzoneDiv.value && dropzonePreviewDiv) {
          const myDropzone = new Dropzone(dropzoneDiv.value, {
            url: '/upload',
            autoProcessQueue: false,
            acceptedFiles: '.jpg',
            previewTemplate: dropzonePreviewDiv.value?.outerHTML,
            uploadMultiple: true,
            parallelUploads: 99,
            maxFiles: 99,
          });

          const updateFileCount = () => {
            if (myDropzone) {
              fileCount.value = myDropzone?.files.length;
            }
          };

          myDropzone.on('addedfile', (value: any) => {
            console.log('aded file: ', value);
            updateFileCount();
          });

          myDropzone.on('removedfile', (value: any) => {
            updateFileCount();
          });

          myDropzone.on('totaluploadprogress', (progressDropzone: any) => {
            const progress: any = {
              status: 'inProgress',
              progress: Math.round(progressDropzone),
              successFiles: 0,
              errorFiles: 0,
            };
            uploading.value && emit('update:progress', progress);
          });

          myDropzone.on(
            'completemultiple',
            (files: { status: 'error' | 'success' }[]) => {
              console.log('files: ', files);
              uploading.value = false;
              // myDropzone.removeAllFiles();

              const progress: any = {
                status: 'success',
                progress: 0,
                successFiles: 0,
                errorFiles: 0,
              };

              files.forEach((file: { status: 'error' | 'success' }) => {
                if (file.status === 'error') {
                  progress.status = 'hasError';
                  progress.errorFiles = progress.errorFiles + 1;
                }

                if (file.status === 'success') {
                  progress.status = 'success';
                  progress.successFiles = progress.successFiles + 1;
                }
              });
              console.log('progress: ', progress);
              emit('update:progress', progress);
            }
          );

          doUpload.value = () => {
            console.log('Uploading...', myDropzone);
            uploading.value = true;

            myDropzone.files.forEach((file: any) => {

            const fd = new FormData();
            fd.append('file', file);

            mutate({ mediaFileInput: {filename: file.upload.filename, metadata: []}, file: file});
            });
            // myDropzone.processQueue();
          };
        }
      });

      return {
        doUpload,
        fileCount,
        dropzoneDiv,
        dropzonePreviewDiv,
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
