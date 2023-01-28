<template>
  <div :style="{padding: `${3 * props.dialogHeight / 1080}rem ${8 * props.dialogHeight / 1080}rem`}" class="dialog" @click="skipText">
    <div class="title">
      <div :style="{fontSize: `${3.5 * props.dialogHeight / 1080}rem`}"  class="name">{{name}}</div>
      <div :style="{fontSize: `${2 * props.dialogHeight / 1080}rem`}" class="department">{{nickName}}</div>
    </div>
    <hr>
    <div :style="{fontSize: `${2.5 * props.dialogHeight / 1080}rem`}" class="content">{{ obj.output }}</div>

  </div>

</template>

<script setup lang="ts">

import {reactive, onMounted, ref} from 'vue'
import EasyTyper from 'easy-typer-js'
import eventBus from "@/eventBus";
import {ShowText} from "@/types/events";
import {Text} from "@/types/common";


// 计算属性
const obj = reactive({
  // 忽略
  output: '',
  // 忽略
  isEnd: false,
  // 打字间隔
  speed: 1000,
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
const props = withDefaults(defineProps<IProps>(), {dialogHeight: 0});

// 昵称
const name = ref<string>();
// 次级标题(昵称右边)
const nickName = ref<string>();
let typingInstance: EasyTyper | null;
let lastText = "";

function skipText() {
  if (!typingInstance) return;
  if (obj.isEnd) {
    eventBus.emit("next");
  } else {
    // 立即显示所有
    typingInstance.closeTimer();
    typingInstance.close();
    obj.output = lastText;
  }
}

onMounted(() => {
  // 监听showText事件
  eventBus.on('showText', handleShowTextEvent);
})

async function handleShowTextEvent(e: ShowText) {
  // 设置昵称
  name.value = e.speaker?.name;
  // 设置次级标题
  nickName.value = e.speaker?.nickName;
  for (const text of e.text) {
    await showTextDialog(text);
    lastText = "";
  }
}

function showTextDialog(text: Text): Promise<void> {
  return new Promise((resolve) => {
    obj.output = "";
    if (text.waitTime) {
      setTimeout(() => {
        typingInstance = new EasyTyper(obj, text.content, () => { resolve() }, () => {});
      }, text.waitTime);
    } else {
      typingInstance = new EasyTyper(obj, text.content, () => { resolve() }, () => {});
    }
    lastText = text.content;
  });
}

interface IProps {
  dialogHeight: number;
}

</script>

<style scoped>
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
  width: 100vw;
  height: 30vh;
  padding: 3rem 8rem;
  box-sizing: border-box;
  background-image: linear-gradient(to bottom , rgba(255,0,0,0) , rgba(19,32,45,0.9) 30%);
}

.content{
  margin-top: 1.5rem;
  font-family: 'TJL',serif;
  color : white;
  font-size: 2.5rem;
}
</style>