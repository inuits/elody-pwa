<template>
  <div class="p-8 flex flex-col w-full h-full">
    <div>
      <div class="w-full mb-2">
        <h1 class="title flex justify-center">
          {{
            t("confirm.delete-entities.title", { type: getCurrentRouteTitle })
          }}
        </h1>
      </div>
      <div v-if="!isDeleting">
        <div class="pt-4">
          {{ message }}
        </div>
        <div v-if="form">
          <BaseInputCheckbox
            v-for="option in options"
            :key="option.key.value"
            v-model="option.isSelected"
            class="my-1"
            :label="t(option.key.label)"
            :item="{ id: option.key.value }"
            :required="false"
            ignore-bulk-operations
            input-style="accentNormal"
          />
        </div>
      </div>
      <div v-if="isDeleting" class="w-full flex justify-center py-4">
        <spinner-loader class="" theme="accent" :dimensions="16" />
      </div>
    </div>
    <div class="flex justify-between mt-4">
      <div>
        <BaseButtonNew
          :disabled="isDeleting"
          :label="
            t('confirm.delete-entities.confirm', { type: getCurrentRouteTitle })
          "
          :icon="DamsIcons.Trash"
          button-style="redDefault"
          button-size="small"
          @click="deleteSelectedItems"
        />
      </div>

      <div>
        <BaseButtonNew
          :disabled="isDeleting"
          :label="t('confirm.delete-entities.cancel')"
          button-style="default"
          button-size="small"
          @click="closeModal(TypeModals.BulkOperationsDeleteEntities)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import { watch, computed, ref } from "vue";
import { router } from "@/main";
import {
  DamsIcons,
  type DropdownOption,
  TypeModals,
} from "@/generated-types/queries";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  type Context,
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useModalActions } from "@/composables/useModalActions";
import { useDeleteEntities } from "@/composables/useDeleteEntities";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import { rootRoute } from "@/composables/useBreadcrumbs";
import { goToEntityPageById } from "@/helpers";
import SpinnerLoader from "@/components/SpinnerLoader.vue";

const { t } = useI18n();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();
const { dequeueAllItemsForBulkProcessing, getEnqueuedItems } =
  useBulkOperations();
const { closeModal, getModalInfo } = useBaseModal();
const { getInformationForBulkDeleteEntities } = useModalActions();
const { deleteEntities, getDeletionForm, form } = useDeleteEntities();

const modal = computed(() => {
  return getModalInfo(TypeModals.BulkOperationsDeleteEntities);
});

const options = ref<{ isSelected: boolean; key: DropdownOption }[]>([]);
const configuredRouteTitle = ref<string | undefined>(undefined);
const isDeleting = ref<boolean>(false);

const normalizeOptions = (
  options: DropdownOption[],
): { isSelected: boolean; key: DropdownOption }[] => {
  return options.map((item: DropdownOption) => ({
    isSelected: false,
    key: item,
  }));
};

const getCurrentRouteTitle = computed(() => {
  try {
    if (configuredRouteTitle.value)
      return t(configuredRouteTitle.value)?.toLowerCase();
    return t(rootRoute.value.rootTitle)?.toLowerCase();
  } catch {
    return "";
  }
});

const normalizeOptionsToObjectOfKeyValue = (
  options: { isSelected: boolean; key: DropdownOption }[],
) => {
  if (options.length === 0) return {};

  const entitiesToRemove = options.reduce(
    (acc, option) => {
      acc[option.key.value] = option.isSelected;
      return acc;
    },
    {} as { [key: string]: boolean },
  );
  return {
    deleteEntities: entitiesToRemove,
  };
};

const message = computed(() => {
  return options.value.length > 0
    ? `${t("confirm.delete-entities.message", { type: getCurrentRouteTitle.value })} ${t(form.value.label)}`
    : t("confirm.delete-entities.message", {
        type: getCurrentRouteTitle.value,
      });
});

const deleteSelectedItems = async () => {
  isDeleting.value = true;
  const context = modal.value.context as Context;
  const selectedItems: InBulkProcessableItem[] = getEnqueuedItems(context);
  if (selectedItems.length <= 0) return;

  try {
    const linkedEntitiesToRemove = normalizeOptionsToObjectOfKeyValue(
      options.value,
    );
    const jobIdentifier = await deleteEntities(
      selectedItems,
      linkedEntitiesToRemove,
      getInformationForBulkDeleteEntities(),
    );

    isDeleting.value = false;

    if (jobIdentifier && typeof jobIdentifier === "string") {
      closeModal(TypeModals.BulkOperationsDeleteEntities);
      dequeueAllItemsForBulkProcessing(context);
      displaySuccessNotification(
        t("notifications.success.entityDeleted.title"),
        t("notifications.success.entityDeleted.description"),
      );
      goToEntityPageById(
        jobIdentifier,
        { type: "job", __typename: "job" },
        "SingleEntity",
        router,
      );
    } else {
      displayErrorNotification(
        t("notifications.errors.entityDeleted.title"),
        t("notifications.errors.entityDeleted.description"),
      );
    }
  } catch (error) {
    isDeleting.value = false;
    console.error("Error deleting selected items:", error);
  }
};

watch(
  () => modal.value,
  async (newModal) => {
    if (newModal.open && newModal.formQuery) {
      await getDeletionForm(newModal.formQuery);
      if (!form.value) return;
      if (form.value.inputField)
        options.value = normalizeOptions(form.value.inputField.options);
      else configuredRouteTitle.value = form.value.label;
    }
  },
  { immediate: true },
);
</script>

<style scoped></style>
