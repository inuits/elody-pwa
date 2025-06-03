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
        input-style="defaultWithDarkBackgroundInput"
        @focusin="canUpdateSkipAgain()"
        @focusout="setManualEnteredSkip(currentPage)"
        @keyup.enter="setManualEnteredSkip(currentPage)"
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
const canUpdateSkip = ref<boolean>(true);

const setManualEnteredSkip = (page: number) => {
  if (!canUpdateSkip.value) return;

  if (page < 1) currentPage.value = 1;
  if (page > getLastPage()) currentPage.value = getLastPage();
  emit("update:skip", currentPage.value);
  canUpdateSkip.value = false;
}

const canUpdateSkipAgain = () => {
  canUpdateSkip.value = true;
}

const previous = () => {
  if (currentPage.value <= 1) return;
  currentPage.value--;
  emit("update:skip", currentPage.value);
};

const next = () => {
  if (currentPage.value >= getLastPage()) return;
  currentPage.value++;
  emit("update:skip", currentPage.value);
};

const goToPage = (page: number) => {
  if (page < 1 || page > getLastPage()) return;
  currentPage.value = page;
  emit("update:skip", currentPage.value);
};

const getLastPage = () => {
  if (props.totalItems > 1)
    return Math.ceil(props.totalItems / props.limit) || 1;
  else return 1;
};

watch(
  () => props.skip,
  () => {
    currentPage.value = props.skip;
  },
);
watch(
  () => [props.limit, props.totalItems],
  () => {
    if (currentPage.value > getLastPage()) {
      currentPage.value = 1;
      emit("update:skip", currentPage.value);
    }
  },
);

</script>
