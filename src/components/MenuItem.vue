<template>
  <div @click="handleClick" class="flex flex-row items-center menu-item">
    <BaseButton
      class="mt-1 menu-btn"
      bg-color="var(--color-neutral)"
      @click="handleClick"
    />
    <span
      class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
    >
      {{ labelname }}
    </span>
  </div>
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
import { useUploadModal, modalChoices } from "./UploadModal.vue";
import MenuSubItem from "./MenuSubItem.vue";
const { openUploadModal, uploadModalState } = useUploadModal();
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
      openUploadModal(modalChoices.IMPORT);
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
