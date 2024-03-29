<script lang="ts" setup>
import { continuePlay, dispose, init, stop } from "@/index";
import BaDialog from "@/layers/textLayer/BaDialog.vue";
import BaUI from "@/layers/uiLayer/BaUI.vue";
import { TranslatedStoryUnit } from "@/types/common";
import { Language, StorySummary } from "@/types/store";
import {
  computed,
  onActivated,
  onBeforeMount,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import eventBus from "./eventBus";
import { changeStoryIndex } from "./layers/uiLayer/userInteract";
import { usePlayerStore } from "./stores";

export type PlayerProps = {
  story: TranslatedStoryUnit;
  dataUrl: string;
  width: number;
  height: number;
  language: Language;
  userName: string;
  storySummary: StorySummary;
  startFullScreen?: boolean;
  useMp3?: boolean;
  useSuperSampling?: "2" | "4" | "";
  /** 跳转至传入的 index */
  changeIndex?: number;
  /**
   * 播放结束等待多久后退出全屏操作
   */
  exitFullscreenTimeOut?: number;
};

const props = withDefaults(defineProps<PlayerProps>(), {
  startFullScreen: false,
  useMp3: false,
});
const storySummary = ref(props.storySummary);
storySummary.value.summary = storySummary.value.summary.replace(
  "[USERNAME]",
  props.userName
);
const emit = defineEmits(["end", "error"]);

const playerHeight = ref(props.height);
const playerWidth = ref(props.width);
watch([() => props.width, () => props.height], () => {
  if (!fullScreen.value) {
    playerWidth.value = props.width;
    playerHeight.value = props.height;
  }
});
watch(
  () => props.changeIndex,
  () => {
    if (props.changeIndex !== undefined) {
      changeStoryIndex(props.changeIndex);
    }
  }
);
const playerStyle = computed(() => {
  return { height: `${playerHeight.value}px`, width: `${playerWidth.value}px` };
});
const player = ref<HTMLDivElement>();

const isPseudoFullscreen = ref(false);

const fullScreen = ref(props.startFullScreen);
const fullScreenMaxAspectRatio = 16 / 9;
watch(fullScreen, updateFullScreenState);
/**
 * 强制横屏使播放器居中的top值
 */
const fullscreenTopOffset = computed(() => {
  const screenWidth = Math.max(
    window.screen.availHeight,
    window.screen.availWidth
  );
  return `${100 - ((1 - playerWidth.value / screenWidth) / 2) * 100}%`;
});

/**
 * 根据fullScreen值更新播放器状态
 */
async function updateFullScreenState() {
  const currentFullScreenState =
    ![null, undefined].includes(document.fullscreenElement) ||
    ![null, undefined].includes(document.webkitFullscreenElement) ||
    ![null, undefined].includes(document.mozFullScreenElement);
  if (fullScreen.value) {
    if (!currentFullScreenState) {
      if (
        document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled
      ) {
        if ("function" === typeof document.documentElement.requestFullscreen) {
          console.log("requestFullscreen");
          await player.value?.requestFullscreen({ navigationUI: "hide" });
        } else if (
          "function" === typeof document.documentElement.webkitRequestFullScreen
        ) {
          console.log("webkitRequestFullScreen");
          await player.value?.webkitRequestFullScreen({ navigationUI: "hide" });
        } else if (
          "function" === typeof document.documentElement.mozRequestFullScreen
        ) {
          console.log("mozRequestFullScreen");
          await player.value?.mozRequestFullScreen({ navigationUI: "hide" });
        }
      } else {
        // 无法全屏，将 player 从文档流中脱出并手动伪造全屏效果
        // 估计只有手机 Safari 会走到这里，所以直接不考虑横屏设备的情况
        isPseudoFullscreen.value = true;
        player.value?.classList.add("pseudo-fullscreen");
        playerWidth.value = window.innerHeight;
        playerHeight.value = window.innerWidth;
        console.log("pseudo-fullscreen");
      }
    }
    if (!isPseudoFullscreen.value) {
      playerHeight.value = Math.min(
        window.screen.availWidth,
        window.screen.availHeight
      );
      const tempWidth = Math.max(
        window.screen.availWidth,
        window.screen.availHeight
      );
      if (tempWidth / playerHeight.value > fullScreenMaxAspectRatio) {
        playerWidth.value = playerHeight.value * fullScreenMaxAspectRatio;
      } else {
        playerWidth.value = tempWidth;
      }
    }
  } else {
    // 退出全屏
    if (currentFullScreenState) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitCancelFullScreen) {
        await document.webkitCancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      }
    }
    if (isPseudoFullscreen.value) {
      isPseudoFullscreen.value = false;
      player.value?.classList.remove("pseudo-fullscreen");
    }

    playerWidth.value = props.width;
    playerHeight.value = props.height;
  }
}

window.addEventListener("resize", updateFullScreenState);

/**
 * 指定canvas一个固定的height保证画面表现
 */
