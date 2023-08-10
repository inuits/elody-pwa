<template>
  <div
    v-if="show === true"
    :class="[
      'flex flex-column items-center cursor-pointer ml-9 mt-1 origin-top-center hover:text-accent-accent',
      { 'text-accent-accent': isActive },
    ]"
    @click="navigateToEntity(destination as string)"
  >
    <p class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer">
      {{ t(labelName || "") }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  typeLink: String,
  labelName: String,
  destination: String,
});
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const isActive = computed(
  () => route.path.replace("/", "") === props.destination
);

const navigateToEntity = (destination: string) => {
  console.log(destination);
  router.push({ path: "/" + destination });
};
</script>
<style></style>
