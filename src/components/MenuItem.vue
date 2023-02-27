<template>
  <div @click="handleClick" class="flex flex-row items-center menu-item ml-3" :class="{IsActive:showDropdown}">
    <unicon
      v-if="icon"
      :name="Unicons[icon].name"
      height="18"
    />
    <span
      class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
    >
      {{ labelname }}
    </span>
  </div>
  <div v-for="submenuItem in submenu" :key="submenuItem.label">
    <MenuSubItem
      :linkType="submenuItem.linkType"
      :labelName="submenuItem.label"
      :destination="submenuItem.destination"
      :show="showDropdown"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, PropType} from "vue";
import { useAuth } from "session-vue-3-oidc-library";
import { useRouter } from "vue-router";
import MenuSubItem from "./MenuSubItem.vue";
import useUploadModal, { modalChoices }  from "../composables/useUploadModal";
import {useCreateModal} from "./CreateModal.vue";
import { Unicons } from "@/types";
import type { DamsIcons } from "../types";
import { MenuLinkType } from "@/generated-types/queries";
const { openUploadModal } = useUploadModal();
const {openCreateModal} = useCreateModal()
const router = useRouter();
const auth = useAuth();
const showDropdown = ref(false);
const submenu = ref<Array<any>>([]);
const toggleDropDown = () => {
  showDropdown.value = !showDropdown.value;
  console.log(showDropdown.value);
};
const props = defineProps({
  labelname: String,
  destination: String,
  LinkType: String,
  subMenu: {
    type: Object,
    default: null,
  },
  icon:{
    type:Object as PropType<DamsIcons>
  },
});
const handleClick = () => {
  handleLinkType();
  toggleDropDown();
};
const handleLinkType = () => {
  if (props.LinkType === MenuLinkType.Modal) {
    if (props.destination === "Upload") {
      openUploadModal(modalChoices.DROPZONE);
    }
    if(props.destination === "Nieuw"){
      openCreateModal();
    }
  } else if (props.LinkType === MenuLinkType.Route) {
    router.push(`/${props.destination}`);
  }
};
const handleSubMenu = () => {
  if (props.subMenu) {
    for (const key in props.subMenu) {
      console.log("test", key);
      if (
        props.subMenu[key].linkType === MenuLinkType.Route ||
        props.subMenu[key].linkType === MenuLinkType.Modal
      ) {
        submenu.value.push(props.subMenu[key]);
      }
    }
  }
};
handleSubMenu();
</script>
<style>

.IsActive {
  fill: #02c6f2;
  color: #02c6f2;
  background-color: var(--color-neutral-40);
  border-radius: 10px;
  height: 2.3rem;
}

</style>
