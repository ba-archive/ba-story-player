<script setup lang="ts">
import eventBus from "@/eventBus";
import { onMounted, PropType, Ref, ref } from "vue";
import { buttonAnimation } from "../utils";

const props = defineProps({
  bgcolor: String,
  size: {
    type: String as PropType<"large" | "middle" | "small">,
    default: "small",
  },
});
const emit = defineEmits<{
  (ev: "click", event: Event): void;
}>()

const button = ref(null) as unknown as Ref<Element>

function handleClick(ev: Event) {
  emit("click", ev)
  eventBus.emit("playOtherSounds", "select")
}

onMounted(()=>{
  buttonAnimation({elem: button.value})
})




</script>

<template>
  <button :class="['ba-button', size]" ref="button" @click="handleClick" tabindex="-1">
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
.ba-button {
  position: relative;
  padding: 0.375rem 1rem;
  margin: 0.125rem 0.4rem 0 0.4rem;
  border-radius: 0.3125rem;
  border: none;
  font-size: 1.125rem;
  font-weight: bold;
  color: #2d4665;
  background-color: #f3f5f6;
  transform: skew(-10deg);
  box-shadow: #2c3f4a 0 1px 2px;
  transition: background-color .3s;

  &.large {
    padding: 0.5rem 4.25rem;
    font-size: 1.5625rem;
    border-radius: 0.625rem;
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
