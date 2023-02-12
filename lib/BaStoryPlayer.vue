<script lang="ts" setup>
import eventBus from "@/eventBus";
import { init } from '@/index';
import { StoryRawUnit } from '@/types/common';
import { onMounted } from 'vue';
import BaDialog from "@/layers/textLayer/BaDialog.vue";
import { Language, StorySummary } from '@/types/store';


let props = defineProps<{
  story: StoryRawUnit[]
  dataUrl: string
  height: number
  width: number
  language: Language
  userName: string
  storySummary: StorySummary
}>()

let emitter = defineEmits(['end'])

onMounted(() => { init('player__main', props, () => emitter('end')) })

/**
 * 测试文本框
 * @constructor
 */
function testDialog() {
  eventBus.emit('showText', {
    text: [{ content: "测试文本1", waitTime: 0, effects: [] }, { content: "测试文本2", waitTime: 2000, effects: [] }],
    speaker: {
      name: "未花",
      nickName: "茶话会"
    },
  });
}


function clearSt() {
  eventBus.emit("clearSt");
}

</script>

<template>
  <div id="player" :style="{ height: `${height}px` }">
    <div id="player__main">
      <BaDialog :player-height="height" :player-width="width" :style="{ width: `${width}px` }"></BaDialog>
    </div>
  </div>
</template>

<style>
#player {
  background-color: black;
}
</style>
