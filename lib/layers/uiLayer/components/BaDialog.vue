<script lang="ts" setup>
import { watch } from "vue";
import { onMounted, ref } from "vue";
import gsap from "gsap";

const props = defineProps({
  width: {
    type: String,
    default: "520px",
  },
  height: {
    type: String,
    default: "400px",
  },
  title: String,
  show: Boolean,
  showAnimation: Boolean, // 当对话框出现时是否展示动画
});

const emit = defineEmits<{
  (ev: "close", event: PointerEvent): void;
}>();

watch(
  () => props.show,
  (newValue) => {
    if (newValue === true) {
      gsap.from(".ba-dialog-container", {
        opacity: 0,
        y: 100,
        duration: 0.3,
        ease: "power1.out",
      });
    }
  }
);
</script>

<template>
  <div
    class="ba-dialog"
    :style="{ visibility: show === false ? 'hidden' : 'initial' }"
    @click.self="$emit('close', $event)"
  >
    <div
      class="ba-dialog-container"
      :style="{ width: props.width, height: props.height }"
    >
      <div class="ba-dialog-header">
        <h3 class="ba-dialog-title">
          <span>{{ title }}</span>
        </h3>
        <button
          class="ba-dialog-close button-nostyle"
          @click="$emit('close', $event)"
        >
          <i style="user-select: none">X</i>
        </button>
      </div>

      <div class="ba-dialog-content-wrapper">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ba-dialog {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(63, 63, 63, 0.4);

  .ba-dialog-container {
    display: flex;
    flex-flow: nowrap column;
    background-color: #f0f0f0;
    border-radius: 10px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
    box-shadow: rgb(56, 56, 56) 0 2px 2px 1px;

    .ba-dialog-header {
      position: relative;
      overflow: hidden;
      background: no-repeat center/contain
          linear-gradient(
            58deg,
            rgba(240, 240, 240, 0.1) 0%,
            rgba(240, 240, 240, 1) 38%,
            rgba(240, 240, 240, 1) 100%
          ),
        url(../assets/UITex_BGPoliLight_2.png) rgb(164 216 237);
      background-size: 100%;
      background-position: 0 30%;
      box-shadow: #d1d8da 0 1px 2px 0px;
      flex: 0 0 auto;

      .ba-dialog-title {
        margin: 8px 16px 0 8px;
        font-size: 25px;
        font-weight: bold;
        text-align: center;
        user-select: none;

        span {
          display: inline-block;
          &::after {
            content: "";
            display: block;
            width: 100%;
            height: 4px;
            background-color: #fbef62;
          }
        }
      }

      .ba-dialog-close {
        display: inline;
        background-color: initial;
        margin: 0;
        padding: 0;
        border: none;
        position: absolute;
        font-size: 25px;
        font-weight: bold;
        margin-right: 16px;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    .ba-dialog-content-wrapper {
      // 阴影效果
      margin-top: 2px;
      position: relative;
      flex: 1 1 auto;
      min-height: 0;

      background: no-repeat right bottom/contain
          linear-gradient(
            135deg,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 1) 67%,
            rgba(255, 255, 255, 0.85) 85%,
            rgba(255, 255, 255, 0) 100%
          ),
        repeat right -30% bottom/50% url(../assets/UITex_BGPoliLight_4.png) rgb(135, 196, 232);
    }
  }
}
</style>