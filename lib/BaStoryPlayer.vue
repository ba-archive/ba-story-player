<script lang="ts" setup>
import { onMounted } from 'vue';
import { init } from '@/index';
import { StoryRawUnit } from '@/types/common';
import eventBus from "@/eventBus";
import BaDialog from "@/layers/textLayer/BaDialog.vue";
import { Language } from './types/store';

let { story, dataUrl, height, width, language } = defineProps<{
  story: StoryRawUnit[]
  dataUrl: string
  height: number
  width: number
  language: Language
}>()

onMounted(() => { init('player__main', height, width, story, dataUrl, language) })

/**
 * 测试文本框
 * @constructor
 */
function TestDialog() {
  eventBus.emit('showText', {
    text: [{ content: "测试文本asjdklajsdlkjlaskd", waitTime: 1000 }],
    speaker: {
      name: "未花",
      nickName: "茶话会"
    },
    textEffect: []
  });
}

</script>

<template>
  <div id="player" :style="{ height: `${height}px` }">
    <div id="player__main">
      <BaDialog class="dialog" :dialog-height="height"
        :style="{ marginTop: `${height / 2}px`, width: `${width}px`, height: `${height / 2}px` }"></BaDialog>
    </div>
    <button @click="TestDialog">文本框测试</button>
  </div>
</template>

<style>
#player {
  background-color: black;
}

.dialog {
  position: absolute;
}
</style>