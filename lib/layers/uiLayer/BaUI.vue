<script lang="ts" setup>
import BaButton from "@/layers/uiLayer/components/BaButton.vue";
import { onMounted, ref } from "vue";
import BaDialog from "./components/BaDialog.vue";
import BaChatLog from "./components/BaChatLog/BaChatLog.vue";
import BaSelector from "./components/BaSelector.vue";
import eventBus from "@/eventBus";
import { StorySummary } from "@/types/store";
import { effectBtnMouseDown, effectBtnMouseUp } from "./utils";
import { ShowOption } from "@/types/events";
import { usePlayerStore } from "@/stores";

let hiddenSummary = ref(true);
let hiddenStoryLog = ref(true);
let autoMode = ref(false);
let hiddenMenu = ref(true);
let hiddenSubMenu = ref(true);

// 计时器：当这个计时器到时间时 -- 回调函数会把 hiddenMenu 设置成 true 来影藏菜单
let btnMenuTimmer: any

let { storySummary } = defineProps<{ storySummary: StorySummary }>()
const selectOptions = ref<ShowOption[]>([]);
const emitter = defineEmits(['fullscreenChange'])

eventBus.on("hide", () => {
  // console.log("UI hide")
  hiddenSummary.value = true
  hiddenStoryLog.value = true
  hiddenMenu.value = true
})
eventBus.on("hidemenu", () => {
  hiddenMenu.value = true
})
eventBus.on("showmenu", () => {
  hiddenMenu.value = false
})
eventBus.on("option", (e) => (selectOptions.value = [...e]));

function handleBtnHiddenUi() {
  eventBus.emit("playOtherSounds", "select")
  refreshBtnMenuTimmer()
  eventBus.emit("hideDialog");
}
function handleBtnFullScreen() {
  emitter('fullscreenChange')
}
function handleBtnChatLog() {
  eventBus.emit("playOtherSounds", "select")
  refreshBtnMenuTimmer()
  hiddenStoryLog.value = false
  autoMode.value = false
  eventBus.emit("stopAuto")
}
function handleBtnSkipSummary() {
  eventBus.emit("playOtherSounds", "select")
  refreshBtnMenuTimmer()
  autoMode.value = false
  hiddenSummary.value = false;
  eventBus.emit("stopAuto")
}

// 处理选项
function handleBaSelector(selectionGroup: number) {
  console.log("selectGroup: ", selectionGroup)
  console.log("select: ", selectOptions.value[selectionGroup])
  eventBus.emit('select', selectOptions.value[selectionGroup].SelectionGroup)
  usePlayerStore().updateLogText(selectOptions.value[selectionGroup])

  selectOptions.value.length = 0;
}

// modi https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940
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

function handleBtnAutoMode() {
  autoMode.value = !autoMode.value;
  if (autoMode.value) {
    eventBus.emit("auto");
  } else {
    eventBus.emit("stopAuto");
  }
}

function handleBtnMenu() {
  if (hiddenSubMenu.value) {
    hiddenSubMenu.value = false;
    // 一段时间后自动影藏
    clearInterval(btnMenuTimmer)
    btnMenuTimmer = setTimeout(() => {
      hiddenSubMenu.value = true;
    }, 5555);
  } else {
    hiddenSubMenu.value = true;
  }
}

function refreshBtnMenuTimmer() {
  if (!hiddenSubMenu.value) {
    clearTimeout(btnMenuTimmer)
    btnMenuTimmer = setTimeout(() => {
      hiddenSubMenu.value = true;
    }, 5555);
  }
}

// 子菜单按钮动画
let handleBtnMouseDown = effectBtnMouseDown()
let handleBtnMouseUp = effectBtnMouseUp()

const handleBtnMenuDebounced = debounce(handleBtnMenu, 200);

</script>

