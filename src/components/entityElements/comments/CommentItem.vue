<template>
  <!-- A clickable thread card is keyboard-operable too (comments.md). -->
  <div
    :class="[
      'comment-card rounded-md border border-neutral-30 bg-background-light p-3',
      { 'comment-card--clickable': clickable },
    ]"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="clickable && emit('open')"
    @keydown.enter.prevent="clickable && emit('open')"
    @keydown.space.prevent="clickable && emit('open')"
  >
    <div class="flex items-baseline justify-between gap-2">
      <div class="flex items-baseline gap-2 min-w-0">
        <span class="comment-card__author truncate">
          {{
            comment.intialValues?.author_name || t("comments.unknown-author")
          }}
        </span>
        <span class="comment-card__timestamp shrink-0">
          {{ formattedDate }}
        </span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span
          v-if="status"
          class="comment-card__status"
          :class="
            status === 'resolved'
              ? 'comment-card__status--resolved'
              : 'comment-card__status--open'
          "
        >
          <span v-if="status === 'resolved'" aria-hidden="true">✓</span>
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
          type="button"
          class="comment-card__action"
          :aria-label="
            t('comments.edit-named', {
              author: comment.intialValues?.author_name || '',
              time: formattedDate,
            })
          "
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
.comment-card--clickable {
  cursor: pointer;
  transition: border-color var(--transition-duration-ui) var(--ease-ui);
}

.comment-card--clickable:hover {
  border-color: var(--color-accent);
}

.comment-card--clickable:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

/* Author 12.5px bold over an 11px subtle timestamp (comments.md). */
.comment-card__author {
  font-size: var(--text-table);
  font-weight: 700;
  color: var(--color-text-body);
}

.comment-card__timestamp {
  font-size: var(--text-hint);
  color: var(--color-text-subtle);
}

.comment-card__status {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-ds-2);
  padding: 0 var(--spacing-ds-5);
  border-radius: var(--radius-pill);
  font-size: var(--text-micro);
  font-weight: 700;
}

.comment-card__status--open {
  background-color: var(--color-surface-panel-header);
  color: var(--color-text-panel-header);
}

.comment-card__status--resolved {
  background-color: var(--color-surface-muted);
  color: var(--color-text-secondary);
}

.comment-card__action {
  font-size: var(--text-table);
  color: var(--color-text-link);
  text-decoration: underline;
  border-radius: var(--radius-input);
}

.comment-card__action:hover {
  color: var(--color-text-link-hover);
}

.comment-card__action:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

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
