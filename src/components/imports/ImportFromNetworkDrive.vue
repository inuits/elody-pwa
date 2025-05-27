<template>
  <div>
    <div v-if="itemsLoading"><spinner-loader theme="accent" /></div>
    <div v-else>
      <ul v-if="directories.length" class="max-h-[75vh] p-4 overflow-y-auto">
        <li v-for="directory in directories" :key="directory.id">
          <folder-tree-line
            :query-for-sub-directories="queryForSubDirectories"
            :default-open="false"
            :dictionary="directories"
            :directory="directory"
            :selected-directory="selectedDirectory"
            :update-selected-directory="updateSelectedDirectory"
          />
        </li>
      </ul>
      <div v-else class="py-4">
        <p>{{ t("import.no-directories") }}</p>
      </div>
    </div>
    <div class="w-full flex flex-col sticky bottom-0 p-5 bg-neutral-30 z-10">
      <button
        :disabled="!selectedDirectory"
        :class="buttonClass"
        @click="doImport(selectedDirectory?.id)"
      >
        {{ t("import.start-import") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BaseFieldType,
  Entitytyping,
  PostStartImportDocument,
  TypeModals,
} from "@/generated-types/queries";
import { useBaseNotification } from "@/composables/useBaseNotification";
import FolderTreeLine from "@/components/FolderTreeLine.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import useMenuHelper from "@/composables/useMenuHelper";
import { goToEntityPageById, goToEntityTypeRoute } from "@/helpers";
import { provide, ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { useGraphqlAsync } from "@/composables/useGraphqlAsync";
import { useFormHelper } from "@/composables/useFormHelper";
import { useBaseModal } from "@/composables/useBaseModal";

const emit = defineEmits(["setShowErrors"]);

const props = defineProps<{
  formId: string;
  inputFieldType: BaseFieldType;
  closeAndDeleteForm: Function;
}>();

const { t } = useI18n();
const selectedDirectory = ref(null);
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();
const { getMenuDestinations } = useMenuHelper();
const router = useRouter();
const { getQueryDocument, queryAsync, mutateAsync } = useGraphqlAsync();
const { getForm } = useFormHelper();

const itemsLoading = ref<boolean>(false);
const directories = ref([]);
const queries = ref<any>();
const queryForSubDirectories = ref<any>();

const initializeImport = async () => {
  queries.value = await getQueryDocument();
  itemsLoading.value = true;

  if (props.inputFieldType === BaseFieldType.BaseFileSystemImportField) {
    queryForSubDirectories.value = queries.value.GetDirectoriesDocument;
    const result = await queryAsync(queries.value.GetDirectoriesDocument);
    if (result && result.data && result.data.Directories)
      directories.value = result.data.Directories;
    itemsLoading.value = false;
  }

  if (props.inputFieldType === BaseFieldType.BaseMagazineWithCsvImportField) {
    queryForSubDirectories.value =
      queries.value.GetUploadMagazinesWithCsvDocument;
    const result = await queryAsync(
      queries.value.GetUploadMagazinesWithCsvDocument,
    );
    if (result && result.data && result.data.UploadMagazinesWithCsv)
      directories.value = result.data.UploadMagazinesWithCsv;
    itemsLoading.value = false;
  }

  if (props.inputFieldType === BaseFieldType.BaseMagazineWithMetsImportField) {
    queryForSubDirectories.value =
      queries.value.GetUploadMagazinesWithMetsDocument;
    const result = await queryAsync(
      queries.value.GetUploadMagazinesWithMetsDocument,
    );
    if (result && result.data && result.data.UploadMagazinesWithMets)
      directories.value = result.data.UploadMagazinesWithMets;
    itemsLoading.value = false;
  }
};

onMounted(() => {
  initializeImport();
});

const doImport = async (folder: string) => {
  try {
    switch (props.inputFieldType) {
      case BaseFieldType.BaseFileSystemImportField:
        await doImportOfDirectories(folder);
        props.closeAndDeleteForm();
        break;
      case BaseFieldType.BaseMagazineWithCsvImportField:
        await doCsvImport(folder);
        break;
      case BaseFieldType.BaseMagazineWithMetsImportField:
        await doMetsImport(folder);
        break;
      default:
        return;
    }
    displaySuccessNotification(
      t("notifications.success.import.title"),
      t(`notifications.success.import.description`),
    );
  } catch (error: any) {
    displayErrorNotification(
      t(`notifications.errors.import.title`),
      "" + error.message,
    );
  }
};

const doCsvImport = async (folder) => {
  const result = await mutateAsync(queries.value.StartUploadMagazinesWithCsvDocument, {
    folder: folder,
  });
  const jobIdentifier = result?.data?.StartUploadMagazinesWithCsv;
  if (jobIdentifier) {
    goToEntityPageById(
      jobIdentifier,
      { type: "job", __typename: "job" },
      "SingleEntity",
      router,
    );
  }
  props.closeAndDeleteForm();
}

const doMetsImport = async (folder) => {
  const form = getForm(props.formId);
  await form?.validate();
  if (!form?.meta.valid) {
    emit("setShowErrors", true);
    throw new Error(`Error in form`);
  }
  useBaseModal().changeCloseConfirmation(TypeModals.DynamicForm, false);

  const result = await mutateAsync(queries.value.StartUploadMagazinesWithMetsDocument, {
    folder: folder,
    externalSystem: form?.values.intialValues["external_system"],
    externalId: form?.values.intialValues["external_id"],
  });
  const jobIdentifier = result?.data?.StartUploadMagazinesWithMets;
  if (jobIdentifier) {
    goToEntityPageById(
      jobIdentifier,
      { type: "job", __typename: "job" },
      "SingleEntity",
      router,
    );
  }
  props.closeAndDeleteForm();
};

const { mutate: startImport } = useMutation(PostStartImportDocument);
const doImportOfDirectories = async (folder) => {
  if (!folder) {
    displayErrorNotification(
      t("notifications.errors.directoryImport.title"),
      t("notifications.errors.directoryImport.description"),
    );
    return;
  }

  startImport({ folder })
    .then((obj) => {
      if (obj.data.postStartImport.status === 400) {
        const messageId = obj.data.postStartImport.message_id;
        if (messageId === "error-csv-count") {
          const folder = selectedDirectory.value.dir;
          const count = obj.data.postStartImport.count;
          displayErrorNotification(
            t(`notifications.errors.import.title`),
            t(`import.${messageId}`, { folder, count }),
          );
        } else {
          displayErrorNotification(
            t(`notifications.errors.import.title`),
            t(messageId),
          );
        }
      } else {
        displaySuccessNotification(
          t(`notifications.success.import.title`),
          t(`notifications.success.import.description`),
        );
        goToEntityTypeRoute(
          Entitytyping.Job,
          undefined,
          getMenuDestinations(),
          router,
        );
        props.closeAndDeleteForm();
      }
    })
    .catch((error) => {
      displayErrorNotification(
        t(`notifications.errors.import.title`),
        "" + error.message,
      );
    });
};

const buttonClass = computed(() => {
  return {
    "bg-accent-accent": selectedDirectory.value,
    "bg-neutral-100": !selectedDirectory.value,
    "text-neutral-0": true,
    "px-4 py-2 rounded": true,
    "hover:bg-blue-100": selectedDirectory.value,
  };
});

const updateSelectedDirectory = (directory) => {
  selectedDirectory.value = directory;
};

provide("selectedDirectory", selectedDirectory);
provide("updateSelectedDirectory", updateSelectedDirectory);
</script>
