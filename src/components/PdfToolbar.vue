<template>
    <div
      class="absolute w-11/12 bg-neutral-0 z-20 mx-4 mt-7 p-2 shadow-sm flex justify-between h-10"
    >
      <div>
        <a class="mr-2 ml-2">
          <unicon
            :name="Unicons.Desktop.name"
            height="20"
            class="text-neutral-700 cursor-pointer"
          />
        </a>
        <a ref="zoomInRef" class="mr-2">
          <unicon
            :onclick="() => $emit('zoomIn', {})"
            :name="Unicons.SearchPlus.name"
            height="20"
            class="text-neutral-700 cursor-pointer"
        /></a>
        <a>
          <unicon
            :onclick="() => $emit('zoomOut', {})"
            :name="Unicons.SearchMinus.name"
            height="20"
            class="text-neutral-700 cursor-pointer"
          />
        </a>
      </div>
      <div class="flex">
        <a :onclick="() => $emit('prevPage', {})" class="cursor-pointer">
          <unicon :name="Unicons.AngleLeft.name"/>
        </a>
        <span class="mr-2 ml-2 select-none">{{props.pageNum}} / {{props.pageCount}}</span>
        <a :onclick="() => $emit('nextPage', {})" class="cursor-pointer mr-2">
          <unicon :name="Unicons.AngleRight.name"/>
        </a>
      </div>
    </div>
    <MediaInfo />
  </template>
  
  <script lang="ts">
  import { defineComponent} from "vue";
  import { Unicons } from "@/types";
  import MediaInfo from "./base/MediaInfo.vue";
  export default defineComponent({
    name: "PdfToolbar",
    components: {
      MediaInfo,
    },
    props: ["pageNum", "pageCount"],
    emits: ["zoomIn", "zoomOut", "fullPage", "prevPage", "nextPage"],
    setup: (props) => {  
      return {
        Unicons,
        props
      };
      
    },
  });
  </script>
  