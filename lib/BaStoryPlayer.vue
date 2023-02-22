<script lang="ts" setup>
import { init } from '@/index';
import BaDialog from "@/layers/textLayer/BaDialog.vue";
import BaUI from "@/layers/uiLayer/BaUI.vue"
import { StoryRawUnit } from '@/types/common';
import { Language, StorySummary } from '@/types/store';
import { computed, onMounted, ref, watch } from 'vue';

export type PlayerProps = {
  story: StoryRawUnit[]
  dataUrl: string
  width: number
  language: Language
  userName: string
  storySummary: StorySummary
  startFullScreen?: boolean
  useMp3?: boolean
  useSuperSampling?: boolean
}
const props = withDefaults(defineProps<PlayerProps>(), {
  startFullScreen: false,
  useMp3: false,
  useSuperSampling: false
})

let emitter = defineEmits(['end'])

let fullScreen = ref(props.startFullScreen)
watch(fullScreen, val => {
  if (val) {
    width.value = window.screen.availWidth
  }
  else {
    width.value = props.width
  }
})

/**
 * 根据屏幕大小计算宽高比 
 */
let aspectRatio = 0
if (window.screen.height > window.screen.width) {
  aspectRatio = window.screen.width / window.screen.height
}
else {
  aspectRatio = window.screen.height / window.screen.width
}

/**
 * 指定canvas一个固定的width保证画面表现
 */
let playerWidth = 1400
let playerConfig = { ...props, height: 0 }
playerConfig.width = playerWidth
playerConfig.height = playerWidth * aspectRatio
let width = ref(props.width)
let height = computed(() => width.value * aspectRatio)
if (fullScreen.value) {
  width.value = window.screen.availWidth
}
watch(() => props.width, val => {
  if (!fullScreen.value) {
    width.value = val
  }
})
window.addEventListener('resize', e => {
  if (fullScreen.value) {
    width.value = window.screen.availWidth
  }
})
let scale = computed(
  () => (height.value + 1) / playerConfig.height
)
let playerStyle = computed(() => {
  return { height: `${height.value}px`, width: `${width.value}px` }
})
let player = ref<HTMLDivElement>()
//当availheight与height不匹配时进行偏移
let topPx = computed(() => {
  if (fullScreen.value && Math.abs(window.screen.availHeight - height.value) >= 10) {
    return `${(window.screen.availHeight - height.value) / 2}px`
  }
  else {
    return '0px'
  }
})


onMounted(() => {
  init('player__main__canvas', playerConfig, () => emitter('end'))
  if (props.startFullScreen) {
    player.value?.requestFullscreen({ navigationUI: 'hide' })
    player.value?.addEventListener('fullscreenchange', () => {
      fullScreen.value = document.fullscreenElement !== null
    })
  }
})

</script>

<template>
  <div id="player" :style="playerStyle" ref="player">
    <div id="player__main" :style="playerStyle">
      <div id="player__main__canvas" :style="{ transform: `scale(${scale})` }"></div>
      <BaDialog :player-height="height" :player-width="width" :style="{ width: `${width}px` }"></BaDialog>
      <BaUI :story-summary="storySummary" />
    </div>
  </div>
</template>

<style lang="scss">
#player {
  background-color: black;
  overflow: hidden;

  &__main {
    position: relative;
    top: v-bind(topPx);

    &__canvas {
      position: absolute;
      left: 0;
      transform-origin: top left;
    }
  }
}
</style>
