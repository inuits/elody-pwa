<template>
  <!-- modal.md: the title sits in BaseModal's header band; Cancel next to
       the commit, right; first focus on Cancel, not the close cross -->
  <div v-if="pendingConfirm" class="flex flex-col">
    <p
      v-if="pendingConfirm.options.message"
      data-testid="confirm-message"
      class="m-0 p-(--modal-body-pad) text-value text-text-body"
    >
      {{ pendingConfirm.options.message }}
    </p>
    <div
      data-testid="confirm-footer"
      class="flex items-center justify-end gap-2 p-(--modal-footer-pad) border-t border-border-subtle"
    >
      <BaseButtonNew
        ref="cancelButton"
        class="w-auto!"
        autofocus
        :label="pendingConfirm.options.cancelLabel"
        :button-style="pendingConfirm.options.cancelButtonStyle ?? 'ghost'"
        :button-size="pendingConfirm.options.cancelButtonSize ?? 'md'"
        @click="resolveConfirm('cancel')"
      />
      <BaseButtonNew
        v-if="pendingConfirm.options.secondaryLabel"
        class="w-auto!"
        :label="pendingConfirm.options.secondaryLabel"
        :button-style="pendingConfirm.options.secondaryButtonStyle ?? 'danger'"
        :button-size="pendingConfirm.options.secondaryButtonSize ?? 'md'"
        @click="resolveConfirm('secondary')"
      />
      <BaseButtonNew
        class="w-auto!"
        :label="pendingConfirm.options.confirmLabel"
        :button-style="pendingConfirm.options.confirmButtonStyle ?? 'danger'"
        :button-size="pendingConfirm.options.confirmButtonSize ?? 'md'"
        @click="resolveConfirm('confirm')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, useTemplateRef, watch } from "vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useConfirmModal } from "@/composables/useConfirmModal";

const { pendingConfirm, resolveConfirm } = useConfirmModal();
const cancelButton = useTemplateRef<{ $el: HTMLElement }>("cancelButton");

// the dialog opens before its buttons render, so `autofocus` alone misses
watch(pendingConfirm, async (pending) => {
  if (!pending) return;
  await nextTick();
  cancelButton.value?.$el.focus();
});
</script>
