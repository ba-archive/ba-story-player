<script setup lang="ts">
import { PropType, Ref, ref } from "vue";

const props = defineProps({
  style: String as PropType<"primary" | "activate">,
  size: String as PropType<"large" | "middle" | "small">,
});
</script>

<template>
  <button class="ba-button">
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

  background-color: rgb(67, 191, 222);
  &::after {
    position: absolute;
    top: 0;
    left: 0;
    content: "";
    width: 100%;
    height: 100%;
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
