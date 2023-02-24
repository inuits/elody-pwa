<template>
  <div @click="handleLinkType" v-show="auth.isAuthenticated.value">
    <BaseButton
      class="mt-1 menu-btn"
      bg-color="var(--color-neutral)"
      @click="handleLinkType"
    />

    <span
      class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
    >
      {{ labelname }}
    </span>
  </div>
  <div v-for="submenuItem in submenu" :key="submenuItem.label">
    <MenuSubItem :linkType="submenuItem.linkType" :labelName="submenuItem.label" :destination="submenuItem.destination" />
   </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { Unicons } from "../types";
import { useAuth } from "session-vue-3-oidc-library";
import { useRouter } from "vue-router";
import { useUploadModal, modalChoices } from "./UploadModal.vue";
import MenuSubItem from "./MenuSubItem.vue"
const { openUploadModal, uploadModalState } = useUploadModal();
const router = useRouter();
const auth = useAuth();
const props = defineProps({
  labelname: String,
  destination: String,
  LinkType: String,
  subMenu: {
    type: Object,
    default: null,
  },
});
const submenu = ref<Array<any>>([]);

const handleLinkType = () => {
  if (props.LinkType === "modal") {
    console.log("I want to open a modal");
    if (props.destination === "Upload") {
      openUploadModal(modalChoices.IMPORT);
    }
  } else if (props.LinkType === "route") {
    router.push(`/${props.destination}`);
  }
};
const handleSubMenu = () => {
  if (props.subMenu) {
    
    for (const key in props.subMenu) {
      console.log("test", key)
      // if (props.subMenu[key].hasOwnProperty("linkType")) {
        //@ts-ignore
        if (props.subMenu[key].linkType === "route" ||props.subMenu[key].linkType === "modal")
         {
          submenu.value.push(props.subMenu[key]);
        }
      // }
    }
  }
};
handleSubMenu();
</script>

<style scoped>
</style>
