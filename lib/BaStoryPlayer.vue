<script lang="ts" setup>
import { onMounted } from 'vue';
import { init } from '@/index';
import { StoryRawUnit } from '@/types/common';
import eventBus from "@/eventBus";
//@ts-ignore
import BaDialog from "@/layers/textLayer/BaDialog.vue";
import { Language } from './types/store';
import L2D from "@/layers/l2dLayer/L2D.vue";
import {SpineSetting} from "@/layers/l2dLayer/L2DInfo";

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
function TestDialog() {
  eventBus.emit('showText', {
    text: [{ content: "测试文本asjdklajsdlkjlaskd", waitTime: 1000, effects: [] }],
    speaker: {
      name: "未花",
      nickName: "茶话会"
    },
  });
}
/**
 * 测试L2D数据
 */
 let l2dSetting : SpineSetting = {
  canvasHeight: props.height,
  canvasWidth: props.width,
  loadInfo: [
    {name : "CH0184", url : "http://dns.xingsuileixi.com/BA/Yuuka_home_sports/CH0184_home.skel"},
    {name : "CH0184_Start", url : "http://dns.xingsuileixi.com/BA/Yuuka_home_sports_start/CH0184_00.skel"},
  ],
  positionX: 0,
  positionY: 0,
  scale: 1,
  talkName: "",
  talkNameEnd: "",
  mixType: 2,
  animationIndex: [
    {name: "CH0184", animationName: "Start_Idle_01"},
    {name: "CH0184_Start", animationName: "Start_Idle_01"},
    {name: "CH0184", animationName: "Start_Idle_02"}
  ],
}
</script>

<template>
  <div id="player" :style="{ height: `${height}px` }">
    <div id="player__main">
      <BaDialog class="dialog" :dialog-height="height"
        :style="{ marginTop: `${height / 2}px`, width: `${width}px`, height: `${height / 2}px` }"></BaDialog>
    </div>
    <button @click="TestDialog">文本框测试</button>
    <button style="margin-left:1%" @click="() => {  eventBus.emit('next') }">next</button>
    <L2D
    :canvas-width="l2dSetting.canvasWidth"
    :canvas-height="l2dSetting.canvasHeight"
    :load-info="l2dSetting.loadInfo"
    :mix-type="l2dSetting.mixType"
    :animation-index="l2dSetting.animationIndex"
  >
  </L2D>
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