<template>
  <span :data-sub="internalSubContent" class="unit">{{ internalContent }}</span>
</template>

<script setup lang="ts">
import emitter from "@/layers/textLayer/event";
import { Ref, onMounted, onUnmounted, ref } from "vue";

const props = withDefaults(defineProps<IProp>(), {
  index: -1,
  speed: 30,
  content: "",
  subContent: "",
});
const internalContent = ref("");
const internalSubContent = ref("");
let contentHandler = ref(0);
let subContentHandler = ref(0);
let isTypingComplete = false;

function doTyping() {
  if (!props.content) {
    typingComplete();
    return;
  }
  const content = props.content.split("");
  const subContent = props.subContent.split("");
  const contentSpeed = [0, ...content.map(() => humanizer())];
  const contentSpeedSum = contentSpeed.reduce((a, b) => a + b);
  const subContentSpeed = [
    0,
    ...content.map(() => humanizer(contentSpeedSum / subContent.length)),
  ];
  console.log(contentSpeed, subContentSpeed);
  internalContent.value = "";
  internalSubContent.value = "";
  doTyping0(internalContent, content, contentSpeed, contentHandler);
  doTyping0(internalSubContent, subContent, subContentSpeed, subContentHandler);
}

function doTyping0(
  proxy: Ref<string>,
  content: string[],
  speed: number[],
  handler: Ref<number>
) {
  if (!content.length) {
    typingComplete();
    return;
  }
  const ch = content.shift();
  const timeout = speed.shift();
  handler.value = window.setTimeout(() => {
    proxy.value = proxy.value + ch;
    doTyping0(proxy, content, speed, handler);
  }, timeout);
}

function onStartTyping(target: number) {
  if (target === props.index) {
    doTyping();
  }
}

function humanizer(speed = props.speed) {
  return Math.round((Math.random() * speed) / 2) + speed;
}

function typingComplete() {
  if (!isTypingComplete) {
    isTypingComplete = true;
    return;
  }
  emitter.emit("complete", props.index);
}

onMounted(() => {
  emitter.on("start", onStartTyping);
});

onUnmounted(() => {
  emitter.off("start", onStartTyping);
});

type IProp = {
  index: number;
  speed?: number;
  content: string;
  subContent: string;
};
</script>

<style scoped lang="scss">
.unit {
  position: relative;
  &:before {
    content: attr(data-sub);
    position: absolute;
    left: 0;
    --local-font-size: calc(var(--font-size) * 0.6);
    font-size: var(--local-font-size);
    top: calc(var(--local-font-size) * -1.5);
  }
}
</style>
