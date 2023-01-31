<script setup>
import BaStoryPlayer from '../lib/BaStoryPlayer.vue'
import yuuka from './data/yuuka.json'
import eventBus from '../lib/eventBus'
import ModifyEmotionOption from './components/ModifyEmotionOption.vue';

window.eventBus = eventBus
window.next = () => {
  eventBus.emit('characterDone')
  eventBus.emit('effectDone')
  eventBus.emit('next')
}
let storySummary = {
  chapterName: '章节名',
  summary: '总之就是总结'
}
</script>

<template>
  <div style="display:flex;justify-content: center;">
    <BaStoryPlayer :story="yuuka" data-url="https://yuuka.diyigemt.com/image/ba-all-data" :width="1000" :height="550"
      language="Cn" username="testUser" :story-summary="storySummary" />
    <!-- <ModifyEmotionOption /> -->
  </div>
</template>
