<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import eventBus from "../../lib/eventBus";

type IUiType = "live2d"
let uiType = ref<IUiType>("live2d");
let cacheKey = "selectCacheUi"
let current = ref("Music");
let selectCache: { uiType: IUiType; current: string };
if (localStorage.getItem(cacheKey)) {
  selectCache = JSON.parse(localStorage.getItem(cacheKey)!);
  uiType.value = selectCache["uiType"];
  current.value = selectCache["current"];
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
function emitL2dTransForm(e: MouseEvent){
  const text = (e.target as any).textContent
  switch(text){
    case '上':
      eventBus.emit()
  }
}
</script>

<template>
  <div>
    <select v-model="uiType" @change="updateType">
      <option>live2d</option>
    </select>
    <div v-if="uiType === 'live2d'" @click="emitL2dTransForm">
      <button>上</button>
      <button>下</button>
      <button>左</button>
      <button>右</button>
      <button>放大</button>
      <button>缩小</button>
    </div>
  </div>
</template>
