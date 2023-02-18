<script setup lang="ts">
import { getCurrentInstance, onMounted, PropType, Ref, ref } from "vue";
import gsap from "gsap";

const props = defineProps({
  bgcolor: String,
  size: {
    type: String as PropType<"large" | "middle" | "small">,
    default: "small",
  },
});

function effectBtnMouseDown(ev: MouseEvent) {
  gsap.to(ev.currentTarget, { duration: 0.15, scale: 0.94, ease: "power3.out" });
}

function effectBtnMouseUp(ev: MouseEvent) {
  gsap.to(ev.currentTarget, { duration: 0.3, scale: 1 });
}

const button = ref(null);
onMounted(()=>{

})

</script>

<template>
  <button :class="['ba-button', size]" @mousedown="effectBtnMouseDown" @mouseup="effectBtnMouseUp" @mouseleave="effectBtnMouseUp">
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
.ba-button {
  position: relative;
  padding: 6px 16px;
  border-radius: 5px;
  //   border:  solid 1px rgb(133, 133, 133);
  border: none;
  font-size: 18px;
  font-weight: bold;
  color: #2d4665;
  background-color: #f3f5f6;
  transform: skew(-10deg);
  box-shadow: #2c3f4a 0 1px 2px;
  transition: background-color .3s;

  &.large {
    padding: 8px 68px;
    font-size: 25px;
    border-radius: 10px;
  }

  &.polylight {
    background: no-repeat center/contain
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(227, 247, 255, 0.9) 20%,
          rgba(227, 247, 255, 0.9) 60%,
          rgba(255, 255, 255, 0) 100%
        ),
      url(../assets/UITex_BGPoliLight_4.png) rgb(128, 208, 255);
  }
  &.polydark {
    background: no-repeat center/contain
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0) 0%,
          rgb(117, 218, 248, 0.9) 20%,
          rgba(117, 218, 248, 0.9) 60%,
          rgba(255, 255, 255, 0) 100%
        ),
      url(../assets/UITex_BGPoliLight_4.png) rgb(106, 224, 251);
  }

  &[class*="poly"] {
    background-size: 140%;
    background-position: -15px 72%;
    box-shadow: #98C0D7 0 1px 2px;
  }
}
</style>
