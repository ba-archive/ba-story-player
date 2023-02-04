<script lang="ts" setup>
import { LogText } from "@/types/store";
import { PropType } from "vue";

const props = defineProps({
  chatMessage: Object as PropType<LogText>,
});
</script>

<template>
  <div class="ba-chat-message">
    <img class="ba-chat-message-avatar" :src="props.chatMessage?.avatarUrl" />
    <div class="ba-chat-message-bubble">
      <div class="ba-chat-message-bubble-name-bg">
        <div class="ba-chat-message-bubble-text-bg"></div>
        <div class="ba-chat-message-bubble-bg-arrow"></div>
      </div>
      <h4 class="ba-chat-message-name">{{ chatMessage?.name }}</h4>
      <!-- <div class="ba-chat-message-text-warpper"> -->
      <p class="ba-chat-message-text">{{ chatMessage?.text }}</p>
      <!-- </div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ba-chat-message {
  position: relative;
  z-index: 0;
  display: flex;
  .ba-chat-message-avatar {
    height: 70px;
    margin: 16px 8px;
    object-fit: cover;
    aspect-ratio: 91 / 72;
    border-radius: 16px;

    &[src=""],
    &:not([src]) {
      opacity: 0;
    }

    // 素材已经是斜着的图片了。这样实现会到时有两个角不是圆角
    -webkit-clip-path: polygon(14% 0, 100% 0%, 86% 100%, 0% 100%);
    clip-path: polygon(14% 0, 100% 0%, 86% 100%, 0% 100%);
  }
  .ba-chat-message-bubble {
    position: relative;
    margin: 8px 24px 4px 0;
    flex: 1;

    .ba-chat-message-bubble-name-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      transform: skewX(-10deg);
      background-color: white;
      z-index: -2;
      border-radius: 5px;

      .ba-chat-message-bubble-text-bg {
        position: absolute;
        top: 31.2px;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #f0f0f0;
        z-index: -1;
        border-radius: 5px;
      }
    }
    // 小箭头
    .ba-chat-message-bubble-bg-arrow {
      content: "";
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 8px 10px 8px 0;
      border-color: transparent #f5f5f5 transparent transparent;
      z-index: -3;
      top: 31.2px;
      left: 0;
      transform: translate(calc(-100% + 2px), 2px);
    }

    .ba-chat-message-name {
      min-height: 23.4px;
      margin: 4px 24px;
    }

    .ba-chat-message-text {
      font-size: 15px;
      margin: 8px 24px;
      min-height: 80px;
    }
  }
}
</style>
