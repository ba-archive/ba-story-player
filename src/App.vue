<script lang="ts" setup>
import BaStoryPlayer from '../lib/BaStoryPlayer.vue'
import yuuka from './data/yuuka.json'
import prologue from './data/prologue1.1.json'
import eventBus from '../lib/eventBus'
import { storyHandler, resourcesLoader, eventEmitter } from '../lib/index'
import ModifyEmotionOption from './components/ModifyEmotionOption.vue';
import TestEffect from './components/TestEffect.vue';
import { ref, watch } from 'vue'
import * as PIXI from 'pixi.js'
import { usePlayerStore } from '../lib/stores'

console.log('资源加载: ', resourcesLoader)
console.log('资源调用: ', usePlayerStore())
console.log('剧情进度: ', storyHandler)

eventBus.on('*', (type, e) => {
  if (!(type === 'l2dAnimationDone' && (e as { done: boolean, animation: string }).animation.startsWith('Idle_01')))
    console.log('事件类型', type, '值', e)
})

let storySummary = {
  chapterName: '章节名',
  summary: '总之就是总结'
}
let toolType = ref('')
let cacheKey = 'toolType'
if (localStorage.getItem(cacheKey)) {
  toolType.value = localStorage.getItem(cacheKey) as string
}
watch(toolType, () => {
  localStorage.setItem(cacheKey, toolType.value)
})

Reflect.set(window, 'PIXI', PIXI)
Reflect.set(window, 'baResource', resourcesLoader)
Reflect.set(window, 'baStory', storyHandler)
Reflect.set(window, 'baStore', usePlayerStore())
Reflect.set(window, 'eventBus', eventBus)
Reflect.set(window, 'baEvent', eventEmitter)
Reflect.set(window, 'next', () => {
  eventBus.emit('characterDone')
  eventBus.emit('effectDone')
  eventBus.emit('next')
})

let width = ref(1000)
let showPlayer = ref(true)
</script>

<template>
  <div style="display:flex;justify-content: center;">
    <div v-if="showPlayer">
      <BaStoryPlayer :story="yuuka" data-url="https://yuuka.cdn.diyigemt.com/image/ba-all-data" :width="width"
        language="Cn" userName="testUser" :story-summary="storySummary" />
    </div>
    <div style="position: absolute;left: 0;display: flex;flex-direction: column;">
      <label>辅助工具选择</label>
      <select v-model="toolType">
        <option value="emotion">人物特效测试</option>
        <option value="effect">特效层特效</option>
        <option value="null">无</option>
      </select>
      <button @click="showPlayer = true">显示</button>
    </div>
    <ModifyEmotionOption class="absolute-right-center" v-if="toolType === 'emotion'" />
    <Suspense>
      <TestEffect class="absolute-right-center" v-if="toolType === 'effect'" />
    </Suspense>
</div>
</template>


<style scoped>
.absolute-right-center {
  position: absolute;
  background-color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  right: 0;
  height: 95vh;
  overflow-y: scroll;
  z-index: 1000;
}
</style>
