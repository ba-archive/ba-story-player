<script lang="ts" setup>
import BaStoryPlayer from '../lib/BaStoryPlayer.vue'
import yunka from './data/yuuka.json'
</script>

<template>
  <BaStoryPlayer :story="yunka"/>
</template>
