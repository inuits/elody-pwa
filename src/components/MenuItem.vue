<template>
  <router-link :to="`${destination}`" @click="handleClick" class="flex flex-row items-center menu-item">
    <BaseButtonNew
      class="mt-1 menu-btn"
      :class="{ IsActive: showDropdown }"
      activeClass="IsActive"
      bg-color="var(--color-neutral)"
      @click="handleClick"
      :icon="icon || 'no-icon'"
      :height="17"
    />
    <span
      class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
    >
      {{ labelname }}
    </span>
    
  </router-link>
  <div v-for="submenuItem in submenu" :key="submenuItem.label">
    <MenuSubItem
      class=""
      :linkType="submenuItem.linkType"
      :labelName="submenuItem.label"
      :destination="submenuItem.destination"
      :show="showDropdown"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useAuth } from "session-vue-3-oidc-library";
import { useRouter } from "vue-router";
import MenuSubItem from "./MenuSubItem.vue";
import useUploadModal, { modalChoices }  from "../composables/useUploadModal";
import BaseButtonNew from "./base/BaseButtonNew.vue";
const { openUploadModal } = useUploadModal();
const router = useRouter();
const auth = useAuth();
const showDropdown = ref(false);
const submenu = ref<Array<any>>([]);
const toggleDropDown = () => {
  showDropdown.value = !showDropdown.value;
  console.log(showDropdown.value);
  // console.log('Data a mattie  ' + menu.entities)
};
const props = defineProps({
  labelname: String,
  destination: String,
  LinkType: String,
  icon:String,
  subMenu: {
    type: Object,
    default: null,
  },
});
const handleClick = () => {
  handleLinkType();
  toggleDropDown();
};
const handleLinkType = () => {
  if (props.LinkType === "modal") {
    console.log("I want to open a modal");
    if (props.destination === "Upload") {
      openUploadModal(modalChoices.DROPZONE);
    }
  } else if (props.LinkType === "route") {
    router.push(`/${props.destination}`);
  }
};
const handleSubMenu = () => {
  if (props.subMenu) {
    for (const key in props.subMenu) {
      console.log("test", key);
      if (
        props.subMenu[key].linkType === "route" ||
        props.subMenu[key].linkType === "modal"
      ) {
        submenu.value.push(props.subMenu[key]);
      }
    }
  }
};
handleSubMenu();
</script>
<style>

</style>
