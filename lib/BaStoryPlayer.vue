<script lang="ts" setup>
import { onMounted } from 'vue';
import { init } from '@/index';
import { StoryRawUnit, StoryUnit } from '@/types/common';
import { translate } from '@/layers/translationLayer';
import { usePlayerStore } from '@/stores';
import { storeToRefs } from 'pinia';
import mitt from 'mitt';
let { story } = defineProps<{
  story: StoryRawUnit[]
}>()

let playStore = usePlayerStore()
let { currentStoryUnit, allStoryUnit } = storeToRefs(playStore)
allStoryUnit.value = translate(story)



onMounted(() => { init('player', 550, 900) })
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