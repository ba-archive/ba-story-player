<script lang="ts" setup>
import BaChatMessage from "./BaChatMessage.vue";
import { usePlayerStore } from "@/stores";
import { Ref, ref, watch } from "vue";
import { checkBgOverlap } from "@/layers/translationLayer/utils";

const props = defineProps({
  show: Boolean,
});
const content = ref(null) as unknown as Ref<HTMLElement>;
let store = usePlayerStore();
let chatMesasages = store.logText;
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      setTimeout(() => {
        let elem = content.value;
        let currentScroll = elem.scrollTop 
        let clientHeight = elem.offsetHeight;
        let scrollHeight = elem.scrollHeight;
        elem.scrollTo(
          0,
          scrollHeight 
        );
      }, 300);
    }
  }
);
</script>

<template>
  <div class="ba-chat-log">
    <ul class="ba-chat-content" ref="content">
      <li class="ba-chat-item" v-for="(chatMessage, key) in chatMesasages" :key="key">
        <BaChatMessage :chat-message="chatMessage" />
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.ba-chat-log {
  --ba-chat-log: 8px;
  width: calc(100% - 2 * var(--ba-chat-log));
  height: calc(100% - 2 * var(--ba-chat-log));
  background-color: #d5d5d5; // 213
  margin: var(--ba-chat-log);
  border-radius: 0 0 7px 7px;
  overflow-y: hidden;
  position: relative;
  box-shadow: inset #bdc8d0 0 0px 2px 1px;

  background: no-repeat right bottom/contain linear-gradient(135deg,
      rgba(213, 213, 213, 1) 0%,
      rgba(213, 213, 213, 1) 67%,
      rgba(213, 213, 213, 0.85) 85%,
      rgba(213, 213, 213, 0) 100%),
    repeat right -30% bottom/50% url(../../assets/UITex_BGPoliLight_4.png) rgb(201, 232, 250);

  ul.ba-chat-content {
    // position: absolute;
    height: 100%;
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: scroll;

    // hide scrollbar
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
      /* Chrome Safari */
    }
  }
}
</style>
