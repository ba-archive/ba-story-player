<script lang="ts" setup>
import eventBus from "@/eventBus";
import { init } from '@/index';
import { StoryRawUnit } from '@/types/common';
import { onMounted } from 'vue';
//@ts-ignore
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
function testSt2() {
  eventBus.emit("st", {
    text: [{
      content: "",
      waitTime: 0,
      effects: []
    },{
      content: "― 没想到",
      waitTime: 1800,
      effects: []
    },{
      content: "只过了",
      waitTime: 500,
      effects: []
    },{
      content: "几个月",
      waitTime: 300,
      effects: []
    },{
      content: "时间",
      waitTime: 600,
      effects: []
    },{
      content: "体力",
      waitTime: 1100,
      effects: []
    },{
      content: "就下降",
      waitTime: 500,
      effects: []
    },{
      content: "到了",
      waitTime: 500,
      effects: []
    },{
      content: "这种程度……",
      waitTime: 200,
      effects: []
    }],
    stArgs: [[-1200,-630], "serial", 1]
  })
}

function clearSt() {
  eventBus.emit("clearSt");
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
    <button style="margin-left:1%" @click="testSt2">st测试2</button>
    <button style="margin-left:1%" @click="clearSt">clearSt</button>
    <button style="margin-left:1%" @click="() => {  eventBus.emit('next') }">next</button>
  </div>
</template>

<style>
#player {
  background-color: black;
}
</style>
