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
      <a ref="zoomInRef" class="mr-1">
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
    <div class="flex select-none">
      <div class="flex items-center mr-2 pb-0.5">
        <span>Page</span>
      </div>
      <a v-on:click="changePageWrapper(props.pageNum - 1)" class="cursor-pointer">
        <unicon :name="Unicons.AngleLeft.name"/>
      </a>
      <span class="mr-1 ml-1 select-none">
        <input 
          ref="input"
          type="number"
          :value="props.pageNum" 
          style="direction:rtl" 
          class="h-6 w-8 p-0"
          min="1"
          :max="props.pageCount"
          v-on:change="(e) => {changePageWrapper(e.target.value)}"/>  /  
        <span class="inline-block w-8">{{props.pageCount}}</span>
      </span>
      <a v-on:click="changePageWrapper(props.pageNum + 1)" class="cursor-pointer mr-1 ml-1">
        <unicon :name="Unicons.AngleRight.name"/>
      </a>
    </div>
  </div>
  <div>
    <MediaInfo/>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref} from "vue";
import { Unicons } from "@/types";
import MediaInfo from "./base/MediaInfo.vue";
export default defineComponent({
  name: "PdfToolbar",
  components: {
    MediaInfo,
  },
  props: ["pageNum", "pageCount"],
  emits: ["zoomIn", "zoomOut", "fullPage", "changePage"],
  setup: (props, {emit}) => {  
    const input = ref<HTMLInputElement | undefined>(undefined)

    const changePageWrapper = (num) => {
      if (num > props.pageCount){
        num = props.pageCount;
      } else if (num < 1){
        num = 1;
      }
      input.value.value = num;
      emit('changePage', {num: num});
    }

    return {
      Unicons, 
      props,
      changePageWrapper,
      input
    };
    
    

  },
});
</script>
  
<style scoped>
  input {
    border: none;
    border-radius: 4px;
  }

  input:focus {
    outline: none;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>