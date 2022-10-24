<template>
  <!-- eslint-disable vue/no-v-html -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox.camel="viewBox"
    v-html="icon"
  ></svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import { Unicon } from "vue-unicons";
import type { Unicons } from "../../types";

export default defineComponent({
  name: "BaseIcon",
  props: {
    name: { type: String, required: true },
    iconStyle: { type: String, default: "line" },
    viewBox: { type: String, default: "0 0 24 24" },
  },
  setup(props) {
    return {
      icon: Unicon.lib.find(
        (i: any) => i.name === props.name && i.style === props.iconStyle
      ).path,
    };
  },
});
</script>
