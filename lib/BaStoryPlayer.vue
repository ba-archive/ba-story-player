<script lang="ts" setup>
import { init } from '@/index';
import BaDialog from "@/layers/textLayer/BaDialog.vue";
import BaUI from "@/layers/uiLayer/BaUI.vue"
import { StoryRawUnit } from '@/types/common';
import { Language, StorySummary } from '@/types/store';
import { computed, onMounted } from 'vue';


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

let playerWidth = 1800
let playerConfig = { ...props }
playerConfig.width = playerWidth
playerConfig.height = props.height * playerWidth / props.width
let scale = computed(() => props.width / playerWidth)
onMounted(() => { init('player__main__canvas', playerConfig, () => emitter('end')) })


</script>

<template>
  <div id="player" :style="{ height: `${height}px`, width: `${width}px` }">
    <div id="player__main" :style="{ height: `${height}px`, width: `${width}px` }">
      <div id="player__main__canvas" :style="{ transform: `scale(${scale})` }"></div>
      <BaDialog :player-height="height" :player-width="width" :style="{ width: `${width}px` }"></BaDialog>
      <BaUI :story-summary="storySummary" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
#player {
  background-color: black;

  &__main {
    position: relative;

    &__canvas {
      position: absolute;
      left: 0;
      top: 0;
      transform-origin: top left;
    }
  }
}
</style>