<template>
  <div class="baui" @click.self="eventBus.emit('click')">
    <div class="right-top" v-show="!hiddenMenu">
      <div class="baui-button-group">
        <BaButton @click="handleBtnAutoMode" :class="{ 'ba-button-auto': true, activated: autoMode }">
          AUTO
        </BaButton>
        <BaButton @click="handleBtnMenuDebounced" :class="{ 'ba-button-menu': true, activated: !hiddenSubMenu }">
          MENU
        </BaButton>
      </div>

      <Transition>
        <div class="baui-menu-options lean-rect" v-if="!hiddenSubMenu">
          <button class="button-nostyle ba-menu-option" @click="handleBtnFullScreen"
            @mousedown="handleBtnMouseDown" @touchstart="handleBtnMouseDown" @touchend="handleBtnMouseUp"
            @mouseup="handleBtnMouseUp" @mouseleave="handleBtnMouseUp">
            <img draggable="false" src="./assets/pan-arrow.svg" />
          </button>
          <button class="button-nostyle ba-menu-option" @click="handleBtnChatLog"
            @mousedown="handleBtnMouseDown" @touchstart="handleBtnMouseDown" @touchend="handleBtnMouseUp"
            @mouseup="handleBtnMouseUp" @mouseleave="handleBtnMouseUp">
            <img draggable="false" src="./assets/menu.svg" />
          </button>
          <button class="button-nostyle ba-menu-option" @click="handleBtnSkipSummary"
            @mousedown="handleBtnMouseDown" @touchstart="handleBtnMouseDown" @touchend="handleBtnMouseUp"
            @mouseup="handleBtnMouseUp" @mouseleave="handleBtnMouseUp">
            <img draggable="false" src="./assets/fast-forward.svg" />
          </button>
        </div>
      </Transition>
    </div>

    <BaSelector id="ba-story-selector" :selection="selectOptions" @select="handleBaSelector"
      v-if="selectOptions.length !== 0" />

    <BaDialog id="ba-story-summary" :title="'概要'" :show="!hiddenSummary" @close="hiddenSummary = true"
      width="min(520px, 70%)" height="min(400px,85%)">
      <div class="ba-story-summary-container">
        <h4 class="ba-story-summary-title">{{ storySummary.chapterName }}</h4>
        <p class="ba-story-summary-text">
          {{ storySummary.summary }}
        </p>
        <!-- <p class="ba-story-summary-tip">※ 是否略过此剧情？</p> -->
        <div class="ba-story-summary-button-group">
           <BaButton size="middle" class="polylight button-close-summary" @click="hiddenSummary = true">关闭</BaButton>
<!--          <BaButton size="large" class="polydark" @click="eventBus.emit('skip'); hiddenSummary = true">确认</BaButton>-->
        </div>
      </div>
    </BaDialog>

    <BaDialog id="ba-story-log" :title="'对话记录'" width="80%" height="90%" :show="!hiddenStoryLog"
      @close="hiddenStoryLog = !hiddenStoryLog">
      <BaChatLog :show="!hiddenStoryLog" />
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
  z-index: 110;
}

.baui {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  z-index: 100;
  overflow: hidden;
  font-family: 'TJL', 'Microsoft YaHei', 'PingFang SC', -apple-system, system-ui,
    'Segoe UI', Roboto, Ubuntu, Cantarell, 'Noto Sans', BlinkMacSystemFont,
    'Helvetica Neue', 'Hiragino Sans GB', Arial, sans-serif;

  .v-enter-active,
  .v-leave-active {
    transition: opacity .2s;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }

  .baui-button-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 0.5rem;

    .ba-button {
      &:hover {
        background-color: #c7c8c9;
      }
    }

    .ba-button-auto.activated {
      background: no-repeat right -17% bottom/contain url(./assets/Common_Btn_Normal_Y_S_Pt.png) #efe34b;
    }

    .ba-button-menu.activated {
      color: #e7e8e9;
      background-color: #707580b1;
    }
  }

  .baui-menu-options {
    display: grid;
    grid-gap: 0.5rem;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 0.56rem;
    padding: 0.75rem 0.75rem;
    border-radius: 0.375rem;
    background-color: rgba(244, 244, 244, 0.6);
    overflow: hidden;

    .ba-menu-option {
      display: block;
      font-size: 1.5rem;
      background-color: #2c4565;
      border-radius: 0.1875rem;
      padding: 0.25rem 0.5rem;
      transition: background-color 0.3s ease-out;

      &:hover {
        background-color: #243955;
      }

      img {
        display: block;
      }
    }
  }

  #ba-story-log {
    color: #32363c;
    z-index: 110;
  }

  #ba-story-summary {
    color: #32363c;

    .ba-story-summary-container {
      height: 100%;
      display: flex;
      flex-flow: nowrap column;
      background: center/contain linear-gradient(130deg,
          rgba(240, 240, 240, 1) 0%,
          rgba(240, 240, 240, 0.9) 65%,
          rgba(240, 240, 240, 0.6) 70%,
          rgba(240, 240, 240, 0) 100%),
        80px 45% url(./assets/UITex_BGPoliLight_1.png) rgb(164 216 237);
      background-size: 100%;
    }

    .ba-story-summary-title {
      margin: 0.75rem 0;
      text-align: center;
      color: #32363c;
      font-size: 1.125rem;
      font-weight: bold;
    }

    .ba-story-summary-text {
      flex: 1;
      border: solid #d1d7dc 2px;
      margin: 0 1rem;
      border-radius: 0.25rem;
      overflow-y: auto;
      padding: 0.3125rem 0.4375rem;
      background-color: #f0f0f0;
    }

    .ba-story-summary-tip {
      color: #32363c;
      font-size: 1.125rem;
      font-weight: bold;
      text-align: center;
      margin: 0.75rem auto 0;
      user-select: none;
    }

    .ba-story-summary-button-group {
      display: flex;
      margin: 0.75rem 1rem 1.5rem;
      justify-content: center;
      align-items: center;

      .button-close-summary {
        width: 50%;
      }
    }
  }
}
</style>
