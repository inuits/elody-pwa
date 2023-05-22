<template>
  <div class="flex items-center gap-2 text-text-body select-none">
    <div class="flex items-center">
      <unicon
        class="cursor-pointer -mr-1"
        :name="Unicons.AngleDoubleLeft.name"
        height="16"
        @click="goToPage(1)"
      />
      <unicon
        class="cursor-pointer -mr-1"
        :name="Unicons.AngleLeft.name"
        height="16"
        @click="previous()"
      />
    </div>

    <span>{{ $t("pagination.page") }}</span>
    <div class="w-11">
      <BaseInputTextNumber
        class="text-center"
        v-model="currentPage"
        type="number"
        input-style="default"
        :is-valid-predicate="(value: number) => value >= 1 && value <= getLastPage()"
      />
    </div>
    <span>{{ $t("pagination.of") }}</span>
    <span>{{ getLastPage() }}</span>

    <div class="flex items-center">
      <unicon
        class="cursor-pointer -ml-1"
        :name="Unicons.AngleRight.name"
        height="16"
        @click="next()"
      />
      <unicon
        class="cursor-pointer -ml-1"
        :name="Unicons.AngleDoubleRight.name"
        height="16"
        @click="goToPage(getLastPage())"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseInputTextNumber from "@/components/base/BaseInputTextNumber.vue";
import { ref, watch } from "vue";
import { Unicons } from "@/types";

const props = defineProps<{
  skip: number;
  limit: number;
  totalItems: number;
}>();

const emit = defineEmits<{
  (event: "update:skip", skip: number): void;
}>();

const currentPage = ref<number>(props.skip);

const previous = () => {
  if (currentPage.value <= 1) return;
  currentPage.value--;
};

const next = () => {
  if (currentPage.value >= getLastPage()) return;
  currentPage.value++;
};

const goToPage = (page: number) => {
  if (page < 1 || page > getLastPage()) return;
  currentPage.value = page;
};

const getLastPage = () => {
  if (props.totalItems > 1) return Math.ceil(props.totalItems / props.limit);
  else return 1;
};

watch(
  () => props.skip,
  () => (currentPage.value = props.skip)
);
watch(
  () => currentPage.value,
  () => emit("update:skip", currentPage.value)
);
</script>
