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
function TestDialog() {
  eventBus.emit('showText', {
    text: [{ content: "测试文本asjdklajsdlkjlaskd", waitTime: 1000, effects: [] }],
    speaker: {
      name: "未花",
      nickName: "茶话会"
    },
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
    <button style="margin-left:1%" @click="() => { eventBus.emit('next') }">next</button>
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