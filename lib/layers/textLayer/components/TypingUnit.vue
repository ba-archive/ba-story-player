<template>
  <span class="unit" :style="effectCSS" :class="{ ruby: internalSubContent }"
    >{{ internalContent
    }}<span class="rt" v-if="internalSubContent">{{
      internalSubContent
    }}</span></span
  >
</template>

<script setup lang="ts">
import { BaseTypingEvent, IEventHandlerMap } from "@/layers/textLayer/types";
import { parseTextEffectToCss } from "@/layers/textLayer/utils";
import TypingEmitter from "@/layers/textLayer/utils/typingEmitter";
import { Text } from "@/types/common";
import { Ref, computed, nextTick, onMounted, onUnmounted, ref } from "vue";

const props = withDefaults(defineProps<IProp>(), {
  index: "-1",
  speed: 20,
  text: () => ({
    content: "",
    waitTime: 0,
    effects: [],
  }),
  instant: false,
  title: false,
});
const propText = ref(props.text);
const currentContent = ref(propText.value.content);
const filterRuby = props.text.effects.filter(it => it.name === "ruby")[0] || {
  value: [],
};
const currentSubContent = ref(filterRuby.value.join(""));
const contentPointer = ref(-1);
const subContentPointer = ref(-1);
const subPadding = ref(0);
const subContainTop = computed(() => (props.title ? "-0.45" : "-1.5"));
const effectCSS = computed(() => ({
  ...parseTextEffectToCss(props.text.effects),
  "--padding": subPadding.value,
  "--top-offset": subContainTop.value,
}));

if (props.instant) {
  contentPointer.value = currentContent.value.length;
  subContentPointer.value = currentSubContent.value.length;
}

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
  const average = (contentSpeedSum / currentSubContent.value.length) * (2 / 3); // 因为humanizer结果均值是1.5倍 所以缩回去
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
  setTimeout(() => {
    doTyping0(
      contentPointer,
      currentContent,
      contentTypingSpeed,
      contentHandler
    );
    if (currentSubContent.value) {
      doTyping0(
        subContentPointer,
        currentSubContent,
        subContentTypingSpeed,
        subContentHandler,
        true
      );
    }
  }, props.text.waitTime);
}

function doTyping0(
  pointer: Ref<number>,
  content: Ref<string>,
  speed: number[],
  handler: Ref<number>,
  skipComplete = false
) {
  if (pointer.value === content.value.length && !skipComplete) {
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

const EventHandlerMap: IEventHandlerMap = {
  start: doTyping,
  skip: skipTyping,
};

function eventFilter(type: BaseTypingEvent, index?: string) {
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
  index: string;
  text: Text;
  speed?: number;
  instant?: boolean;
  // 在title情况下(大字体)控制ruby的位置不要太过分
  title?: boolean;
};
</script>

<style scoped lang="scss">
.unit {
  position: relative;
  line-height: var(--font-size);
  height: var(--font-size);
  font-size: var(--font-size);
  .rt {
    position: absolute;
    --local-font-size: calc(var(--font-size) * 0.6);
    font-size: var(--local-font-size);
    top: calc(var(--local-font-size) * var(--top-offset));
    text-align: center;
    left: 50%;
    min-width: 100%;
    transform: translateX(-50%);
    line-height: 1;
  }
}
</style>
