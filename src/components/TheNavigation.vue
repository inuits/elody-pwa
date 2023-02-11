<template>
  <nav class="navbar fixed left-0 top-0 w-24 h-screen flex flex-col justify-start align-center pt-10 bg-neutral-20 px-5 z-50" v-show="!loading">
    <router-link :to="{ name: 'Home' }" class="logo router-link text-base text-neutral-700 font-semibold flex justify-center items-center mb-8" @click="forceDisableEditModalHome">
      {{ $t("navigation.title") }}
    </router-link>
    
    
    <!-- Entities -->
    <div class="flex flex-row items-center"  @click="toggleDropDown">
      <BaseButton :icon="Unicons.BookOpen.name" bg-color="neutral-30" class="menu-btn"  @click="forceDisableEditModalHome"/>
      <span class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold" @click="forceDisableEditModalHome">
        {{ $t("navigation.entities") }}
      </span>
    </div>
    <div class="flex flex-column items-center dropdownMenu-item" v-if="showDropdown==true">
      <span>{{ $t("navigation.asset") }}</span>
    </div>
    
    <div class="flex flex-column items-center dropdownMenu-item" v-if="showDropdown==true">
      <span @click="forceDisableEditMediafiles">{{ $t("navigation.boeken") }}</span>
    </div>
    <div class="flex flex-column items-center dropdownMenu-item" v-if="showDropdown==true">
      <span @click="openCreateModal">{{ $t("navigation.tijdschriften") }}</span>
    </div>
      
    
    <!-- Mediafile -->
    <div v-show="auth.isAuthenticated.value === true" class="flex flex-row items-center menu-item" @click="forceDisableEditMediafiles">
      <BaseButton :icon="Unicons.Image.name" bg-color="neutral-30" class="menu-btn" @click="forceDisableEditMediafiles"/>
      <span class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"  @click="forceDisableEditMediafiles">
        {{ $t("navigation.mediafile") }}
      </span>
    </div>


    <!-- Upload -->
    <div v-show=" auth.isAuthenticated.value === true && determinePermission('can-start-import')" class="flex flex-row items-center menu-item">
      <BaseButton :icon="Unicons.Upload.name" class="mt-1 menu-btn" bg-color="neutral-30" @click="openUploadModal(modalChoices.IMPORT)"/>
      <span class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold" @click="openUploadModal(modalChoices.IMPORT)">
        {{ $t("navigation.upload") }}
      </span>
    </div>


    <!-- Nieuw -->
    <div v-show="auth.isAuthenticated.value === true && determinePermission('create-entity')" class="flex flex-row items-center menu-item">
      <BaseButton :icon="Unicons.Create.name" class="mt-1 menu-btn" bg-color="neutral-30" @click="openCreateModal"/>
      <span class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold" @click="openCreateModal">
        {{ $t("navigation.nieuw") }}
      </span>
    </div>
    
    
    <!-- Jobs -->
    <div v-show="auth.isAuthenticated.value === true" class="flex flex-row items-center menu-item">
      <BaseButton :icon="Unicons.History.name" bg-color="neutral-30" class="mt-1 menu-btn" @click="forceDisableEditModalHistory"/>
      <span
        class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold" @click="forceDisableEditModalHistory">
        {{ $t("navigation.jobs") }}
      </span>
    </div>
    
    
    <EditToggle v-if="auth.isAuthenticated.value === true" />


    <div class="flex flex-row items-center menu-item login-out">
      <BaseButton v-if="auth.isAuthenticated.value === false" :icon="Unicons.User.name" class="mt-1 menu-btn" bg-color="neutral-30" @click="auth.redirectToLogin()"/>
      <span v-if="auth.isAuthenticated.value === false" class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold" @click="auth.redirectToLogin()">
        {{ $t("navigation.log-in") }}
      </span>
    </div>


    <div class="flex flex-row items-center menu-item login-out">
      <BaseButton v-if="auth.isAuthenticated.value === true" :icon="Unicons.SignOut.name" class="mt-1 menu-btn" bg-color="neutral-30" @click="logout()"/>
      <span v-if="auth.isAuthenticated.value === true" class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold" @click="auth.redirectToLogin()">
        {{ $t("navigation.log-out") }}
      </span>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { inject, ref } from "vue";
import BaseButton from "./base/BaseButton.vue";
import { useUploadModal, modalChoices } from "./UploadModal.vue";
import { Unicons } from "../types";
import { useRouter } from "vue-router";
import { useEditMode } from "../composables/useEdit";
import { useCreateModal } from "./CreateModal.vue";
import { useAuth } from "session-vue-3-oidc-library";
import { usePermissions } from "../composables/usePermissions";
import EditToggle from "./EditButtons.vue";

const auth = useAuth();
const { determinePermission, loading } = usePermissions();
const { openUploadModal } = useUploadModal();
const { openCreateModal } = useCreateModal();
const router = useRouter();
const { disableEditMode } = useEditMode();
const showDropdown = ref(false);
const forceDisableEditModalHome = () => {
  router.push({ name: "Home" });
  disableEditMode();
};

const forceDisableEditModalHistory = () => {
  router.push({ name: "History" });
  disableEditMode();
};

const forceDisableEditMediafiles = () => {
  router.push({ name: "Mediafiles" });
  disableEditMode();
};


const logout = async () => {
  await auth.logout();
  router.push({ name: "Home" });
};

const toggleDropDown = () => {
    showDropdown.value = !showDropdown.value;
    console.log(showDropdown.value)
}

</script>


<style scoped>
.navbar {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  overflow-x: hidden;
}

.menu-item {
  margin-top: 1rem;
}

.menu-item:hover .menu-btn {
  --tw-bg-opacity: 1;
  background-color: rgb(165 173 186 / var(--tw-bg-opacity));
}

.navbar:hover {
  width: 20rem;
}

.navbar:hover .router-link {
  justify-content: flex-start;
}
.login-out {
  position: fixed;
  bottom: 3%;
  left: 1%;
}
.navbar:hover .nav-item-label {
  animation: showText 0.1s ease-in 0.2s forwards;
  -moz-animation: showText 0.1s ease-in 0.2s forwards;
  -webkit-animation: showText 0.1s ease-in 0.2s forwards;
  -o-animation: showText 0.1s ease-in 0.2s forwards;
  animation-fill-mode: forwards;
}

a{
  color: black;
}
.dropdownMenu-item {
  
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  margin-left: 2rem;
  margin-top: 0.5rem;

}

.dropdownMenu-item:hover{
  color:'var(--color-blue-100)'
}

@keyframes showText {
  100% {
    width: auto;
    height: auto;
  }
}

@-webkit-keyframes showText {
  100% {
    width: auto;
    height: auto;
  }
}
</style>
