<script lang="ts" setup>
import { onMounted } from 'vue';
import { init } from '.';

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