<template>
  <div>
    <select v-model="effectType">
      <option>transition</option>
      <option>bgeffect</option>
      <option>other</option>
    </select>
    <div v-if="effectType === 'transition'" class="effect__specific">
      <label>transitionName</label>
      <input list="transitionNames" v-model="currentTransition" @input="updateTransitionItem" />
      <datalist id="transitionNames">
        <option v-for="name in transitionNames">{{ name }}</option>
      </datalist>
      <label>具体参数</label>
      <textarea :value="JSON.stringify(currentTransitionItem, null, 2)"
        @input="event => { currentTransitionItem = JSON.parse((event.target as HTMLTextAreaElement).value) }" />
    </div>
    <button @click="playEffect">播放特效</button>
  </div>
</template>

<script lang="ts" setup>
import eventBus from '@/eventBus';
import { usePlayerStore } from '@/stores/index';
import { wait } from '@/utils';
import { onMounted, ref } from 'vue';
import { resizeTextareas } from '../utils';

let effectType = ref<'transition' | 'bgeffect' | 'other'>('transition')
async function playEffect() {
  switch (effectType.value) {
    case 'transition':
      if (currentTransitionItem.value) {
        eventBus.emit('transitionIn', currentTransitionItem.value)
        await wait(currentTransitionItem.value.TransitionInDuration)
        eventBus.emit('transitionOut', currentTransitionItem.value)
      }
  }
}

let stores = usePlayerStore()
let transitionNames = Array.from(stores.TransitionExcelTable.keys())
let currentTransition = ref(0)
function updateTransitionItem() {
  let item = stores.TransitionExcelTable.get(Number(currentTransition.value))
  if (item) {
    currentTransitionItem.value = item
  }
}
let currentTransitionItem = ref(stores.TransitionExcelTable.get(transitionNames[0]))


onMounted(() => {
  resizeTextareas()
})
</script>

<style scoped>
div .effect__specific {
  display: flex;
  flex-direction: column;
}
</style>