<template>
  <div class="flex items-center gap-2 text-text-body select-none">
    <div class="flex">
      <div class="flex" @click="goToPage(1)">
        <unicon
          class="cursor-pointer -mr-1"
          :name="Unicons.AngleDoubleLeft.name"
          height="16"
        />
      </div>
      <div class="flex" @click="previous()">
        <unicon
          class="cursor-pointer -mr-1"
          :name="Unicons.AngleLeft.name"
          height="16"
        />
      </div>
    </div>

    <span>{{ $t("pagination.page") }}</span>
    <div class="w-14">
      <BaseInputTextNumberDatetime
        class="text-center"
        v-model="currentPage"
        type="number"
        input-style="default"
        :is-valid-predicate="(value: number) => value >= 1 && value <= getLastPage()"
        @focusout="emit('update:skip', currentPage)"
        @keyup.enter="emit('update:skip', currentPage)"
      />
    </div>
    <span>{{ $t("pagination.of") }}</span>
    <span>{{ getLastPage() }}</span>

    <div class="flex">
      <div class="flex" @click="next()">
        <unicon
          class="cursor-pointer -ml-1"
          :name="Unicons.AngleRight.name"
          height="16"
        />
      </div>
      <div class="flex" @click="goToPage(getLastPage())">
        <unicon
          class="cursor-pointer -ml-1"
          :name="Unicons.AngleDoubleRight.name"
          height="16"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { ref, toRefs, watch } from "vue";
import { savedSkipForOrdering } from "@/composables/useOrderListItems";
import { Unicons } from "@/types";

const props = defineProps<{
  skip: number;
  limit: number;
  totalItems: number;
}>();

const emit = defineEmits<{
  (event: "update:skip", skip: number): void;
}>();

const { skip } = toRefs(props);
const currentPage = ref<number>(skip.value);

const previous = () => {
  if (currentPage.value <= 1) return;
  //savedSkipForOrdering.value--;
  currentPage.value--;
  emit("update:skip", currentPage.value)
};

const next = () => {
  if (currentPage.value >= getLastPage()) return;
  //savedSkipForOrdering.value++;
  currentPage.value++;
  emit("update:skip", currentPage.value)
};

const goToPage = (page: number) => {
  if (page < 1 || page > getLastPage()) return;
  //savedSkipForOrdering.value = page;
  currentPage.value = page;
  emit("update:skip", currentPage.value)
};

const getLastPage = () => {
  if (props.totalItems > 1)
    return Math.ceil(props.totalItems / props.limit) || 1;
  else return 1;
};

watch(
  () => props.limit,
  () => {
    if (currentPage.value > getLastPage()) currentPage.value = 1;
  }
);
</script>
