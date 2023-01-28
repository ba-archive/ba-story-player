<template>
  <div class="container" @click="skipText" :style="{ height: `${playerHeight}px` }" @mouseup="selectionSelect = -1">
    <div class="container-inner">
      <div class="titleContainer" :class="{ 'fade-in-out': titleContent }" v-if="titleContent"><div>{{ titleContent }}</div></div>
      <div class="placeContainer" :class="{ 'fade-in-out': placeContent }" v-if="placeContent"><div>{{ placeContent }}</div></div>
      <div class="select-container" v-if="selection.length !== 0">
        <div v-for="(e, index) in selection"
             class="select-item"
             @mousedown="handleSelectMousedown(e.SelectionGroup)"
             :class="{ 'select-item-active': e.SelectionGroup === selectionSelect }"
             :key="index"
             @click="handleSelect(e.SelectionGroup)"
             >{{ e.text }}</div>
      </div>
      <div :style="{padding: `${fontSize(3)}rem ${fontSize(8)}rem`, height: `${playerHeight / 2}px`}" class="dialog" >
        <div class="title">
          <div :style="{fontSize: `${fontSize(3.5)}rem`}" class="name">{{name}}</div>
          <div :style="{fontSize: `${fontSize(2)}rem`}" class="department">{{nickName}}</div>
        </div>
        <hr>
        <div :style="{fontSize: `${fontSize(2.5)}rem`}" class="content">{{ obj.output }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import {reactive, onMounted, ref, computed, Ref} from 'vue'
import EasyTyper from 'easy-typer-js'
import eventBus from "@/eventBus";
import {ShowOption, ShowText} from "@/types/events";
import {Text} from "@/types/common";


// 计算属性
const obj = reactive({
  // 忽略
  output: '',
  // 忽略
  isEnd: false,
  // 打字间隔
  speed: 20,
  // 关闭否则会消除之前的字体
  singleBack: false,
  // 忽略
  sleep: 0,
  // 固定
  type: 'normal',
  // 忽略
  backSpeed: 40,
  // 忽略
  sentencePause: false
})

// 外部传入播放器高度,用于动态计算字体等数值
const props = withDefaults(defineProps<IProps>(), {playerHeight: 0});
// 选项
const selection = ref<ShowOption[]>([]);
// 按钮按下效果
const selectionSelect = ref<number>(-1);
// 标题
const titleContent = ref<string>("");
// 位置
const placeContent = ref<string>("");
// 昵称
const name = ref<string>();
// 次级标题(昵称右边)
const nickName = ref<string>();
let typingInstance: EasyTyper | null;
// 最后一次typing的内容 为啥要缓存呢, 因为这个库没有(
let lastText = new Proxy({ value: "" }, {
  get(target: { value: string }, p: string | symbol): any {
    if (p === "value") {
      const cache = target.value;
      target.value = "";
      return cache;
    } else {
      return Reflect.get(target, p);
    }
  }
});

function skipText() {
  if (!typingInstance) return;
  if (selection.value.length !== 0) return;
  if (obj.isEnd) {
    eventBus.emit("next");
  } else {
    // 立即显示所有
    typingInstance.closeTimer();
    typingInstance.close();
    obj.output = lastText.value;
  }
}

function handleSelectMousedown(index: number) {
  selectionSelect.value = index;
  //TODO 声音层在天上飞
  // eventBus.emit("playSelectSound");
}

function handleSelect(select: number) {
  eventBus.emit("select", select);
  selection.value = [];
}

onMounted(() => {
  eventBus.on("showTitle", handleShowTitle);
  eventBus.on("showPlace", handleShowPlace);
  // 监听showText事件
  eventBus.on('showText', handleShowTextEvent);
  eventBus.on("option", (e) => { selection.value = e });
});

function handleShowTitle(e: string) {
  proxyShowCoverTitle(titleContent, e)
}

function handleShowPlace(e: string) {
  proxyShowCoverTitle(placeContent, e)
}

function proxyShowCoverTitle(proxy: Ref<string>, value: string) {
  proxy.value = value;
  setTimeout(() => {
    proxy.value = "";
  }, 3000)
}

async function handleShowTextEvent(e: ShowText) {
  // 设置昵称
  name.value = e.speaker?.name;
  // 设置次级标题
  nickName.value = e.speaker?.nickName;
  for (const text of e.text) {
    await showTextDialog(text);
  }
}

function showTextDialog(text: Text): Promise<void> {
  return new Promise((resolve) => {
    obj.output = "";
    obj.isEnd = false;
    if (text.waitTime) {
      setTimeout(() => {
        typingInstance = new EasyTyper(obj, text.content, () => { resolve(); typingInstance?.close() }, () => {});
      }, text.waitTime);
    } else {
      typingInstance = new EasyTyper(obj, text.content, () => { resolve(); typingInstance?.close() }, () => {});
    }
    lastText.value = text.content;
  });
}

const fontSizeBounds = computed(() => (props.playerHeight / 1080));
function fontSize(multi: number) {
  return fontSizeBounds.value * multi;
}

interface IProps {
  playerHeight: number;
}

</script>

<style scoped lang="scss">
$border-radius: 3px;
.name{
  font-family: 'TJL',serif;
  font-size: 3.5rem;
  color : white;
  align-self: flex-end;
}

.department{
  font-family: 'TJL',serif;
  margin-left: 2rem;
  font-size: 2.5rem;
  color : rgb(156,218,240);
}

.title{
  display: flex;
  align-items: flex-end;
  margin-top: 2rem;
}

.dialog{
  width: 100%;
  padding: 3rem 8rem;
  box-sizing: border-box;
  background-image: linear-gradient(to bottom , rgba(255,0,0,0) , rgba(19,32,45,0.9) 30%);
  position: absolute;
  bottom: 0;
}

.content{
  margin-top: 1.5rem;
  font-family: 'TJL',serif;
  color : white;
  font-size: 2.5rem;
}
.container {
  position: absolute;
  user-select: none;
  .container-inner {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .select-container {
    width: 100%;
    position: absolute;
    top: 35%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    gap: 16px;
    flex-direction: column;
    max-width: 80%;
    .select-item {
      flex: 1;
      text-align: center;
      background-color: rgba(255, 255, 255, .3);
      line-height: 2;
      font-size: 1.5rem;
      border-radius: $border-radius;
      color: black;
      cursor: pointer;
      transition: width 0.3s, height 0.3s;
    }
    .select-item-active {
      transform: scale(0.5);
    }
  }
  .titleContainer {
    width: 100%;
    height: 100%;
    text-align: center;
    line-height: 1;
    position: absolute;
    top: 0;
    left: 0;
    font-size: 2rem;
    background-color: black;
    opacity: 0;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }
  .placeContainer {
    position: absolute;
    left: 0;
    top: 10%;
    border-top-right-radius: $border-radius;
    border-bottom-right-radius: $border-radius;
    background-color: black;
    color: white;
    padding: 16px;
  }
  .fade-in-out {
    animation: fade-in-out 3s;
  }
}
@keyframes fade-in-out {
  0% {
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>