<script setup>
import BaStoryPlayer from '../lib/BaStoryPlayer.vue'
import yuuka from './data/yuuka.json'
import eventBus from '../lib/eventBus'
import {storyHandler,resourcesLoader} from '../lib/index'
import ModifyEmotionOption from './components/ModifyEmotionOption.vue';

window.eventBus = eventBus
window.next = () => {
  eventBus.emit('characterDone')
  eventBus.emit('effectDone')
  eventBus.emit('next')
}
window.baResource = resourcesLoader // 方便查看资源加载情况
window.baStory = storyHandler
console.log('资源加载: ', window.baResource)
console.log('资源调用: ', window.baStore)
console.log('剧情进度: ', storyHandler)

eventBus.on('*', (type, e) => {
  if(!(type==='l2dAnimationDone' && e.animation.startsWith('Idle_01') )) 
    console.log('事件类型', type, '值', e)
})

let storySummary = {
  chapterName: '章节名',
  summary: '总之就是总结'
}
</script>

<template>
  <div style="display:flex;justify-content: center;">
    <BaStoryPlayer :story="yuuka"
    data-url="https://yuuka.cdn.diyigemt.com/image/ba-all-data"
    :width="1000"
    :height="550"
    language="Cn"
    username="testUser"
    :story-summary="storySummary"
    />
    <!-- <ModifyEmotionOption /> -->
  </div>
</template>
