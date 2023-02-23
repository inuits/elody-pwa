<template>Hello
  <div @click="handleLinkType" v-show="auth.isAuthenticated.value === true">
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
import {ref} from 'vue'
import { Unicons } from "../types";
import { useAuth } from "session-vue-3-oidc-library";
import { useRouter } from "vue-router";
import { useUploadModal, modalChoices } from "./UploadModal.vue";
import { useCreateModal } from "./CreateModal.vue";
const ToShow = ref(false);
const { openUploadModal, uploadModalState } = useUploadModal();
const { openCreateModal, createModalState } = useCreateModal();
const router = useRouter();
const auth = useAuth();
  const props = defineProps(
    { 
      labelname: String,
      destination:String,
      LinkType:String,

    }
    );
    
    const handleLinkType = () => {
      if(props.LinkType==="modal"){
        console.log('I want to open a modal')
        if(props.destination==="Upload")
        {
          openUploadModal(modalChoices.IMPORT)
          toShow()
        }
      }
      else if(props.LinkType==="route") {
        router.push(`/${props.destination}`)
        toShow()
      }
    }

    const toShow = ():Boolean => {
      if (props.labelname==='Upload'){
        return false;
        console.log('Dit werkt niet')
      }
      else (props.labelname ==='Entities') 
        return true;
      }
    
    console.log('To show :' + toShow())
</script>

<style scoped>

</style>