const pixiHeight = 1012.5;
const pixiConfig = { ...props, height: pixiHeight };
pixiConfig.width = (pixiHeight * props.width) / props.height; // FIXME: Attempt to assign to const or readonly variable.
const pixiScale = computed(
  //比实际放大一点放置并隐藏解决缩放不精确的问题
  () => (playerHeight.value + 1) / pixiHeight
);
watch([playerWidth, playerHeight], () => {
  const newWidth = (pixiHeight * playerWidth.value) / playerHeight.value;
  const app = usePlayerStore().app;
  const originWidth = app.screen.width;
  if (newWidth.toFixed(2) !== originWidth.toFixed(2)) {
    app.renderer.resize(newWidth, pixiHeight);
    eventBus.emit("resize", originWidth);
  }
});

const fontUrl = `${props.dataUrl}/assets/ResourceHanRoundedCN-Medium.woff2`;
//加载字体
onBeforeMount(() => {
  const newStyle = document.createElement("style");
  newStyle.appendChild(
    document.createTextNode(`\
  @font-face {
    font-family: 'TJL';
    src: url(${fontUrl});`)
  );

  document.head.appendChild(newStyle);
});

const prefixes = ["", "moz", "webkit", "ms"];

function handleFullScreenChange() {
  fullScreen.value =
    ![null, undefined].includes(document.fullscreenElement) ||
    ![null, undefined].includes(document.webkitFullscreenElement) ||
    ![null, undefined].includes(document.mozFullScreenElement);
}

/**
 * 是否经历过setup onMounted
 */
let firstMount = false;
onMounted(() => {
  init(
    "player__main__canvas",
    pixiConfig,
    () => {
      setTimeout(
        () => (fullScreen.value = false),
        props.exitFullscreenTimeOut || 1000
      );
      emit("end");
    },
    () => emit("error")
  );
  if (props.startFullScreen) {
    updateFullScreenState();
  }
  //保证fullscreen值正确性
  prefixes.forEach(prefix => {
    player.value?.addEventListener(
      `${prefix}fullscreenchange`,
      handleFullScreenChange
    );
  });
  firstMount = true;
});

onUnmounted(() => {
  dispose();
  window.removeEventListener("resize", updateFullScreenState);
});

onActivated(() => {
  //目前请不要让此component keepAlive, 可能导致未知的问题
  if (!firstMount) {
    continuePlay();
    prefixes.forEach(prefix => {
      player.value?.addEventListener(
        `${prefix}fullscreenchange`,
        handleFullScreenChange
      );
    });
  } else {
    firstMount = false;
  }
});

onBeforeUnmount(() => {
  prefixes.forEach(prefix => {
    player.value?.removeEventListener(
      `${prefix}fullscreenchange`,
      handleFullScreenChange
    );
  });
});

onDeactivated(() => {
  prefixes.forEach(prefix => {
    player.value?.removeEventListener(
      `${prefix}fullscreenchange`,
      handleFullScreenChange
    );
  });
  stop();
});
</script>

<template>
  <div
    id="player"
    :style="{ height: `${playerHeight}px`, width: `${playerWidth}px` }"
    ref="player"
  >
    <div id="player__background" :style="playerStyle">
      <div id="player__main" :style="playerStyle">
        <div
          id="player__main__canvas"
          :style="{ transform: `scale(${pixiScale})` }"
        ></div>
        <BaDialog
          :player-height="playerHeight"
          :player-width="playerWidth"
          :style="{ width: `${playerWidth}px` }"
        >
        </BaDialog>
        <BaUI
          :height="playerHeight"
          :width="playerWidth"
          :story-summary="storySummary"
          v-model:full-screen="fullScreen"
          :language="language"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@media screen and (orientation: portrait) {
  #player:fullscreen {
    #player__background {
      transform: rotate(-90deg);
      transform-origin: left top;
      position: absolute;
      top: v-bind(fullscreenTopOffset);
      left: 0;
    }
  }
}

//noinspection CssOverwrittenProperties
#player {
  background-color: #080808;
  padding: 0;
  margin: 0;

  &:fullscreen {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  // 不知道为什么这个伪类只能分开写，合起来就不生效
  &:-webkit-full-screen {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  // make mobile safari happy
  &.pseudo-fullscreen {
    position: fixed;
    transform: rotate(-90deg);
    // 宽高已经设置成了屏幕宽高，所以接下来就是想办法让它居中
    top: 100vh;
    top: 100dvh;
    left: 0;
    transform-origin: top left;
    z-index: 201;

    #player__main__canvas {
      z-index: 0;
    }
  }

  &__main {
    position: relative;
    display: inline-block;
    overflow: hidden;

    &__canvas {
      position: absolute;
      left: 0;
      transform-origin: top left;
    }
  }
}
</style>
<style lang="scss">
.pseudo-fullscreen {
  .text-container,
  .baui {
    animation: fuck-safari 999999s alternate infinite;
  }
  // 给 Safari 一鞭子，让渲染引擎别睡死
  @keyframes fuck-safari {
    to {
      transform: translateX(1px);
    }
  }
}
</style>
