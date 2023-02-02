<script setup lang="ts">
import { PropType, Ref, ref } from "vue";
import gsap from "gsap";

const props = defineProps({
  bgcolor: String,
  size: String as PropType<"large" | "middle" | "small">,
});

function handleClick(ev: MouseEvent) {
  let tl = gsap.timeline();
  tl.to(ev.target, { duration: 0.15, scale: 0.92 , ease: "power3.out"});
  tl.to(ev.target, { duration: 0.3, scale: 1 });
}
</script>

<template>
  <button class="ba-button" @click="handleClick">
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
.ba-button {
  position: relative;
  padding: 6px 16px;
  border-radius: 5px;
  border: solid 1px rgb(133, 133, 133);
  font-size: 18px;
  font-weight: bold;
  color: #2c4565;
  background-color: #f3f5f6;

  .click-animation {
  }

  & polylight::after {
    position: absolute;
    top: 0;
    left: 0;
    content: "";
    width: 100%;
    height: 100%;
    background-color: rgb(67, 191, 222);
    background: url(../assets/UITex_BGPoliLight_3.png);
    background-size: 180%;
    background-position: 10% 10%;
    mask-image: linear-gradient(
      135deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0) 51%,
      rgba(255, 255, 255, 1) 100%
    );
    -webkit-mask-image: linear-gradient(
      135deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0) 51%,
      rgba(255, 255, 255, 1) 100%
    );
  }
}
</style>
