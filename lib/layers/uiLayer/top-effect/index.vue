<template>
  <div id="top_effect" @mousedown="trigger" @touchstart="trigger"></div>
</template>

<script lang="ts" setup>
import { Application } from "pixi.js";
import { clickEffect } from "./click-effect";
let props = defineProps<{
  height: number;
  width: number;
}>();
const topEffectApp = new Application({
  height: props.height,
  width: props.width,
  antialias: true,
  autoDensity: true,
  resolution: 2,
  backgroundAlpha: 0
});
setTimeout(() => {
  document.querySelector(`#top_effect`)?.appendChild(topEffectApp.view);
  (globalThis as any).__PIXI_APP__ = topEffectApp
}, 4);

const trigger = (e: MouseEvent | TouchEvent) => {
  let x = 0,
    y = 0;
  if (e instanceof MouseEvent) {
    x = e.offsetX;
    y = e.offsetY;
  }
  if (e instanceof TouchEvent) {
    var rect = (e.target as any).getBoundingClientRect();
    x = e.targetTouches[0].pageX - rect.left;
    y = e.targetTouches[0].pageY - rect.top;
  }
  clickEffect(topEffectApp, x, y);
};
</script>
<style lang="scss" scoped>
#top_effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
