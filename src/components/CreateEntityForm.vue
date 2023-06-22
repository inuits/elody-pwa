<template>
  <div>
    <div class="p-6 pt-0 bg-neutral-0 pb-20">
      <form v-if="result">
        <MetaEditDataField
          v-model="EntityTitle"
          field-key="title"
          :label="$t('form.title')"
        />
        <input
          v-model="manualID"
          disabled
          type="text"
          class="w-full px-3 py-2"
          placeholder="id"
        />
        <BaseButton :label="$t('form.create')" @click="create" />
      </form>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import type { PropType } from "vue";
import MetaEditDataField from "./MetaEditDataField.vue";
import {
  CreateEntityDocument,
  Entitytyping,
  GetCreateEntityFormDocument,
  TypeModals,
} from "../generated-types/queries";
import type {
  CreateEntityMutation,
  GetCreateEntityFormQuery,
} from "../generated-types/queries";
import { useMutation, useQuery } from "@vue/apollo-composable";
import BaseButton from "./base/BaseButton.vue";
import urlSlug from "url-slug";
import { useRouter } from "vue-router";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useEditMode } from "@/composables/useEdit";
import { useNotification } from "./base/BaseNotification.vue";
import { NotificationType } from "./base/BaseNotification.vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "CreateEntityForm",
  components: { MetaEditDataField, BaseButton },
  props: {
    entityType: {
      type: String as PropType<Entitytyping>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const router = useRouter();
    const { createNotification } = useNotification();
    const { setEditMode } = useEditMode();
    const { getModal } = useAvailableModals();
    const modal = getModal(TypeModals.Create);
    const EntityTitle = ref<string>("");
    const idPrefix = ref<string>("");
    const manualID = computed(
      () => `${idPrefix.value}${urlSlug(EntityTitle.value)}`
    );
    const type = computed(() => props.entityType);

    const { result, onResult, refetch } = useQuery<GetCreateEntityFormQuery>(
      GetCreateEntityFormDocument,
      { type }
    );

    watch(
      () => type.value,
      () => {
        refetch();
      }
    );

    const { mutate } = useMutation<CreateEntityMutation>(CreateEntityDocument);

    onResult((queryResult) => {
      idPrefix.value = queryResult?.data?.GetCreateEntityForm?.idPrefix || "";
    });

    const create = async () => {
      const createResult = await mutate({
        data: {
          type: props.entityType,
          id: manualID.value,
          metadata: [],
          title: EntityTitle.value,
          identifiers: [manualID.value],
        },
      });

      if (createResult && createResult.data?.createEntity?.id) {
        setEditMode();
        modal.closeModal();
        createNotification({
          displayTime: 10,
          type: NotificationType.default,
          title: t("notifications.success.entityCreated.title"),
          description: t("notifications.success.entityCreated.description"),
          shown: true,
        });
        router.push({
          name: "SingleEntity",
          params: { id: createResult.data.createEntity.id },
        });
      }
    };
    return { result, create, EntityTitle, manualID };
  },
});
</script>
