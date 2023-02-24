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

const fullScreen = ref(props.startFullScreen)
watch(fullScreen, val => {
  if (val) {
    // width.value = window.screen.availWidth
  }
  else {
    // width.value = props.width
  }
})


/**
 * 指定canvas一个固定的height保证画面表现
 */
const playerHeight = 1012.5
const playerConfig = { ...props, height: playerHeight }
playerConfig.width = playerHeight * props.width / props.height
if (fullScreen.value) {
  // width.value = window.screen.availWidth
}


const playerScale = computed(
  //比实际放大一点放置并隐藏解决缩放不精确的问题
  () => (props.height + 1) / playerConfig.height
)
const playerStyle = computed(() => {
  return { height: `${props.height}px`, width: `${props.width}px` }
})
const player = ref<HTMLDivElement>()

watch([() => props.height, () => props.width], () => {
  const newWidth = playerHeight * props.width / props.height
  const app = usePlayerStore().app
  console.log(app.screen.width, newWidth)
  if (newWidth.toFixed(2) !== app.screen.width.toFixed(2)) {
    app.renderer.resize(newWidth, playerHeight)
    eventBus.emit('resize')
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
      <div id="player__main__canvas" :style="{ transform: `scale(${playerScale})` }"></div>
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

    &__canvas {
      position: absolute;
      left: 0;
      transform-origin: top left;
    }
  }
}
</style>
