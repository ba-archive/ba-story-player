<script lang="ts" setup>
import BaButton from "@/layers/uiLayer/components/BaButton.vue";
import { onMounted, ref } from "vue";
import gsap from "gsap";
import BaDialog from "./components/BaDialog.vue";
import BaChatLog from "./components/BaChatLog.vue";

let hiddenDialog = ref(true);
let hiddenStoryLog = ref(true);
let fastMode = ref(false);
let hiddenMenu = ref(true);
let menuOpacity = ref(0);

// https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940
function debounce<T extends Function>(cb: T, wait = 20) {
  let h = 0;
  let callable = (...args: any) => {
    if (!h) {
      cb(...args);
      clearTimeout(h);
      h = setTimeout(() => (h = 0), wait) as unknown as number;
    }
  };
  return <T>(<any>callable);
}

let handleBtnMenu = debounce((ev: MouseEvent) => {
  menuOpacity.value = menuOpacity.value === 0 ? 1 : 0;
  if (hiddenMenu) {
    hiddenMenu.value = false;
  } else {
    setTimeout(() => {
      hiddenMenu.value = true;
    }, 200);
  }
}, 200);

function effectBtnClick(ev: Event) {
  let tl = gsap.timeline();
  tl.to(ev.currentTarget, { duration: 0.15, scale: 0.94, ease: "power3.out" });
  tl.to(ev.currentTarget, { duration: 0.3, scale: 1 });
}
onMounted(() => {
  document.querySelectorAll(".ba-menu-option").forEach((elem) => {
    console.log(elem);
    elem.addEventListener("click", effectBtnClick);
  });
});
</script>

<template>
  <div class="baui">
    <div class="right-top">
      <div class="baui-button-group">
        <BaButton
          @click="fastMode = !fastMode"
          :class="{ 'ba-button-auto': true, activated: fastMode }"
        >
          AUTO
        </BaButton>
        <BaButton
          @click="handleBtnMenu"
          :class="{ 'ba-button-menu': true, activated: !hiddenMenu }"
        >
          MENU
        </BaButton>
      </div>

      <div
        class="baui-menu-options lean-rect"
        :style="{
          opacity: menuOpacity,
          visibility: hiddenMenu === true ? 'hidden' : 'initial',
        }"
      >
        <button class="button-nostyle ba-menu-option">
          <img src="./assets/pan-arrow.svg" />
        </button>
        <button
          class="button-nostyle ba-menu-option"
          @click="hiddenStoryLog = false"
        >
          <img src="./assets/menu.svg" />
        </button>
        <button
          class="button-nostyle ba-menu-option"
          @click="hiddenDialog = false"
        >
          <img src="./assets/fast-forward.svg" />
        </button>
      </div>
    </div>
    <BaDialog
      id="ba-story-summery"
      :title="'概要'"
      :show="!hiddenDialog"
      @click="hiddenDialog = true"
    >
      <div class="ba-story-summery-container">
        <h4 class="ba-story-summery-title">有计划的消费</h4>
        <p class="ba-story-summery-text">
          邮箱来到夏莱的办公室转交报告时，轻眼目睹老师毫无节制的生活习惯。邮箱一遍替老师整理发票一边碎碎碎念。
        </p>
        <p class="ba-story-summery-tip">※ 是否略过此剧情？</p>
        <div class="ba-story-summery-button-group">
          <BaButton size="large" class="polylight">取消</BaButton>
          <BaButton size="large" class="polydark">确认</BaButton>
        </div>
      </div>
    </BaDialog>
    <BaDialog
      id="ba-story-log"
      :title="'对话记录'"
      width="520px"
      height="90%"
      :show="!hiddenStoryLog"
      @click="hiddenStoryLog = !hiddenStoryLog"
    >
      <BaChatLog />
    </BaDialog>
  </div>
</template>

<style lang="scss" scoped>
.lean-rect {
  transform: skew(-10deg);
}

.button-nostyle {
  margin: 0;
  padding: 0;
  border: none;
  background-color: initial;
}

.right-top {
  position: absolute;
  top: 0;
  right: 0;
  padding: 1.5%;
  user-select: none;
}

.baui {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;

  .baui-button-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 8px;

    .ba-button {
      &:hover {
        background-color: #c7c8c9;
      }
    }

    .ba-button-menu.activated {
      color: #e7e8e9;
      background-color: #707580b1;
    }
  }

  .baui-menu-options {
    display: grid;
    grid-gap: 8px;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 9px;
    padding: 12px 12px;
    border-radius: 6px;
    background-color: rgba(244, 244, 244, 0.6);
    overflow: hidden;
    transition: opacity 0.2s;

    .ba-menu-option {
      display: block;
      font-size: 24px;
      background-color: #2c4565;
      border-radius: 3px;
      padding: 4px 8px;
      transition: background-color 0.3s ease-out;

      &:hover {
        background-color: #243955;
      }

      img {
        display: block;
      }
    }
  }

  #ba-story-summery {
    .ba-story-summery-container {
      height: 100%;
      display: flex;
      flex-flow: nowrap column;
      background: center/contain
          linear-gradient(
            130deg,
            rgba(240, 240, 240, 1) 0%,
            rgba(240, 240, 240, 0.9) 65%,
            rgba(240, 240, 240, 0.6) 70%,
            rgba(240, 240, 240, 0) 100%
          ),
        80px 45% url(./assets/UITex_BGPoliLight_1.png) rgb(164 216 237);
      background-size: 100%;
    }
    color: #32363c;
    .ba-story-summery-title {
      margin: 12px 0;
      text-align: center;
      color: #32363c;
      font-size: 18px;
      font-weight: bold;
    }
    .ba-story-summery-text {
      flex: 1;
      border: solid #d1d7dc 2px;
      margin: 0 16px;
      border-radius: 4px;
      overflow: hidden;
      padding: 5px 7px;
      background-color: #f0f0f0;
    }

    .ba-story-summery-tip {
      color: #32363c;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 12px auto 0;
      user-select: none;
    }

    .ba-story-summery-button-group {
      display: grid;
      margin: 12px 16px 24px;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 16px;
    }
  }
}
</style>
