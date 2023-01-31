<template>
  <div class="tester">
    <select v-model="effectType" @change="() => { $nextTick(resizeTextareas) }">
      <option>transition</option>
      <option>bgeffect</option>
      <option>other</option>
    </select>
    <div v-if="effectType === 'transition'">
      <label>transitionName</label>
      <input list="transitionNames" v-model="currentTransition" @input="updateTransitionItem" />
      <datalist id="transitionNames">
        <option v-for="name in transitionNames">{{ name }}</option>
      </datalist>
      <label>具体参数</label>
      <textarea :value="JSON.stringify(currentTransitionItem, null, 2)"
        @input="event => { currentTransitionItem = JSON.parse((event.target as HTMLTextAreaElement).value) }" />
    </div>
    <div v-if="effectType === 'bgeffect'">
      <label>effectType</label>
      <select v-model="currentBGEffectType" @change="effectTypeChange">
        <option v-for="effect in Object.keys(effectNamesTable)">{{ effect }}</option>
      </select>
      <label>bgEffect name</label>
      <select v-model="currentBGEffect" @change="updateBGEffectItem">
        <option v-for="name in currentBGEffectNames">{{ name }}</option>
      </select>
      <textarea :value="JSON.stringify(currentBGEffectItem, null, 2)"
        @input="event => { currentBGEffectItem = JSON.parse((event.target as HTMLTextAreaElement).value) }" />
      <label>option(该参数仅当前起效)</label>
      <textarea :value="JSON.stringify(bgEffectHandlerOptions[currentBGEffectType], null, 2)"
        @input="event => { bgEffectHandlerOptions[currentBGEffectType] = JSON.parse((event.target as HTMLTextAreaElement).value) }" />
    </div>
    <button @click="playEffect">播放特效</button>
    <button @click="removeEffect">移除特效</button>
  </div>
</template>

<script lang="ts" setup>
import eventBus from '@/eventBus';
import { usePlayerStore } from '@/stores/index';
import { wait } from '@/utils';
import { computed, onMounted, ref, watch } from 'vue';
import { resizeTextareas } from '../utils';
import { resourcesLoader } from '@/index'
import { removeEffect } from '@/layers/effectLayer'
import { bgEffectHandlerOptions } from '@/layers/effectLayer/bgEffectHandlers'
import { BGEffectType } from '@/types/excels';

await resourcesLoader.loadExcels()
let effectType = ref<'transition' | 'bgeffect' | 'other'>('transition')
async function playEffect() {
  switch (effectType.value) {
    case 'transition':
      if (currentTransitionItem.value) {
        eventBus.emit('transitionIn', currentTransitionItem.value)
        await wait(currentTransitionItem.value.TransitionInDuration)
        eventBus.emit('transitionOut', currentTransitionItem.value)
      }
      break
    case 'bgeffect':
      if (currentBGEffectItem.value) {
        eventBus.emit('playEffect', {
          BGEffect: currentBGEffectItem.value,
          otherEffect: []
        })
      }
  }
}
let stores = usePlayerStore()

//transition
let transitionNames = Array.from(stores.TransitionExcelTable.keys())
let currentTransition = ref(0)
function updateTransitionItem() {
  let item = stores.TransitionExcelTable.get(Number(currentTransition.value))
  if (item) {
    currentTransitionItem.value = item
  }
}
let currentTransitionItem = ref(stores.TransitionExcelTable.get(transitionNames[0]))


//bgEffect
let effectNamesTable: Record<string, number[]> = {}
for (let [key, item] of stores.BGEffectExcelTable.entries()) {
  if (Reflect.get(effectNamesTable, item.Effect)) {
    effectNamesTable[item.Effect].push(key)
  }
  else {
    effectNamesTable[item.Effect] = [key]
  }
}
let currentBGEffect = ref(0)
let currentBGEffectType = ref<BGEffectType>('BG_Rain_L')
let currentBGEffectItem = ref(stores.BGEffectExcelTable.get(effectNamesTable['BG_Rain_L'][0]))
let currentBGEffectNames = computed(() => {
  if (effectNamesTable[currentBGEffectType.value]) {
    return effectNamesTable[currentBGEffectType.value]
  }
  else {
    return []
  }
})
function updateBGEffectItem() {
  let item = stores.BGEffectExcelTable.get(Number(currentBGEffect.value))
  if (item) {
    currentBGEffectItem.value = item
    currentBGEffectType.value = item.Effect
  }
}
function effectTypeChange() {
  currentBGEffect.value = currentBGEffectNames.value[0]
  updateBGEffectItem()
}

//缓存值以便刷新后正常使用
let cache = {
  effectType,
  currentBGEffect,
  currentTransition,
}
let cacheKey = 'effectCache'
watch(Object.values(cache), () => {
  let tempCache: any = {}
  for (let key of Object.keys(cache) as Array<keyof typeof cache>) {
    Reflect.set(tempCache, key, cache[key].value)
  }
  localStorage.setItem(cacheKey, JSON.stringify(tempCache))
})
if (localStorage.getItem(cacheKey)) {
  let tempCache = JSON.parse(localStorage.getItem(cacheKey)!)
  for (let key of Object.keys(cache) as Array<keyof typeof cache>) {
    if (typeof cache[key].value === 'number') {
      cache[key].value = Number(tempCache[key])
    }
    else {
      cache[key].value = tempCache[key]
    }
  }
  updateBGEffectItem()
}

onMounted(() => {
  resizeTextareas()
})
</script>

<style scoped>
.tester>div {
  display: flex;
  flex-direction: column;
}
</style>