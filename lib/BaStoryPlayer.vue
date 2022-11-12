<script lang="ts" setup>
import { onMounted } from 'vue';
import { init } from '@/index';
import { StoryRawUnit, StoryUnit } from '@/types/common';
import { translate } from '@/layers/translationLayer';
import { usePlayerStore } from '@/stores';
import { storeToRefs } from 'pinia';
let {story}=defineProps<{
    story:StoryRawUnit[]
}>()

let standardStory=translate(story)
let playStore=usePlayerStore()
let {currentStoryUnit}=storeToRefs(playStore)

//翻译层没有完成时可手动改设置播饭哪个剧情语句
currentStoryUnit.value=standardStory[0]

onMounted(()=>{init('player',550,900)})
</script>

<template>
    <div id="player"></div>
</template>

<style>
#player{
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>