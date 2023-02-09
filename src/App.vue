<script lang="ts" setup>
import BaStoryPlayer from '../lib/BaStoryPlayer.vue'
import yuuka from './data/yuuka.json'
import prologue from './data/prologue1.1.json'
import eventBus from '../lib/eventBus'
import { storyHandler, resourcesLoader, eventEmitter } from '../lib/index'
import ModifyEmotionOption from './components/ModifyEmotionOption.vue';
import TestEffect from './components/TestEffect.vue';
import { ref, watch } from 'vue'

window.baResource = resourcesLoader // 方便查看资源加载情况
window.baStory = storyHandler
console.log('资源加载: ', window.baResource)
console.log('资源调用: ', window.baStore)
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

Reflect.set(window, 'eventBus', eventBus)
Reflect.set(window, 'baEvent', eventEmitter)
Reflect.set(window, 'next', () => {
  eventBus.emit('characterDone')
  eventBus.emit('effectDone')
  eventBus.emit('next')
})
</script>

<template>
  <div style="display:flex;justify-content: center;">
    <BaStoryPlayer :story="prologue" data-url="https://yuuka.cdn.diyigemt.com/image/ba-all-data" :width="1000" :height="550"
      language="Cn" userName="testUser" :story-summary="storySummary" />
    <div style="position: absolute;left: 0;display: flex;flex-direction: column;">
      <label>辅助工具选择</label>
      <select v-model="toolType">
        <option value="emotion">人物特效测试</option>
        <option value="effect">特效层特效</option>
        <option value="null">无</option>
      </select>
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
}
</style>
