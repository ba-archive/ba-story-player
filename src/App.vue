<script lang="ts" setup>
import BaStoryPlayer from '../lib/BaStoryPlayer.vue'
import yunka from './data/yunka.json'
</script>

<template>
  <BaStoryPlayer :story="yunka"/>
</template>