<template>
  <div
    :class="[
      'rounded-md border border-neutral-30 bg-background-light p-3',
      {
        'cursor-pointer hover:border-accent-normal transition-colors':
          clickable,
      },
    ]"
    @click="clickable && emit('open')"
  >
    <div class="flex items-baseline justify-between gap-2">
      <div class="flex items-baseline gap-2 min-w-0">
        <span class="font-bold text-text-body truncate">
          {{
            comment.intialValues?.author_name || t("comments.unknown-author")
          }}
        </span>
        <span class="text-sm text-text-placeholder shrink-0">
          {{ formattedDate }}
        </span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span
          v-if="status"
          :class="[
            'text-xs px-2 py-0.5 rounded-full',
            status === 'resolved'
              ? 'bg-neutral-40 text-text-placeholder'
              : 'bg-accent-normal text-white',
          ]"
        >
          {{ t(`comments.status.${status}`) }}
        </span>
        <span
          v-if="replyCount !== undefined && replyCount > 0"
          class="text-xs text-text-placeholder"
        >
          {{ t("comments.reply-count", replyCount) }}
        </span>
        <button
          v-if="canEdit"
          class="text-sm text-accent-normal hover:underline"
          @click.stop="emit('edit')"
        >
          {{ t("comments.edit") }}
        </button>
      </div>
    </div>
    <div
      class="comment-body prose prose-sm max-w-full mt-2 text-text-body"
      @click="handleBodyClick"
    >
      <sanitized-html
        :mode="SanitizeMode.Html"
        :content="comment.intialValues?.body ?? ''"
        :extra-tags="allowedTagElements"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import SanitizedHtml from "@/components/SanitizedHtml.vue";
import {
  tagElementName,
  type Comment,
  type CommentStatus,
} from "@/composables/useComments";
import { convertDateToReadbleFormat } from "@/helpers";
import {
  type Entitytyping,
  SanitizeMode,
  type TaggableEntityConfiguration,
} from "@/generated-types/queries";

const props = withDefaults(
  defineProps<{
    comment: Comment;
    taggableEntityConfiguration?: TaggableEntityConfiguration[];
    status?: CommentStatus;
    replyCount?: number;
    canEdit?: boolean;
    clickable?: boolean;
  }>(),
  {
    canEdit: false,
    clickable: false,
  },
);

const emit = defineEmits<{
  open: [];
  edit: [];
  "open-entity": [entityId: string, entityType: Entitytyping];
}>();

const { t } = useI18n();

const allowedTagElements = computed<string[]>(() =>
  (props.taggableEntityConfiguration ?? [])
    .filter((configuration) => configuration.tag)
    .map((configuration) => tagElementName(configuration.tag!)),
);

const formattedDate = computed<string>(() => {
  const createdAt = props.comment.intialValues?.created_at;
  if (!createdAt) return "";
  if (isNaN(new Date(createdAt).getTime())) return String(createdAt);
  return convertDateToReadbleFormat(createdAt, "DEFAULT", true);
});

const handleBodyClick = (event: MouseEvent) => {
  const tagElement = (event.target as HTMLElement | null)?.closest(
    "[data-entity-id]",
  );
  if (!tagElement) return;
  event.stopPropagation();

  const configuration = (props.taggableEntityConfiguration ?? []).find(
    (candidate) =>
      !!candidate.tag &&
      tagElementName(candidate.tag) === tagElement.tagName.toLowerCase(),
  );
  const entityType = (tagElement.getAttribute("data-entity-type") ??
    configuration?.taggableEntityType) as Entitytyping | undefined;
  if (!entityType) return;

  emit("open-entity", tagElement.getAttribute("data-entity-id")!, entityType);
};
</script>

<style scoped>
.comment-body :deep([data-entity-id]) {
  background-color: var(--color-accent-light);
  color: var(--color-text-body);
  box-shadow: inset 0 0 0 1px var(--color-accent-accent);
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-weight: 500;
  cursor: pointer;
}
</style>
