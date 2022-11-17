<script lang="ts" setup>
import { onMounted } from 'vue';
import { init } from '@/index';
import { StoryRawUnit, StoryUnit } from '@/types/common';
import { usePlayerStore } from '@/stores';
let { story } = defineProps<{
  story: StoryRawUnit[]
}>()

let playStore = usePlayerStore()



onMounted(() => { init('player', 550, 900,story)})
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