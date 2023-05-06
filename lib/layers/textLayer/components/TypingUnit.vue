<template>
  <span :data-sub="internalSubContent" class="unit" :style="effectCSS">{{
    internalContent
  }}</span>
</template>

<script setup lang="ts">
import { BaseTypingEvent, IEventHandlerMap } from "@/layers/textLayer/types";
import { parseTextEffectToCss } from "@/layers/textLayer/utils";
import TypingEmitter from "@/layers/textLayer/utils/typingEmitter";
import { Text } from "@/types/common";
import { Ref, computed, onMounted, onUnmounted, ref, nextTick } from "vue";

const props = withDefaults(defineProps<IProp>(), {
  index: -1,
  speed: 1000,
  text: () => ({
    content: "",
    effects: [],
  }),
  instant: false,
});
const propText = ref(props.text);
const currentContent = ref(propText.value.content);
const filterRuby = props.text.effects.filter(it => it.name === "ruby")[0] || {
  value: [],
};
const currentSubContent = ref(filterRuby.value.join(""));
const contentPointer = ref(-1);
const subContentPointer = ref(-1);
const effectCSS = parseTextEffectToCss(props.text.effects);

const contentHandler = ref(0);
const subContentHandler = ref(0);

let isTypingComplete = false;

const internalContent = computed(
  () => currentContent.value.substring(0, contentPointer.value) || ""
);
const internalSubContent = computed(
  () => currentSubContent.value.substring(0, subContentPointer.value) || ""
);

const contentTypingSpeed = [
  0,
  ...Array.from({ length: currentContent.value.length }).map(() => humanizer()),
];
const subContentTypingSpeed = [0];

if (currentSubContent.value) {
  const contentSpeedSum = contentTypingSpeed.reduce((a, b) => a + b);
  const average = contentSpeedSum / currentContent.value.length;
  subContentTypingSpeed.push(
    ...Array.from({ length: currentSubContent.value.length }).map(() =>
      humanizer(average)
    )
  );
}

function doTyping() {
  if (props.instant) {
    skipTyping();
    return;
  }
  if (!currentContent.value) {
    typingComplete();
    return;
  }
  doTyping0(contentPointer, currentContent, contentTypingSpeed, contentHandler);
  if (currentSubContent.value) {
    doTyping0(
      subContentPointer,
      currentSubContent,
      subContentTypingSpeed,
      subContentHandler,
      true
    );
  }
}

function doTyping0(
  pointer: Ref<number>,
  content: Ref<string>,
  speed: number[],
  handler: Ref<number>,
  skipComplete = false
) {
  if (pointer.value === content.value.length - 1 && !skipComplete) {
    typingComplete();
    return;
  }
  pointer.value = pointer.value + 1;
  handler.value = window.setTimeout(() => {
    doTyping0(pointer, content, speed, handler, skipComplete);
  }, speed[pointer.value]);
}

function humanizer(speed = props.speed) {
  return Math.round((Math.random() * speed) / 2) + speed;
}

function typingComplete() {
  isTypingComplete = true;
  TypingEmitter.emit("complete", props.index);
}

function skipTyping() {
  doClearInterval();
  contentPointer.value = currentContent.value.length;
  subContentPointer.value = currentSubContent.value.length;
  nextTick(() => {
    TypingEmitter.emit("complete", props.index);
  });
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const EventHandlerMap: IEventHandlerMap = {
  start: doTyping,
  skip: skipTyping,
};

function eventFilter(type: BaseTypingEvent, index?: number) {
  if (!index || index === props.index) {
    const fn = EventHandlerMap[type];
    if (fn) {
      fn();
    }
  }
}

onMounted(() => {
  TypingEmitter.on("*", eventFilter);
});

onUnmounted(() => {
  dispose();
});

function dispose() {
  TypingEmitter.off("*", eventFilter);
  doClearInterval();
}

function doClearInterval() {
  clearInterval(contentHandler.value);
  clearInterval(subContentHandler.value);
}

type IProp = {
  index: number;
  text: Text;
  speed?: number;
  instant?: boolean;
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
