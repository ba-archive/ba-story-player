<script lang="ts" setup>
import { onMounted } from 'vue';
import { init } from '@/index';
import { StoryRawUnit } from '@/types/common';
import eventBus from "@/eventBus";
//@ts-ignore
import BaDialog from "@/layers/textLayer/BaDialog.vue";
import { Language } from './types/store';

let props = defineProps<{
  story: StoryRawUnit[]
  dataUrl: string
  height: number
  width: number
  language: Language
  username: string
}>()

onMounted(() => { init('player__main', props.height, props.width, props.story, props.dataUrl, props.language, props.username) })

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

function testSt() {
  eventBus.emit("st", {
    text: [{
      content: "― 哈、",
      waitTime: 0,
      effects: []
    },{
      content: "哈……",
      waitTime: 1500,
      effects: []
    }],
    stArgs: [[-1200,-530], "serial", 1]
  })
}

</script>

<template>
  <div id="player" :style="{ height: `${height}px` }">
    <div id="player__main">
      <BaDialog :player-height="height" :player-width="width"
        :style="{ width: `${width}px` }"></BaDialog>
    </div>
    <button @click="testDialog">文本框测试</button>
    <button style="margin-left:1%" @click="testSt">st测试</button>
    <button style="margin-left:1%" @click="() => {  eventBus.emit('next') }">next</button>
  </div>
</template>

<style>
#player {
  background-color: black;
}
</style>