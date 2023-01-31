<template>
  <div class="container" @click="skipText" :style="{ height: `${playerHeight}px` }" @mouseup="selectionSelect = -1">
    <div class="container-inner">
      <div class="st-container" ref="stOutput" />
      <div class="title-container" :class="{ 'fade-in-out': titleContent }" v-if="titleContent"><div>{{ titleContent
        }}</div></div>
      <div class="place-container" :class="{ 'fade-in-out': placeContent }" v-if="placeContent"><div>{{ placeContent }}</div></div>
      <div class="select-container" v-if="selection.length !== 0">
        <div v-for="(e, index) in selection"
             class="select-item"
             @mousedown="handleSelectMousedown(e.SelectionGroup)"
             :class="{ 'select-item-active': e.SelectionGroup === selectionSelect }"
             :key="index"
             @click="handleSelect(e.SelectionGroup)"
             >{{ e.text }}</div>
      </div>
      <div v-if="showDialog" :style="{padding: `${fontSize(3)}rem ${fontSize(8)}rem`, height: `${playerHeight / 2}px`}"
           class="dialog" >
        <div class="title">
          <div :style="{fontSize: `${fontSize(3.5)}rem`}" class="name">{{ name }}&emsp;</div>
          <div :style="{fontSize: `${fontSize(2)}rem`}" class="department">{{nickName}}</div>
        </div>
        <hr>
        <div ref="typewriterOutput" :style="{fontSize: `${fontSize(2.5)}rem`}" class="content" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import {onMounted, ref, computed, Ref, nextTick, onUnmounted} from 'vue'
import eventBus from "@/eventBus";
import Typed, {TypedExtend, TypedOptions} from "typed.js";
import {ShowOption, ShowText, StText} from "@/types/events";
import {Text, TextEffectName} from "@/types/common";

const TypedOptions: TypedOptions = {
  typeSpeed: 20,
  showCursor: false,
  contentType: "html"
}
const typewriterOutput = ref();
const stOutput = ref();
// 外部传入播放器高度,用于动态计算字体等数值
const props = withDefaults(defineProps<IProps>(), {playerHeight: 0, playerWidth: 0});
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
// 在执行st特效时置为false以隐藏对话框
const showDialog = ref<boolean>(true);
let typingInstance: TypedExtend;
function skipText() {
  if (selection.value.length !== 0) return;
  // 显示st期间不允许跳过
  if (!showDialog) return;
  if (typingInstance.typingComplete) {
    eventBus.emit("next");
  } else {
    // 立即显示所有
    typingInstance.stop();
    typingInstance.destroy();
    typingInstance.typingComplete = true;
    typewriterOutput.value.innerHTML = typingInstance.strings.pop()
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
  eventBus.on('showText', handleShowTextEvent);
  eventBus.on('st', handleShowStEvent);
  eventBus.on('clearSt', handleClearSt);
  eventBus.on("option", handleOption);
});
onUnmounted(() => {
  eventBus.off("showTitle", handleShowTitle);
  eventBus.off("showPlace", handleShowPlace);
  eventBus.off('showText', handleShowTextEvent);
  eventBus.off('st', handleShowStEvent);
  eventBus.off('clearSt', handleClearSt);
  eventBus.off("option", handleOption);
})
function handleOption(e: ShowOption[]) {
  selection.value = e;
}
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
function handleClearSt() {
  // 清除上次输入
  // 显示st时dialog必定是隐藏的
  if (!showDialog.value) {
    typingInstance?.stop();
    typingInstance?.destroy();
  }
}
function handleShowStEvent(e: StText) {
  if (!e.stArgs || !Array.isArray(e.stArgs) || e.stArgs.length !== 3) {
    console.error("st特效参数不足", e);
    return;
  }
  // 显示st时隐藏对话框
  showDialog.value = false;
  nextTick(() => {
    const stPos = e.stArgs[0];
    const stType = e.stArgs[1];
    const x = Math.floor(((stWidth / 2) + stPos[0]) * stPositionBounds.value.width);
    const y = Math.floor(((stHeight / 2) - stPos[1]) * stPositionBounds.value.height);
    const extendPos = `position: absolute; left: ${x}px; top: ${y}px; width: auto`
    // const unused = e.stArgs[3];
    if (stType === "instant") {
      stOutput.value.innerHTML = parseTextEffect({
        content: e.text.map(text => parseTextEffect(text).content).join(""),
        effects: []
      }, extendPos, "div").content;
    } else if (stType === "serial") {
      showTextDialog(e.text.map(text => parseTextEffect(text)), stOutput.value, (content) => {
        return `<div style="${extendPos}">${content}</div>`
      });
      typingInstance.isSt = true;
    }
  })
}

function handleShowTextEvent(e: ShowText) {
  showDialog.value = true;
  nextTick(() => {
    // 设置昵称
    name.value = e.speaker?.name;
    // 设置次级标题
    nickName.value = e.speaker?.nickName;
    // 清除上次输入
    typingInstance?.stop();
    typingInstance?.destroy();
    typingInstance && (typingInstance.isSt = false);
    // 显示
    showTextDialog(e.text.map(text => parseTextEffect(text)), typewriterOutput.value);
    typingInstance.isSt = false;
  })
}

