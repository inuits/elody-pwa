<template>
  <BaseModal
    :modal-type="TypeModals.CommentThread"
    modal-height-style="min-h-[40vh]"
    :cancel-button-availabe="true"
    @hide-modal="closeModal(TypeModals.CommentThread)"
  >
    <!--
      The transition sits on this inner wrapper, not on BaseModal's native <dialog>:
      that element is toggled with showModal()/close(), which does not reliably run CSS
      transitions.
    -->
    <Transition name="thread">
      <div v-if="thread" class="p-4 flex flex-col gap-4 max-h-[80vh]">
        <div class="flex items-start justify-between gap-4">
          <h3 class="text-lg font-bold text-text-body">
            {{ t("comments.thread-title") }}
          </h3>
          <div class="flex items-center gap-2">
            <base-button-new
              v-if="canPost"
              :label="
                thread.status === 'resolved'
                  ? t('comments.reopen')
                  : t('comments.resolve')
              "
              :icon="thread.status === 'resolved' ? DamsIcons.Redo : DamsIcons.Check"
              button-style="accentNormal"
              :disabled="isWorking"
              @click="toggleStatus"
            />
            <div class="cursor-pointer" @click="closeModal(TypeModals.CommentThread)">
              <unicon :name="Unicons.Cross.name" />
            </div>
          </div>
        </div>

        <div class="overflow-y-auto flex flex-col gap-3 pr-1">
          <comment-item
            v-if="editingCommentId !== thread.subject.id"
            :comment="thread.subject"
            :taggable-entity-configuration="taggableEntityConfiguration"
            :status="thread.status"
            :can-edit="canEditComment(thread.subject)"
            @edit="editingCommentId = thread.subject.id"
            @open-entity="openTaggedEntity"
          />
          <comment-composer
            v-else
            :scratch-form-id="`comment-edit-${thread.subject.id}`"
            :composer="composer"
            :initial-body="thread.subject.intialValues?.body ?? ''"
            :submit-label="t('comments.save')"
            :cancellable="true"
            @submit="
              (body, relations) => saveEdit(thread.subject, body, relations)
            "
            @cancel="editingCommentId = undefined"
          />

          <div v-if="thread.replies.length" class="pl-6 flex flex-col gap-3">
            <TransitionGroup name="reply">
              <template v-for="reply in thread.replies" :key="reply.id">
                <comment-item
                  v-if="editingCommentId !== reply.id"
                  :comment="reply"
                  :taggable-entity-configuration="taggableEntityConfiguration"
                  :can-edit="canEditComment(reply)"
                  @edit="editingCommentId = reply.id"
                  @open-entity="openTaggedEntity"
                />
                <comment-composer
                  v-else
                  :scratch-form-id="`comment-edit-${reply.id}`"
                  :composer="composer"
                  :initial-body="reply.intialValues?.body ?? ''"
                  :submit-label="t('comments.save')"
                  :cancellable="true"
                  @submit="(body, relations) => saveEdit(reply, body, relations)"
                  @cancel="editingCommentId = undefined"
                />
              </template>
            </TransitionGroup>
          </div>
        </div>

        <div
          v-if="canPost && thread.status !== 'resolved'"
          class="border-t border-neutral-30 pt-3"
        >
          <comment-composer
            :scratch-form-id="`comment-reply-${thread.subject.id}`"
            :composer="composer"
            :submit-label="t('comments.reply')"
            @submit="postReply"
          />
        </div>
        <p v-else-if="thread.status === 'resolved'" class="text-sm text-text-placeholder">
          {{ t("comments.resolved-hint") }}
        </p>
      </div>
    </Transition>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import CommentItem from "@/components/entityElements/comments/CommentItem.vue";
import CommentComposer from "@/components/entityElements/comments/CommentComposer.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useComments, type Comment } from "@/composables/useComments";
import { useAuth } from "@/composables/useAuth";
import { Unicons } from "@/types";
import {
  DamsIcons,
  ModalStyle,
  TypeModals,
  type BaseRelationValuesInput,
  type WysiwygElement,
} from "@/generated-types/queries";

const { closeModal, getModalInfo, openModal } = useBaseModal();
const { threadFor, post, edit, setStatus } = useComments();
const { elodyUser } = useAuth();
const { t } = useI18n();

const isWorking = ref<boolean>(false);
const editingCommentId = ref<string | undefined>(undefined);

const modalInfo = computed(() => getModalInfo(TypeModals.CommentThread));
const subjectId = computed<string | undefined>(() => modalInfo.value.subjectId);
const parentEntityId = computed<string | undefined>(
  () => modalInfo.value.parentEntityId,
);
// Permission is decided by the element that owns the entity context and travels with
// the payload, so the modal does not re-derive it from a different edit state.
const canPost = computed<boolean>(() => !!modalInfo.value.canPost);
const composer = computed<WysiwygElement | undefined>(
  () => modalInfo.value.composer,
);
const taggableEntityConfiguration = computed(
  () => composer.value?.taggingConfiguration?.taggableEntityConfiguration ?? [],
);

const thread = computed(() =>
  subjectId.value ? threadFor(subjectId.value) : undefined,
);

// Stale edit state must not survive into the next thread the user opens.
watch(subjectId, () => (editingCommentId.value = undefined));

const canEditComment = (comment: Comment): boolean =>
  canPost.value &&
  !!elodyUser.value?.id &&
  comment.intialValues?.created_by === elodyUser.value.id;

const withWorking = async (action: () => Promise<void>) => {
  isWorking.value = true;
  try {
    await action();
  } finally {
    isWorking.value = false;
  }
};

const postReply = (body: string, relations: BaseRelationValuesInput[]) =>
  withWorking(async () => {
    if (!parentEntityId.value || !subjectId.value) return;
    await post({
      entityId: parentEntityId.value,
      subjectId: subjectId.value,
      body,
      taggedRelations: relations,
    });
  });

const saveEdit = (
  comment: Comment,
  body: string,
  relations: BaseRelationValuesInput[],
) =>
  withWorking(async () => {
    await edit({ comment, body, taggedRelations: relations });
    editingCommentId.value = undefined;
  });

const toggleStatus = () =>
  withWorking(async () => {
    if (!thread.value) return;
    await setStatus(
      thread.value.subject,
      thread.value.status === "resolved" ? "open" : "resolved",
    );
  });

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
</script>

<style scoped>
.thread-enter-active,
.thread-leave-active {
  transition:
    opacity 0.15s ease-out,
    transform 0.15s ease-out;
}

.thread-enter-from,
.thread-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.reply-enter-active,
.reply-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.reply-enter-from,
.reply-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.reply-move {
  transition: transform 0.2s ease;
}
</style>
