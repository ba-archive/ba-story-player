<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import eventBus from '../../lib/eventBus'
import emotionOptions from '../../lib/layers/characterLayer/emotionOptions'
import actionOptions from '../../lib/layers/characterLayer/actionOptions'

let effectType = ref<'action' | 'emotion'>('emotion')
let current = ref('Music')
let selectCache: { effectType: 'action' | 'emotion', current: string }
if (localStorage.getItem('selectCache')) {
  selectCache = JSON.parse(localStorage.getItem('selectCache')!)
  effectType.value = selectCache['effectType']
  current.value = selectCache['current']
}
else {
  selectCache = {
    effectType: effectType.value,
    current: current.value
  }
  localStorage.setItem('selectCache', JSON.stringify(selectCache))
}

let currentOptions = computed(() => {
  if (effectType.value == 'emotion') {
    if (current.value in emotionOptions) {
      return emotionOptions[current.value]
    }
    else {
      return {}
    }
  }
  else {
    if (current.value in actionOptions) {
      return actionOptions[current.value]
    }
    else {
      return {}
    }
  }
})

function showCharacter() {
  eventBus.emit('showCharacter', {
    characters: [
      {
        CharacterName: 4179367264,
        face: '05',
        position: 3,
        highlight: true,
        effects: [
          {
            type: 'action',
            effect: 'a',
            async: false
          }
        ]
      }
    ]
  })

}

function playEffect() {
  eventBus.emit('showCharacter', {
    characters: [
      {
        /**
         * 注意如果不是体香1剧情需要更改
         */
        CharacterName: 4179367264,
        face: '05',
        position: 3,
        highlight: true,
        effects: [
          {
            type: effectType.value,
            effect: current.value,
            async: false
          }
        ]
      }
    ]
  })
}

function changeOption(option: string, value: any) {
  Reflect.set(currentOptions.value[option], 'value', value)
}

function outputOptions() {
  navigator.clipboard.writeText(JSON.stringify(currentOptions.value, null, 2))
}

function resizeTextareas() {
  let textAreas = document.querySelectorAll('textarea')
  for (let textarea of textAreas) {
    textarea.style.height = textarea.scrollHeight + "px";
  }
}

function updateType() {
  nextTick(() => { resizeTextareas() })

  localStorage.setItem('selectCache', JSON.stringify({
    effectType: effectType.value,
    current: current.value
  }))
}

onMounted(() => {
  resizeTextareas()
})
</script>

<template>
  <div class="absolute-right-center">
    <select v-model="effectType" @change="updateType">
      <option>emotion</option>
      <option>action</option>
    </select>
    <select v-model="current" @change="updateType">
      <option v-if="effectType == 'emotion'" v-for="emotion in Object.keys(emotionOptions)">{{ emotion }}</option>
      <option v-else="effectType=='action'" v-for="action in Object.keys(actionOptions)">{{ action }}</option>
    </select>
    <div v-for="option in Object.keys(currentOptions)">
      <div v-if="typeof currentOptions[option].value === 'string'">
        <p :title="currentOptions[option].description">{{ option }}</p>
        <input :value="currentOptions[option].value"
          @input="(event) => changeOption(option, (event.target as HTMLInputElement).value)" />
      </div>
      <div v-else-if="typeof currentOptions[option].value === 'number'">
        <p :title="currentOptions[option].description">{{ option }}</p>
        <input type="number" step="0.01" :value="currentOptions[option].value"
          @input="(event) => changeOption(option, Number((event.target as HTMLInputElement).value))" />
      </div>
      <div v-else-if="typeof currentOptions[option].value === 'object'">
        <p :title="currentOptions[option].description">{{ option }}</p>
        <textarea :value="JSON.stringify(currentOptions[option].value, null, 2)"
          @input="(event) => changeOption(option, JSON.parse((event.target as HTMLInputElement).value))" />
      </div>
    </div>
    <button @click="showCharacter">显示人物(显示后再播放特效)</button>
    <button @click="playEffect">播放人物特效</button>
    <button @click="outputOptions">复制参数(可填入参数文件)</button>
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
