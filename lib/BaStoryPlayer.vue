<script lang="ts" setup>
import { onMounted } from 'vue';
import { init } from '@/index';
import { StoryRawUnit  } from '@/types/common';
let { story, dataUrl, height, width } = defineProps<{
  story: StoryRawUnit[]
  dataUrl: string
  height: number
  width: number
}>()

onMounted(() => { init('player__main', height, width, story, dataUrl) })
</script>

<template>
  <div id="player" :style="{height:`${height}px`}">
    <div id="player__main"></div>
  </div>
</template>

<style>
#player{
  background-color: red;
}
</style>