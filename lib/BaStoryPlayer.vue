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

const emitter = defineEmits(['end'])


const height = ref(props.height)
const width = ref(props.width)
const fullScreen = ref(props.startFullScreen)
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
    width.value = Math.max(window.screen.availWidth, window.screen.availHeight)
    height.value = Math.min(window.screen.availWidth, window.screen.availHeight)
  }
  else {
    if (currentFullScrrenState) {
      await document.exitFullscreen()
    }
    width.value = props.width
    height.value = props.height
  }
}
window.addEventListener('resize', updateFullScreenState)
/**
 * 指定canvas一个固定的height保证画面表现
 */
const playerHeight = 1012.5
const playerConfig = { ...props, height: playerHeight }
playerConfig.width = playerHeight * props.width / props.height

const playerScale = computed(
  //比实际放大一点放置并隐藏解决缩放不精确的问题
  () => (height.value + 1) / playerHeight
)
const playerStyle = computed(() => {
  return { height: `${height.value}px`, width: `${width.value}px` }
})
const player = ref<HTMLDivElement>()

watch([width, height], () => {
  const newWidth = playerHeight * width.value / height.value
  const app = usePlayerStore().app
  const originWidth = app.screen.width
  if (newWidth.toFixed(2) !== originWidth.toFixed(2)) {
    app.renderer.resize(newWidth, playerHeight)
    eventBus.emit('resize', originWidth)
  }
})
watch([() => props.width, () => props.height], () => {
  if (!fullScreen.value) {
    width.value = props.width
    height.value = props.height
  }
})

onMounted(() => {
  init('player__main__canvas', playerConfig, () => emitter('end'))
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
    <div id="player__main" :style="playerStyle">
      <div id="player__main__canvas" :style="{ transform: `scale(${playerScale})` }"></div>
      <BaDialog :player-height="height" :player-width="width" :style="{ width: `${width}px` }"></BaDialog>
      <BaUI :story-summary="storySummary" @fullscreen-change="fullScreen = !fullScreen" />
    </div>
  </div>
</template>

<style lang="scss">
@media screen and (orientation: portrait) {
  #player:fullscreen {
    #player__main {
      transform: rotate(-90deg);
      transform-origin: left top;
      width: 100vh;
      height: 100vw;
      overflow-x: hidden;
      position: absolute;
      top: 100%;
      left: 0;
    }
  }

}

#player {
  background-color: black;

  &__main {
    position: relative;
    overflow: hidden;

    &__canvas {
      position: absolute;
      left: 0;
      transform-origin: top left;
    }
  }
}
</style>
