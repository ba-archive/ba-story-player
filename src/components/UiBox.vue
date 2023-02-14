<script setup lang="ts">
import { ref, watch } from "vue";
import eventBus from "../../lib/eventBus";
import _ from "lodash-es";
import { storyHandler } from "@/index";
type IUiType = "live2d" | "currentStoryIndex";
let uiType = ref<IUiType>("live2d");
let cacheKey = "selectCacheUi";
let current = ref();
const currentStoryIndex = ref(0);
// 用来还原
const initTrans = {
  x: 0,
  y: 0,
  scale: 1,
};
let backTrans = _.cloneDeep(initTrans);
let selectCache: { uiType: IUiType; current: string };
if (localStorage.getItem(cacheKey)) {
  selectCache = JSON.parse(localStorage.getItem(cacheKey)!);
  uiType.value = selectCache["uiType"];
  current.value = selectCache["current"];
  // 每次更改相当于设置默认从这个index开始
  if(uiType.value === "currentStoryIndex"){
    currentStoryIndex.value = current.value
  }
} else {
  selectCache = {
    uiType: uiType.value,
    current: current.value,
  };
  localStorage.setItem(cacheKey, JSON.stringify(selectCache));
}

function updateType() {
  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      uiType: uiType.value,
      current: current.value,
    })
  );
}

watch(
  currentStoryIndex,
  (val) => {
    storyHandler.currentStoryIndex = +val;
    current.value = +val
    updateType()
    eventBus.emit("next")
  },
  { immediate: true }
);
function emitL2dTransForm(e: MouseEvent) {
  const text = (e.target as any).textContent;
  let emitParams = {} as typeof backTrans;
  switch (text) {
    case "上":
      emitParams.y = -10;
      backTrans.y += 10;
      break;
    case "下":
      emitParams.y = 10;
      backTrans.y -= 10;
      break;
    case "左":
      emitParams.x = -10;
      backTrans.x += 10;
      break;
    case "右":
      emitParams.x = 10;
      backTrans.x -= 10;
      break;
    case "放大":
      emitParams.scale = 1.1;
      backTrans.scale /= 1.1;
      break;
    case "缩小":
      emitParams.scale = 0.9;
      backTrans.scale /= 0.9;
      break;
    case "还原":
      emitParams = backTrans;
      backTrans = _.cloneDeep(initTrans);
      break;
  }
  console.log("当前l2d移动情况", backTrans);
  eventBus.emit("l2dTransForm", emitParams);
}
</script>

<template>
  <div>
    <select v-model="uiType" @change="updateType">
      <option>live2d</option>
      <option>currentStoryIndex</option>
    </select>
    <div v-if="uiType === 'live2d'" @click="emitL2dTransForm">
      <button>上</button>
      <button>下</button>
      <button>左</button>
      <button>右</button>
      <button>放大</button>
      <button>缩小</button>
      <button>还原</button>
    </div>
    <div v-if="uiType === 'currentStoryIndex'">
      <input v-model="currentStoryIndex" style="width: 90%;" />
    </div>
  </div>
</template>
