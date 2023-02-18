<script lang="ts" setup>
import { computed, ref } from "vue";
import { ShowOption } from "@/types/events";
import eventBus from "@/eventBus";

// 选项
const selection = ref<ShowOption[]>([]);
// 按钮按下效果
const selectionSelect = ref<number>(-1);

/**
 * 按钮按下特效
 * @param index 按钮位置
 */
function handleSelectMousedown(index: number) {
  selectionSelect.value = index;
  eventBus.emit("playOtherSounds", "select");
}

/**
 * 选择支按钮被按下
 * @param select 选项
 */
function handleSelect(select: number) {
  eventBus.emit("select", select);
  setTimeout(() => {
    selection.value = [];
  }, 100);
}

// register events
eventBus.on("option", (e) => (selection.value = e));
</script>

<template>
  <div
    class="ba-selector"
    v-if="selection.length !== 0"
  >
    <div
      v-for="(e, index) in selection"
      @mousedown="handleSelectMousedown(e.SelectionGroup)"
      :key="index"
      @click="handleSelect(e.SelectionGroup)"
      @mouseout="selectionSelect = -1"
      @mouseup="selectionSelect = -1"
      role="button"
      :tabindex="index"
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
</template>

<style lang="scss" scoped>
.ba-selector {
  width: 100%;
  position: absolute;
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
        url("../assets/UITex_BGPoliLight_1.png") rgb(164 216 237) no-repeat 0 30%;
      z-index: -1;
    }

    &.actived {
      transform: scale(0.95);
    }
  }
}
</style>
