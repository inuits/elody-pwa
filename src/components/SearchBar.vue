<template>
  <div class="flex items-center bg-neutral-10 rounded-md p-2" @click="openModal">
    <InputField placeholder="Search" v-model="searchTerm" class="h-full rounded-l-lg" />
    <button type="submit" class="p-2.5 text-sm font-medium text-white bg-#6BC6B3 rounded-r-lg border z-0"
      style="background-color: #6BC6B3; padding-top: 0.500rem; padding-bottom: 0.500rem;">
      <svg aria-hidden="true" class="w-5 h-5 mx-auto" fill="none" stroke="#ffffff" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
    </button>
  </div>
</template>

<script lang="ts">
import InputField from './base/InputField.vue';
import SearchModal from './SearchModal.vue';

export default {
  name: "SearchBar",
  components: {
    InputField,
    SearchModal,
  },
  data() {
    return {
      searchTerm: "",
    };
  },
  methods: {
    openModal() {
      this.$emit("click");
      this.$nextTick(() => {
        const modal = this.$refs.modal;
        modal.modalState.value.state = 'Show';
      });
    },
    search() {
      this.$emit("search", this.searchTerm);
    },
  },
};
</script>