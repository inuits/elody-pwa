<template>
  <div
    class="w-full px-6 py-8 border-b border-neutral-50 z-10 flex items-center justify-between bg-neutral-0"
  >
    <div class="flex w-full items-center">
      <h1 class="text-lg font-semibold text-neutral-800 float-left">
        {{ pageTitle.routerTitle
        }}<span
          v-if="pageTitle.entityTitle !== '' && route.meta.showEntityTitle"
          class="text-neutral-400"
        >
          / {{ pageTitle.entityTitle }}</span
        >
      </h1>
      <edit-toggle />
    </div>
    <!-- <div class="float-right">
      <BaseButton
        v-if="auth && !auth.isAuthenticated"
        label="Log in"
        bg-color="main-light"
        txt-color="main-dark"
        @click="auth && auth.login()"
      />
      <div v-if="auth?.isAuthenticated">
        <BaseButton :icon="Unicons.User.name" bg-color="neutral-30" />
      </div>
    </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Unicons } from "@/types";
import EditToggle from "./EditButtons.vue";
import { useEditMode } from "@/composables/useEdit";

type titleTypes = "routerTitle" | "entityTitle";

type PageTitle = {
  routerTitle: string;
  entityTitle: string;
};

const pageTitle = ref<PageTitle>({
  routerTitle: "",
  entityTitle: "",
});

export const usePageTitle = () => {
  const router = useRouter();

  const updatePageTitle = (input: string, type: titleTypes = "routerTitle") => {
    pageTitle.value[type] = input;
  };

  router.beforeEach((to, _from, next) => {
    updatePageTitle("", "entityTitle");

    next();
  });

  router.afterEach((to) => {
    updatePageTitle(to.meta.title as string);
  });

  return {
    Unicons,
    pageTitle,
    updatePageTitle,
  };
};

export default defineComponent({
  name: "TheHeader",
  components: { EditToggle },
  setup() {
    const { pageTitle } = usePageTitle();
    const route = useRoute();

    const { editMode } = useEditMode();

    return {
      route,
      pageTitle,
      editMode,
    };
  },
});
</script>
