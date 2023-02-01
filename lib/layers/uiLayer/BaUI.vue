<script lang="ts" setup>
import BaButton from "@/layers/uiLayer/components/BaButton.vue";
import BaDialog from "./components/BaDialog.vue";
</script>

<template>
  <div class="baui">
    <div class="right-top">
      <div class="baui-button-group lean-rect">
        <BaButton>AUTO</BaButton>
        <BaButton>MENU</BaButton>
      </div>
      <div class="baui-menu-options lean-rect">
        <button class="button-nostyle ba-menu-option"><img src="./assets/pan-arrow.svg" /></button>
        <button class="button-nostyle ba-menu-option"><img src="./assets/menu.svg" /></button>
        <button class="button-nostyle ba-menu-option"><img src="./assets/fast-forward.svg" /></button>
      </div>
    </div>
    <BaDialog id="ba-story-summery" :title="'概要'" style="visibility: hidden;"> Hello, World </BaDialog>
  </div>
</template>

<style lang="scss" scoped>
.lean-rect {
  transform: skew(-10deg);
}

.button-nostyle {
    margin: 0;
    padding: 0;
    border: none;
}

.right-top {
  position: absolute;
  top: 0;
  right: 0;
  padding: 1.5%;
  user-select: none;
}

.baui {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;

  .baui-button-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 8px;
  }

  .baui-menu-options {
    display: grid;
    grid-gap: 8px;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 9px;
    padding: 12px 12px;
    border-radius: 6px;
    background-color: rgba(244, 244, 244, 0.6);
    overflow: hidden;

    .ba-menu-option {
      display: block;
      font-size: 24px;
      background-color: #2c4565;
      border-radius: 3px;
      padding: 4px 8px;

      img {
        display: block;
      }
    }
  }
}
</style>
