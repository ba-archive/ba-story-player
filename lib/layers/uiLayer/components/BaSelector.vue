<script lang="ts" setup>
import { PropType, ref } from "vue";
import { ShowOption } from "@/types/events";
import eventBus from "@/eventBus";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

// 选项
// const selection = ref<ShowOption[]>([]);
const props = defineProps({
  selection: {
    type: Object as PropType<ShowOption[]>,
    default: [],
  },
});
const emit = defineEmits<{
  (ev: "select", value: number): void;
}>();

// 按钮按下效果
const selectionSelect = ref<number>(-1);

/**
 * 按钮按下特效
 * @param index 按钮位置
 */
function handleSelectMouseDown(ev: Event, index: number) {
  console.log("handleSelectMouseDown", ev)
  selectionSelect.value = index;
  gsap.to(ev.currentTarget, { duration: "0.15", scale: "0.9" });
}
/**
 * 按钮松开特效
 */
function handleSelectMouseUp(ev: Event) {
  console.log("handleSelectMouseUp", ev)
  selectionSelect.value = -1;
  gsap.to(ev.currentTarget, { duration: "0.3", scale: "1" });
}
/**
 * 选择支按钮被按下
 * @param select 选项
 */
function handleSelect(ev: Event, select: number) {
  emit("select", select);

  gsap.to(ev.currentTarget, {
    duration: 0.4,
    scale: 1.1,
    ease: CustomEase.create(
      "custom",
      "M0,0,C0.14,0,0.18,0.438,0.21,0.561,0.251,0.728,0.338,1.286,0.362,1.304,0.386,1.324,0.439,0.877,0.484,0.818,0.508,0.786,0.544,1.202,0.56,1.202,0.594,1.202,0.616,0.898,0.652,0.898,0.682,0.898,0.73,1.134,0.746,1.144,0.808,1.06,0.831,0.936,0.85,0.95,0.869,0.964,0.88,1.039,0.894,1.052,0.905,1.048,0.939,0.984,0.954,0.984,0.969,0.984,1,1,1,1"
    ),
  });
  gsap.to(ev.currentTarget, {
    duration: 0.4,
    ease: CustomEase.create(
      "custom",
      "M0,0,C0.14,0,0.324,0.092,0.348,0.11,0.392,0.142,0.469,0.403,0.514,0.344,0.538,0.312,0.566,0.028,0.582,0.028,0.616,0.028,0.636,0.47,0.672,0.47,0.702,0.47,0.744,0.062,0.76,0.072,0.792,0.027,0.79,0.428,0.808,0.564,0.823,0.686,0.874,0.122,0.874,0.122,0.888,0.122,0.895,0.621,0.916,0.66,0.925,0.678,0.949,0.133,0.954,0.138,0.965,0.134,0.974,0.556,0.974,0.556,0.974,0.556,1,1,1,1"
    ),
    opacity: 0,
  });

  setTimeout(() => {
    // 清空数组
    props.selection.length = 0;
  }, 388);
}
</script>

<template>
  <div class="ba-selector-container" v-if="selection.length !== 0">
    <div class="ba-selector">
      <div
        v-for="(e, index) in selection"
        @mousedown="handleSelectMouseDown($event, e.SelectionGroup)"
        :key="index"
        @click="handleSelect($event, e.SelectionGroup)"
        @mouseleave="handleSelectMouseUp($event)"
        @mouseup="handleSelectMouseUp($event)"
        role="button"
        tabindex="-1"
        class="ba-selector-list"
      >
        <div
          class="ba-selector-item"
          :class="{ actived: e.SelectionGroup === selectionSelect }"
        >
          {{ e.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ba-selector-container {
  position: absolute;
  width: 100%;
  height: 100%;
  user-select: none;
  .ba-selector {
    position: absolute;
    width: 100%;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    gap: 16px;
    flex-direction: column;
    max-width: 80%;
    .ba-selector-item {
      flex: 1;
      text-align: center;
      line-height: 2;
      font-size: 1.5rem;
      color: black;
      cursor: pointer;
      transition: width 0.1s, height 0.1s;
      position: relative;
      &:before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        transform: skewX(-10deg);
        border: 1px solid white;
        background: linear-gradient(
            58deg,
            rgba(240, 240, 240, 0.1) 0%,
            rgba(240, 240, 240, 1) 38%,
            rgba(240, 240, 240, 0.1) 100%
          ),
          url("../assets/UITex_BGPoliLight_1.png") rgb(164 216 237) no-repeat 0
            30%;
        z-index: -1;
      }

      &.actived {
        transform: scale(0.95);
      }
    }
  }
}
</style>