function parseTextEffect(text: Text, extendStyle = "", tag = "span"): Text {
  const effects = text.effects;
  // TODO parse value
  const rt = (effects.filter(effect => effect.name === "ruby")[0] || {value: []}).value.join("")
  const style = effects.filter(effect => effect.name !== "ruby").map(effect => {
    const value = effect.value.join("");
    const name = effect.name;
    if (name === "color") {
      return `color: ${value}`;
    } else if (name === "fontsize") {
      return `font-size: ${Math.floor(Number(Number(value) * fontSizeBounds.value))}px`
    }
    return (StyleEffectTemplate[effect.name] || "").replace("${value}", effect.value.join(""))
  }).join(";");
  if (rt) {
    text.content = `<ruby style="${style};${extendStyle}">${text.content}<rt>${rt}</rt><rp>烫</rp></ruby>`
  } else {
    text.content = `<${tag} style="${style};${extendStyle}">${text.content}</${tag}>`
  }
  return text;
}
function showTextDialog(text: Text[], output: HTMLElement, onParseContent?: (source: string) => string) {
  if (text.length === 0) return;
  function parseContent(content: string) {
    if (onParseContent) {
      return onParseContent(content);
    }
    return content;
  }
  let index = 1;
  let last = text[0].content;
  let firstContent = parseContent(text[0].content);
  let lastStOutput = "";
  // st的续约, 因为不能两个Typed同时持有一个对象,
  if (typingInstance && typingInstance.isSt) {
    lastStOutput = stOutput.value.innerHTML;
    typingInstance.typingComplete = false;
    typingInstance.pause.status = true;
    typingInstance.pause.typewrite = true;
    typingInstance.pause.curString = lastStOutput + firstContent;
    typingInstance.pause.curStrPos = lastStOutput.length;
    typingInstance.options.onComplete = function (self: TypedExtend) {
      if (index < text.length) {
        self.pause.status = true;
        self.pause.typewrite = true;
        const next = last + text[index].content;
        if (onParseContent) {
          const parse = lastStOutput + parseContent(next);
          self.pause.curString = parse;
          self.pause.curStrPos = parse.indexOf(last) + last.length;
        } else {
          self.pause.curStrPos = last.length;
          self.pause.curString = lastStOutput + next;
        }
        last = next;
        self.timeout = setTimeout(() => {
          self.typingComplete = false;
          self.start();
        }, text[index].waitTime || 0);
        index++;
      }
    }
    typingInstance.start();
  } else {
    // 全新清空
    output.innerHTML = "";
    typingInstance = new Typed(output, {
      ...TypedOptions,
      strings: [lastStOutput + firstContent],
      onComplete(self: TypedExtend) {
        if (index < text.length) {
          self.pause.status = true;
          self.pause.typewrite = true;
          const next = last + text[index].content;
          if (onParseContent) {
            const parse = lastStOutput + parseContent(next);
            self.pause.curString = parse;
            self.pause.curStrPos = parse.indexOf(last) + last.length;
          } else {
            self.pause.curStrPos = last.length;
            self.pause.curString = lastStOutput + next;
          }
          last = next;
          self.timeout = setTimeout(() => {
            self.typingComplete = false;
            self.start();
          }, text[index].waitTime || 0);
          index++;
        }
      }
    }) as TypedExtend;
  }
}

const fontSizeBounds = computed(() => (props.playerHeight / 1080));
const stWidth = 3000;
const stHeight = 1600;
const stPositionBounds = computed(() => ({ width: props.playerWidth / stWidth, height: props.playerHeight / stHeight }))
function fontSize(multi: number) {
  return fontSizeBounds.value * multi;
}
type StyleEffectTemplateMap = {
  [key in TextEffectName]: string
}
const StyleEffectTemplate: StyleEffectTemplateMap = {
  color: "color: ${value}",
  fontsize: "font-size: ${value}px",
  ruby: ''
}

interface IProps {
  playerHeight: number;
  playerWidth: number;
}

</script>

<style scoped lang="scss">
$border-radius: 3px;
$dialog-z-index: 3;
$place-z-index: 4;
$title-z-index: 5;
$select-z-index: 5;
$st-z-index: 5;
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
  z-index: $text-layer-z-index + $dialog-z-index;
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
    z-index: $text-layer-z-index + $select-z-index;
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
      transform: scale(0.8);
    }
  }
  .title-container {
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
    z-index: $text-layer-z-index + $title-z-index;
  }
  .place-container {
    position: absolute;
    left: 0;
    top: 10%;
    border-top-right-radius: $border-radius;
    border-bottom-right-radius: $border-radius;
    background-color: black;
    color: white;
    padding: 16px;
    z-index: $text-layer-z-index + $place-z-index;
  }
  .st-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: $text-layer-z-index + $st-z-index;
    color: white;
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
