<template>
  <div class="flex items-center gap-2 text-text-body select-none">
    <div class="flex">
      <div class="flex" @click="paginationStore.goToPage(1)">
        <unicon class="cursor-pointer -mr-1" :name="Unicons.AngleDoubleLeft.name" height="16" />
      </div>
      <div class="flex" @click="paginationStore.previous()">
        <unicon class="cursor-pointer -mr-1" :name="Unicons.AngleLeft.name" height="16" />
      </div>
    </div>

    <span>{{ $t("pagination.page") }}</span>
    
    <div class="w-14">
      <BaseInputTextNumberDatetime
        class="text-center"
        v-model="localPage" 
        type="number"
        input-style="defaultWithDarkBackgroundInput"
        @focusin="paginationStore.canUpdateSkipAgain()"
        @focusout="updatePage"
        @keyup.enter="updatePage"
      />
    </div>

    <span>{{ $t("pagination.of") }}</span>
    <span>{{ paginationStore.getLastPage() }}</span>

    <div class="flex">
      <div class="flex" @click="paginationStore.next()">
        <unicon class="cursor-pointer -ml-1" :name="Unicons.AngleRight.name" height="16" />
      </div>
      <div class="flex" @click="paginationStore.goToPage(paginationStore.getLastPage())">
        <unicon class="cursor-pointer -ml-1" :name="Unicons.AngleDoubleRight.name" height="16" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { PaginationStoreKey, type PaginationStore } from "@/components/library/usePaginationStore";
import { Unicons } from "@/types";
import { inject, ref, watch } from "vue";

const paginationStore = inject(PaginationStoreKey) as PaginationStore;

const localPage = ref(paginationStore.currentPage.value);

const updatePage = () => {
  paginationStore.goToPage(Number(localPage.value));
};

watch(() => paginationStore.currentPage.value, (newVal) => {
  localPage.value = newVal;
});
</script>