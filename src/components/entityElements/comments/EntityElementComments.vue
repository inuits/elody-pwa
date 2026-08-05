<template>
  <div v-if="canRead" class="flex flex-col gap-3 p-2">
    <div class="flex items-center justify-between">
      <h2 class="subtitle text-text-body">{{ t(element.label) }}</h2>
      <base-button-new
        v-if="canPost && !isComposerOpen"
        :label="t('comments.new-thread')"
        :icon="DamsIcons.PlusCircle"
        button-style="accentAccent"
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

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
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
const { threads, isLoading, load, post } = useComments();
const { openModal } = useBaseModal();
const { can, fetchUpdateAndDeletePermission } = usePermissions();
const parentEditHelper = useEditMode(props.id);

const isComposerOpen = ref<boolean>(false);
const canUpdateParent = ref<boolean>(false);

const canRead = computed<boolean>(() =>
  can(Permission.Canread, Entitytyping.Comment),
);

/**
 * Posting, replying and resolving all require edit rights on the PARENT entity, not
 * on the comment. EntitySingle already resolved that into the parent's edit state, so
 * the common case costs no extra request; the fallback covers being mounted where
 * that state was never populated (e.g. inside EntityDetailModal).
 */
const canPost = computed<boolean>(() => {
  if (!can(Permission.Cancreate, Entitytyping.Comment)) return false;
  if (["edit", "edit-delete"].includes(parentEditHelper.editMode)) return true;
  return canUpdateParent.value;
});

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

const openTaggedEntity = (entityId: string) => {
  openModal(
    TypeModals.EntityDetailModal,
    ModalStyle.CenterWide,
    undefined,
    undefined,
    false,
    undefined,
    { entityId },
  );
};

const postSubject = async (
  body: string,
  relations: BaseRelationValuesInput[],
) => {
  await post({ entityId: props.id, body, taggedRelations: relations });
  isComposerOpen.value = false;
};

onMounted(async () => {
  await load(props.id);
  if (["edit", "edit-delete"].includes(parentEditHelper.editMode)) return;
  const permissions = await fetchUpdateAndDeletePermission(
    props.id,
    props.entityType,
  );
  canUpdateParent.value = permissions?.get(Permission.Canupdate) ?? false;
});
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
