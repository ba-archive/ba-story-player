<script lang="ts" setup>
import { init } from '@/index';
import BaDialog from "@/layers/textLayer/BaDialog.vue";
import BaUI from "@/layers/uiLayer/BaUI.vue"
import { StoryRawUnit } from '@/types/common';
import { Language, StorySummary } from '@/types/store';
import { computed, onMounted, ref, watch } from 'vue';
import eventBus from './eventBus';
import { usePlayerStore } from './stores';

export type PlayerProps = {
  story: StoryRawUnit[]
  dataUrl: string
  width: number
  height: number
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
const storySummary = ref(props.storySummary)
storySummary.value.summary = storySummary.value.summary.replace('[USERNAME]', props.userName)

const emitter = defineEmits(['end'])

const playerHeight = ref(props.height)
const playerWidth = ref(props.width)
const fullScreen = ref(props.startFullScreen)
const fullScreenMaxAspectRatio = 16 / 9
watch(fullScreen, updateFullScreenState)
/**
 * 根据fullScrren值更新播放器状态
 */
async function updateFullScreenState() {
  const currentFullScrrenState = document.fullscreenElement !== null
  if (fullScreen.value) {
    if (!currentFullScrrenState) {
      await player.value?.requestFullscreen({ navigationUI: 'hide' })
    }
    playerHeight.value = Math.min(window.screen.availWidth, window.screen.availHeight)
    const tempWidth = Math.max(window.screen.availWidth, window.screen.availHeight)
    if (tempWidth / playerHeight.value > fullScreenMaxAspectRatio) {
      playerWidth.value = playerHeight.value * fullScreenMaxAspectRatio
    }
    else {
      playerWidth.value = tempWidth
    }
  }
  else {
    if (currentFullScrrenState) {
      await document.exitFullscreen()
    }
    playerWidth.value = props.width
    playerHeight.value = props.height
  }
}
window.addEventListener('resize', updateFullScreenState)
/**
 * 指定canvas一个固定的height保证画面表现
 */
const pixiHeight = 1012.5
const pixiConfig = { ...props, height: pixiHeight }
pixiConfig.width = pixiHeight * props.width / props.height

const pixiScale = computed(
  //比实际放大一点放置并隐藏解决缩放不精确的问题
  () => (playerHeight.value + 1) / pixiHeight
)
const playerStyle = computed(() => {
  return { height: `${playerHeight.value}px`, width: `${playerWidth.value}px` }
})
const player = ref<HTMLDivElement>()
/**
 * 强制横屏时的top
 */
const fullscreenTopOffset = computed(() => {
  const screenWidth = Math.max(window.screen.availHeight, window.screen.availWidth)
  return `${100 - (1 - playerWidth.value / screenWidth) / 2 * 100}%`
})

watch([playerWidth, playerHeight], () => {
  const newWidth = pixiHeight * playerWidth.value / playerHeight.value
  const app = usePlayerStore().app
  const originWidth = app.screen.width
  if (newWidth.toFixed(2) !== originWidth.toFixed(2)) {
    app.renderer.resize(newWidth, pixiHeight)
    eventBus.emit('resize', originWidth)
  }
})
watch([() => props.width, () => props.height], () => {
  if (!fullScreen.value) {
    playerWidth.value = props.width
    playerHeight.value = props.height
  }
})

onMounted(() => {
  init('player__main__canvas', pixiConfig, () => emitter('end'))
  if (props.startFullScreen) {
    updateFullScreenState()
  }
  //保证fullscreen值正确性
  player.value?.addEventListener('fullscreenchange', () => {
    fullScreen.value = document.fullscreenElement !== null
  })
})

</script>

<template>
  <div id="player" :style="playerStyle" ref="player">
    <div id="player__background" :style="playerStyle">
      <div id="player__main" :style="playerStyle">
        <div id="player__main__canvas" :style="{ transform: `scale(${pixiScale})` }"></div>
        <BaDialog :player-height="playerHeight" :player-width="playerWidth" :style="{ width: `${playerWidth}px` }">
        </BaDialog>
        <BaUI :story-summary="storySummary" @fullscreen-change="fullScreen = !fullScreen" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@media screen and (orientation: portrait) {
  #player:fullscreen {
    #player__background {
      transform: rotate(-90deg);
      transform-origin: left top;
      position: absolute;
      top: v-bind(fullscreenTopOffset);
      left: 0;
    }
  }

}

#player {
  background-color: black;

  &:fullscreen {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__main {
    position: relative;
    display: inline-block;
    overflow: hidden;

    &__canvas {
      position: absolute;
      left: 0;
      transform-origin: top left;
    }
  }
}
</style>
