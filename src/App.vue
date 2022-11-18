<script setup>
import BaStoryPlayer from '../lib/BaStoryPlayer.vue'
import yuuka from './data/yuuka.json'
import eventBus from '../lib/eventBus'

window.eventBus=eventBus
window.next=()=>{
  eventBus.emit('characterDone')
  eventBus.emit('effectDone')
  eventBus.emit('next')
}

</script>

<template>
  <BaStoryPlayer :story="yuuka" data-url="https://yuuka.cdn.diyigemt.com/image/ba-all-data"/>
</template>
