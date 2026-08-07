<template>
  <div v-if="canRead" class="mb-5">
    <entity-element-wrapper
      :label="element.label"
      :entity-id="id"
      :is-collapsed="isCollapsed"
      @toggle-element-collapse="isCollapsed = !isCollapsed"
    >
      <template #content>
        <div
          class="flex flex-col gap-3 mx-1 mb-1 p-3 bg-background-normal rounded-b"
        >
          <div v-if="canPost && !isComposerOpen" class="self-start">
            <base-button-new
              :label="t('comments.new-thread')"
              :icon="DamsIcons.PlusCircle"
              button-style="accentAccent"
              button-size="small"
              force-show-label
              @click="isComposerOpen = true"
            />
          </div>

          <Transition name="composer">
            <div v-if="isComposerOpen" class="overflow-hidden">
              <comment-composer
                :scratch-form-id="`comment-new-${id}`"
                :composer="element.composer"
                :submit-label="t('comments.post')"
                :cancellable="true"
                @submit="postSubject"
                @cancel="isComposerOpen = false"
              />
            </div>
          </Transition>

          <p v-if="isLoading" class="text-sm text-text-placeholder">
            {{ t("comments.loading") }}
          </p>
          <p
            v-else-if="!threads.length"
            class="text-sm text-text-placeholder italic"
          >
            {{ t("comments.empty") }}
          </p>

          <TransitionGroup name="subject" tag="div" class="flex flex-col gap-2">
            <comment-item
              v-for="thread in threads"
              :key="thread.subject.id"
              :comment="thread.subject"
              :taggable-entity-configuration="taggableEntityConfiguration"
              :status="thread.status"
              :reply-count="thread.replyCount"
              :clickable="true"
              @open="openThread(thread.subject.id)"
              @open-entity="openTaggedEntity"
            />
          </TransitionGroup>
        </div>
      </template>
    </entity-element-wrapper>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import CommentItem from "@/components/entityElements/comments/CommentItem.vue";
import CommentComposer from "@/components/entityElements/comments/CommentComposer.vue";
import { useComments } from "@/composables/useComments";
import { useBaseModal } from "@/composables/useBaseModal";
import { usePermissions } from "@/composables/usePermissions";
import { useEditMode } from "@/composables/useEdit";
import {
  type CommentsElement,
  DamsIcons,
  Entitytyping,
  ModalStyle,
  Permission,
  TypeModals,
  type BaseRelationValuesInput,
} from "@/generated-types/queries";

const props = defineProps<{
  element: CommentsElement;
  id: string;
  entityType: Entitytyping;
}>();

const { t } = useI18n();
const { threadsFor, isLoadingFor, load, post } = useComments();
const { openModal } = useBaseModal();
const { can, fetchUpdateAndDeletePermission } = usePermissions();
const parentEditHelper = shallowRef(useEditMode(props.id));

const isParentInEditMode = (): boolean =>
  ["edit", "edit-delete"].includes(parentEditHelper.value.editMode);

const isComposerOpen = ref<boolean>(false);
const isCollapsed = ref<boolean>(false);
const canUpdateParent = ref<boolean>(false);

const canRead = computed<boolean>(() =>
  can(Permission.Canread, Entitytyping.Comment),
);

const canPost = computed<boolean>(() => {
  if (!can(Permission.Cancreate, Entitytyping.Comment)) return false;
  if (isParentInEditMode()) return true;
  return canUpdateParent.value;
});

const threads = computed(() => threadsFor(props.id));
const isLoading = computed(() => isLoadingFor(props.id));

const taggableEntityConfiguration = computed(
  () =>
    props.element.composer?.taggingConfiguration?.taggableEntityConfiguration ??
    [],
);

const openThread = (subjectId: string) => {
  openModal(
    TypeModals.CommentThread,
    ModalStyle.CenterWide,
    undefined,
    undefined,
    false,
    undefined,
    {
      subjectId,
      parentEntityId: props.id,
      composer: props.element.composer,
      canPost: canPost.value,
    },
  );
};

const openTaggedEntity = (entityId: string, entityType: Entitytyping) => {
  openModal(
    TypeModals.EntityDetailModal,
    ModalStyle.CenterWide,
    undefined,
    undefined,
    false,
    undefined,
    { entityId, entityType },
  );
};

const postSubject = async (
  body: string,
  relations: BaseRelationValuesInput[],
) => {
  await post({ entityId: props.id, body, taggedRelations: relations });
  isComposerOpen.value = false;
};

watch(
  () => props.id,
  async (entityId) => {
    canUpdateParent.value = false;
    parentEditHelper.value = useEditMode(entityId);
    await load(entityId, props.element.parentEntityFilterKey);
    if (isParentInEditMode()) return;
    const permissions = await fetchUpdateAndDeletePermission(
      entityId,
      props.entityType,
    );
    // A permission answer that arrives after the next navigation is not about this entity.
    if (entityId !== props.id) return;
    canUpdateParent.value = permissions?.get(Permission.Canupdate) ?? false;
  },
  { immediate: true },
);
</script>

<style scoped>
.composer-enter-active,
.composer-leave-active {
  transition:
    opacity 0.2s ease,
    max-height 0.2s ease;
  max-height: 40rem;
}

.composer-enter-from,
.composer-leave-to {
  opacity: 0;
  max-height: 0;
}

.subject-enter-active,
.subject-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.subject-enter-from,
.subject-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.subject-move {
  transition: transform 0.2s ease;
}
</style>
