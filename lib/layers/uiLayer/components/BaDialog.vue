<script lang="ts" setup>
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
});
</script>

<template>
  <div class="ba-dialog">
    <div
      class="ba-dialog-container"
      :style="{ width: props.width, height: props.height }"
    >
      <div class="ba-dialog-header">
        <h3 class="ba-dialog-title">
          <span>{{ title }}</span>
        </h3>
        <i class="ba-dialog-close">X</i>
      </div>
      <slot></slot>
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
    background-color: #f0f0f0;
    border-radius: 16px;
    // border: solid 1px rgba(41, 41, 41, 0.464)
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
    box-shadow: rgb(56, 56, 56) 0 2px 2px 1px;

    .ba-dialog-header {
      position: relative;
      overflow: hidden;
      background: no-repeat center/contain linear-gradient(58deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,1) 38%, rgba(255,255,255,1) 100%), url(../assets/UITex_BGPoliLight_2.png) rgb(164 216 237);
      background-size: 100%;
      background-position: 0 30%;

      .ba-dialog-title {
        margin: 8px 16px;
        font-size: 25px;
        font-weight: bold;
        text-align: center;
        z-index: 1;

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
        position: absolute;
        font-size: 25px;
        margin-right: 16px;
        right: 0;
        top: 0;
      }
    }
  }
}
</style>
