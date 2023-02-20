<script lang="ts" setup>
import { LogText } from "@/types/store";
import { PropType, ref } from "vue";

const props = defineProps({
  chatMessage: Object as PropType<LogText>,
});

const bubbleType = ref<"student" | "teacher" | "narration">("student");
switch (props.chatMessage?.type) {
  case "character":
    bubbleType.value = "student";
    break;
  case "user":
    bubbleType.value = "teacher";
    break;
  case "none":
    bubbleType.value = "narration";
    break;
  default:
    bubbleType.value = "student";
    break;
}
</script>

<template>
  <div :class="['ba-chat-message', bubbleType]">
    <img class="ba-chat-message-avatar" :src="props.chatMessage?.avatarUrl" draggable="false"/>
    <div class="ba-chat-message-bubble">
      <div class="ba-chat-message-bubble-name-bg">
        <div class="ba-chat-message-bubble-text-bg"></div>
        <div class="ba-chat-message-bubble-bg-arrow"></div>
      </div>
      <h4 class="ba-chat-message-name">{{ chatMessage?.name }}</h4>
      <p class="ba-chat-message-text">{{ chatMessage?.text }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ba-chat-message {
  position: relative;
  z-index: 0;
  display: flex;

  // 学生样式
  &.student > .ba-chat-message-bubble{
    color: #373737;
    filter: drop-shadow(#afb7ba 0 1px 2px);
    .ba-chat-message-bubble-name-bg {
      background-color: white;
      .ba-chat-message-bubble-text-bg {
        background: #f0f0f0;
      }
      .ba-chat-message-bubble-bg-arrow {
        border-width: 8px 10px 8px 0;
        border-color: transparent #f0f0f0 transparent transparent;
        transform: translate(calc(-100% + 2px), 2px);
      }
    }
  }
  // 老师样式
  &.teacher > .ba-chat-message-bubble {
    color: #fefefe;
    filter: drop-shadow(#2c3f4a 0 1px 2px);
    .ba-chat-message-bubble-name-bg {
      background-color: #426487;
      .ba-chat-message-bubble-text-bg {
        background-color: #334b65;
      }
      .ba-chat-message-bubble-bg-arrow {
        left: initial;
        right: -7px;
        border-width: 8px 0 8px 10px;
        border-color: transparent transparent transparent #334b65;
        transform: translate(1px, 1px);
      }
    }
  }
  // 旁白样式
  &.narration {
    filter: drop-shadow(#2c3f4a 0 1px 2px);
    .ba-chat-message-avatar {
      height: 0;
      width: 88px;
    }
    .ba-chat-message-bubble {
      margin: 8px 28px 4px 0;
      .ba-chat-message-bubble-name-bg {
        background-color: #426487;
        visibility: hidden;
        height: inherit;
        .ba-chat-message-bubble-text-bg {
          top: 0;
          visibility: visible;
          background-color: #334b65;
        }
        .ba-chat-message-bubble-bg-arrow {
          display: none;
        }
      }
      .ba-chat-message-name {
        display: none;
      }
      .ba-chat-message-text {
        color: #fefefe;
        font-weight: bold;
        
        min-height: 1em;
        text-align: center;
      }
    }
  }

  .ba-chat-message-avatar {
    height: 70px;
    width: 88px;
    margin: 16px 8px;
    object-fit: cover;
    border-radius: 16px;
    user-select: none;

    // 如果没有src则透明度设置为0
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
      z-index: -2;
      border-radius: 5px;

      .ba-chat-message-bubble-text-bg {
        position: absolute;
        top: 31.2px;
        left: 0;
        right: 0;
        bottom: 0;
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

      border-color: transparent #f5f5f5 transparent transparent;
      z-index: -3;
      top: 31.2px;
      left: 0;
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
