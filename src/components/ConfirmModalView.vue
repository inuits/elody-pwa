<template>
  <div
    v-if="pendingConfirm"
    class="h-full flex flex-col justify-between p-4"
  >
    <div>
      <div class="title">{{ pendingConfirm.options.title }}</div>
      <div v-if="pendingConfirm.options.message" class="pt-4">
        {{ pendingConfirm.options.message }}
      </div>
    </div>
    <div class="flex justify-between pt-8">
      <div :class="[{ 'w-3/4': pendingConfirm.options.secondaryLabel }]">
        <div class="flex items-center gap-4">
          <BaseButtonNew
            :label="pendingConfirm.options.confirmLabel"
            :button-style="pendingConfirm.options.confirmButtonStyle ?? 'redDefault'"
            :button-size="pendingConfirm.options.confirmButtonSize ?? 'small'"
            @click="resolveConfirm('confirm')"
          />
          <BaseButtonNew
            v-if="pendingConfirm.options.secondaryLabel"
            :label="pendingConfirm.options.secondaryLabel"
            :button-style="pendingConfirm.options.secondaryButtonStyle ?? 'redDefault'"
            :button-size="pendingConfirm.options.secondaryButtonSize ?? 'small'"
            @click="resolveConfirm('secondary')"
          />
        </div>
      </div>
      <div class="flex items-center">
        <BaseButtonNew
          :label="pendingConfirm.options.cancelLabel"
          :button-style="pendingConfirm.options.cancelButtonStyle ?? 'default'"
          :button-size="pendingConfirm.options.cancelButtonSize ?? 'small'"
          @click="resolveConfirm('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useConfirmModal } from "@/composables/useConfirmModal";

const { pendingConfirm, resolveConfirm } = useConfirmModal();
</script>
