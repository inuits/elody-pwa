<template>
  <div @click="handleLinkType">
    <BaseButton
        :icon="Unicons.SignOut.name"
        :icon-height="20"
        class="mt-1 menu-btn"
        bg-color="var(--color-neutral)"
        @click="handleLinkType"
      />
  
  <span  class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold">
    {{ labelname }}
  </span>
</div>
</template>

<script lang="ts" setup>
import { Unicons } from "../types";
import { useRouter } from "vue-router";
import { useUploadModal, modalChoices } from "./UploadModal.vue";
import { useCreateModal } from "./CreateModal.vue";
const { openUploadModal, uploadModalState } = useUploadModal();
const { openCreateModal, createModalState } = useCreateModal();
const router = useRouter();
  const props = defineProps(
    { 
      labelname: String,
      destination:String,
      LinkType:String,

    }
    );
    function handleLinkType(){
      if(props.LinkType==="modal"){
        console.log('I want to open a modal')
        if(props.destination==="Upload")
        {
          openUploadModal(modalChoices.IMPORT)
        }
      }
      else if(props.LinkType==="route") {
        router.push(`/${props.destination}`)
      }
    }
</script>

<style lang="postcss" scoped>

</style>
