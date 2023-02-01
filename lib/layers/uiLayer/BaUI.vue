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
        <img class="ba-menu-option hidden-ui" src="./assets/pan-arrow.svg" />
        <img class="ba-menu-option chat-log" src="./assets/menu.svg" />
        <img class="ba-menu-option skip-chat" src="./assets/fast-forward.svg" />
      </div>
    </div>
    <BaDialog id="ba-story-summery" :title="'概要'" style="visibility: hidden;"> Hello, World </BaDialog>
  </div>
</template>

<style lang="scss" scoped>
.lean-rect {
  transform: skew(-10deg);
}

.right-top {
  position: absolute;
  top: 0;
  right: 0;
  padding: 1.5%;
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
    border-radius: 4px;
    background-color: rgba(244, 244, 244, 0.6);

    img.ba-menu-option {
      display: block;
      font-size: 24px;
      background-color: #2c4565;
      border-radius: 3px;
      padding: 4px 8px;

      & hidden-ui {
        background-color: red;
      }

      & hidden-ui {
        background-color: blue;
      }

      & hidden-ui {
        background-color: yellow;
      }
    }
  }
}
</style>
