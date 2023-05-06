<template>
  <div :style="effectCSS">
    <TypingUnit
      v-for="(e, index) in textList"
      :index="index"
      :key="index"
      :text="e"
      :instant="instant"
    />
  </div>
</template>

<script setup lang="ts">
import TypingUnit from "@/layers/textLayer/components/TypingUnit.vue";
import { BaseTypingEvent, IEventHandlerMap } from "@/layers/textLayer/types";
import { parseStEffectToCss } from "@/layers/textLayer/utils";
import TypingEmitter from "@/layers/textLayer/utils/typingEmitter";
import { StText } from "@/types/events";
import { computed, onMounted, onUnmounted } from "vue";

const props = withDefaults(defineProps<IProps>(), {
  index: -1,
  config: () => ({
    text: [],
    stArgs: [[0, 0], "instant", 0],
    middle: false,
  }),
});
const effectCSS = parseStEffectToCss(props.config);
const textList = computed(() => props.config.text);
const instant = computed(() => props.config.stArgs[1] !== "serial");

function doTyping() {}

function eventFilter(type: BaseTypingEvent, index?: number) {
  if (!index || index === props.index) {
    const fn = EventHandlerMap[type];
    if (fn) {
      fn();
    }
  }
}

function dispose() {
  TypingEmitter.off("*", eventFilter);
}

onMounted(() => {
  TypingEmitter.on("*", eventFilter);
});

onUnmounted(() => {
  dispose();
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const EventHandlerMap: IEventHandlerMap = {
  start: doTyping,
};

type IProps = {
  index: number;
  config: StText;
};
</script>

<style scoped lang="scss"></style>
