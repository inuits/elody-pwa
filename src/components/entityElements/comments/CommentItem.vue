<template>
  <div
    :class="[
      'rounded-md border border-neutral-30 bg-background-light p-3',
      { 'cursor-pointer hover:border-accent-normal transition-colors': clickable },
    ]"
    @click="clickable && emit('open')"
  >
    <div class="flex items-baseline justify-between gap-2">
      <div class="flex items-baseline gap-2 min-w-0">
        <span class="font-bold text-text-body truncate">
          {{ comment.intialValues?.author_name || t("comments.unknown-author") }}
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

    <!--
      Reuses the shared sanitizing component, passing the tagging extension's element
      names so its default allowlist does not strip every @ and # tag along with its
      data-entity-id. Clicks are delegated on this wrapper rather than mounting a
      read-only editor per comment, which would not scale down a long thread.
    -->
    <div
      class="prose prose-sm max-w-full mt-2 text-text-body"
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
import type { Comment, CommentStatus } from "@/composables/useComments";
import {
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
  "open-entity": [entityId: string];
}>();

const { t, d } = useI18n();

// Only the element names this composer's configuration can actually produce, so the
// allowlist stays closed rather than becoming a blanket `elody-*`.
const allowedTagElements = computed<string[]>(() =>
  (props.taggableEntityConfiguration ?? [])
    .filter((configuration) => configuration.tag)
    .map((configuration) => `elody-${configuration.tag}`),
);

const formattedDate = computed<string>(() => {
  const createdAt = props.comment.intialValues?.created_at;
  if (!createdAt) return "";
  const date = new Date(createdAt);
  return isNaN(date.getTime()) ? String(createdAt) : d(date, "short");
});

const handleBodyClick = (event: MouseEvent) => {
  const tagElement = (event.target as HTMLElement | null)?.closest(
    "[data-entity-id]",
  );
  if (!tagElement) return;
  // A #entity tag is a link, so it must not also open the thread.
  event.stopPropagation();
  emit("open-entity", tagElement.getAttribute("data-entity-id")!);
};
</script>
