<script lang="ts" setup>
import { onMounted } from 'vue';
import { init } from '@/index';
import { StoryRawUnit, StoryUnit } from '@/types/common';
import { usePlayerStore } from '@/stores';
let { story ,dataUrl} = defineProps<{
  story: StoryRawUnit[]
  dataUrl:string
}>()




onMounted(() => { init('player', 550, 900,story,dataUrl)})
</script>

<template>
  <div id="player"></div>
</template>

<style>
#player {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>