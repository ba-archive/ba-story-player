<template>
  <div class="container" :style="{ height: `${playerHeight}px` }">
    <div class="container-inner">
      <div class="loading-container absolute-container" v-if="showLoading">
        <img class="loading-image" :src="loadingImageSrc" alt="本来应该是加载图片的">
        <div class="loading-log">
          <div
            v-for="(e, index) in mapLoadLog"
            class="loading-log-item"
            :key="index">
            <span v-if="e.type === 'success'" class="loading-log-item-success">
              加载资源:{{ e.resourceName }}
            </span>
            <span v-else class="loading-log-item-error">
              加载错误:{{ e.resourceName }}
            </span>
          </div>
        </div>
      </div>
      <div ref="nextEpisodeContainer" class="next-episode-container absolute-container" @click="endPlay"
        v-if="showNextEpisode">
        <div class="next-episode-cover" />
        <div class="next-episode-cover" />
      </div>
      <div class="to-be-continued-container absolute-container" v-if="showToBeContinue">
        <div ref="toBeContinuedBg0" class="to-be-continued-bg0" />
        <div ref="toBeContinuedBg1" class="to-be-continued-bg1" />
        <div ref="toBeContinuedText" class="to-be-continued" :style="{ fontSize: `${standardFontSize}rem` }">To Be
          Continued...</div>
      </div>
      <div class="image-video-container absolute-container" v-if="popupSrc.image || popupSrc.video">
        <div class="image-video-container-inner">
          <div class="image-container absolute-container" :style="{ height: `${playerHeight - dialogHeight}px` }"
            v-if="popupSrc.image">
            <img :src="popupSrc.image" alt="完了加载失败了" class="image" />
          </div>
          <VideoBackground ref="videoComponent" :src="popupSrc.video" objectFit="contain" style="width: 100%; height: 100%"
            v-if="popupSrc.video" @ended="onPopupVideoEnd" />
        </div>
      </div>
      <div class="st-container absolute-container" ref="stOutput" :style="{ fontSize: `${standardFontSize}rem` }" />
      <div ref="titleEL" class="title-container absolute-container" :style="overrideTitleStyle" v-if="titleContent">
        <div class="title-border" :style="{ '--side-padding': `${titleBorderPadding}px` }">
          <img src="./assets/title-border.png" />
          <div ref="titleContain" class="title-contain" :style="{ '--font-size': `${fontSize(4)}rem` }">
            <div class="sub-title" v-if="subTitleContent">
              <span class="sub-title-inner">{{ subTitleContent }}</span>
            </div>
            <div class="main-title" v-html="titleContent" />
          </div>
        </div>
      </div>
      <div ref="placeEL" class="place-container" :style="{ '--font-size': `${fontSize(2)}rem` }" v-if="placeContent">
        <div class="round-place">
          <span class="place-content">{{ placeContent }}</span>
        </div>
      </div>
      <div v-if="showDialog" :style="{ padding: `0 ${fontSize(8)}rem ${fontSize(3)}rem`, height: `${dialogHeight}px` }"
        class="dialog">
        <div class="inner-dialog">
          <div class="title">
            <div :style="{ fontSize: `${fontSize(3.5)}rem` }" class="name">{{ name ? name : '&emsp;' }}</div>
            <div :style="{ fontSize: `${fontSize(2)}rem` }" class="department">{{ nickName }}</div>
          </div>
          <hr>
          <div ref="typewriterOutput" :style="{ '--font-size': `${standardFontSize}rem` }" class="content" />
          <div class="next-image-btn" v-if="typingComplete">&zwj;</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, Ref, nextTick, onUnmounted, reactive } from 'vue'
import eventBus from "@/eventBus";
import Typed, { TypedExtend, TypedOptions } from "typed.js";
import {ResourceLoadState, ShowText, ShowTitleOption, StArgs, StText} from "@/types/events";
import {Text, TextEffectName} from "@/types/common";
import { deepCopyObject } from "@/utils";
import { usePlayerStore } from '@/stores';
import gsap from "gsap";
import VideoBackground from "vue-responsive-video-background-player";


const typewriterOutput = ref<HTMLElement>(); // 对话框el
const stOutput = ref<HTMLElement>(); // st特效字el
const toBeContinuedBg0 = ref<HTMLElement>(); // to be continued的背景
const toBeContinuedBg1 = ref<HTMLElement>(); // to be continued的背景
const toBeContinuedText = ref<HTMLElement>(); // to be continued的字
const titleEL = ref<HTMLElement>(); // 大标题的el
const placeEL = ref<HTMLElement>(); // place的el
const nextEpisodeContainer = ref<HTMLElement>(); // 下一章的el
const titleContain = ref<HTMLElement>(); // 标题内容的el, 为了实现scale效果
const overrideTitleZIndex = ref<number>();
const videoComponent = ref();
// 外部传入播放器高度,用于动态计算字体等数值
const props = withDefaults(defineProps<TextLayerProps>(), { playerHeight: 0, playerWidth: 0 });
// 标题
const titleContent = ref<string>("");
// 副标题
const subTitleContent = ref<string>("");
// 位置
const placeContent = ref<string>("");
// 昵称
const name = ref<string>();
// 所属(昵称右边)
const nickName = ref<string>();
// 在执行st特效时置为false以隐藏对话框
const showDialog = ref<boolean>(false);
// 显示加载动画
const showLoading = ref<boolean>(false);
// 显示to be continued
const showToBeContinue = ref<boolean>(false);
// 显示next episode
const showNextEpisode = ref<boolean>(false);
const popupSrc = reactive({
  // image: "https://yuuka.diyigemt.com/image/full-extra/output/media/UIs/03_Scenario/04_ScenarioImage/popup49.png",
  // video: "https://yuuka.diyigemt.com/image/full-extra/output/media/Video/pv-v.mp4"
  image: "",
  video: ""
});
const loadingImageSrc = ref<string>("");
let showNextEpisodeLock = false;
// 打印完成
const typingComplete = ref<boolean>(false);
let typingInstance: TypedExtend; // 全局打字机实例 因为不能有两个实例同时持有一个el
function endPlay() {
  if (showNextEpisodeLock) {
    return;
  }
  eventBus.emit("next");
}
/**
 * 单击屏幕后触发效果 next或者立即显示当前对话
 */
function moveToNext() {
  if (!showDialog) return; // 显示st期间不允许跳过
  // 没打过任何一行字(初始化)或者对话已经显示完成, 点击屏幕代表继续
  if (!typingInstance || typingComplete.value) {
    eventBus.emit("next");
  } else { // 否则立即显示所有对话
    if (typewriterOutput.value) { // 过滤live2d播放
      typingInstance.stop();
      typingInstance.destroy();
      setTypingComplete(true, typingInstance);
      typewriterOutput.value!.innerHTML = typingInstance.strings.pop() || ""
      eventBus.emit('textDone')
    }
  }
}
/**
 * 展示主标题
 */
function handleShowTitle(e: ShowTitleOption) {
  subTitleContent.value = e.subtitle || "";
  proxyShowCoverTitle(titleEL, titleContent, parseTitle(e.title)).then(() => {
    subTitleContent.value = "";
    eventBus.emit("titleDone");
  })
}
function parseTitle(item: Text[]): string {
  return item.map(it => parseTextEffect(it).content).join("");
}
/**
 * 展示左上角位置标题
 */
function handleShowPlace(e: string) {
  proxyShowCoverTitle(placeEL, placeContent, e);
}

/**
 * 统一方法, 淡入淡出el
 * @param el 要操作的el
 * @param proxy 要操作的el显示的内容
 * @param value 要显示的内容
 * @param onElUpdate 在el显示后的回调, 给next episode用的
 */
function proxyShowCoverTitle(el: Ref<HTMLElement | undefined>, proxy: Ref<string>, value: string, onElUpdate?: (el: HTMLElement) => void) {
  return new Promise<void>((resolve) => {
    proxy.value = value;
    nextTick(() => {
      onElUpdate && onElUpdate(el.value!);
      const timeline = gsap.timeline();
      timeline.to(el.value!, {
        opacity: 1,
        duration: 0.75
      });
      if (!onElUpdate) {
        timeline.to(el.value!, {
          opacity: 0,
          duration: 0.75
        }, "+=1.5");
      }
      timeline.then(() => {
        if (!onElUpdate) {
          proxy.value = "";
        }
        resolve();
      });
    });
  });
}
/**
 * 清除特效字
 */
function handleClearSt() {
  // 清除上次输入
  // 显示st时dialog必定是隐藏的
  if (!showDialog.value) {
    typingInstance?.stop();
    typingInstance?.destroy();
    if (stOutput.value) {
      stOutput.value!.innerHTML = "";
    }
  }
}
/**
 * 处理st显示事件
 */
function handleShowStEvent(e: StText) {
  // st特效必须有数组长度为3的参数
  if (!e.stArgs || !Array.isArray(e.stArgs) || e.stArgs.length !== 3) {
    console.error("st特效参数不足", e);
    return;
  }
  e = deepCopyObject(e);
  // 显示st时隐藏对话框
  showDialog.value = false;
  // 因为是vdom操作所以等生效后继续
  nextTick(() => {
    // st坐标系位置
    const stPos = e.stArgs[0];
    // st显示类型
    const stType = e.stArgs[1];
    // st坐标系映射视口坐标系
    const x = Math.floor(((stWidth / 2) + stPos[0]) * stPositionBounds.value.width);
    const y = Math.floor(((stHeight / 2) - stPos[1]) * stPositionBounds.value.height);
    // st样式
    let extendStyle = `;position: absolute; top: ${y}px; width: auto;left: ${x}px;`;
    // 居中显示特殊样式
    if (e.middle) {
      extendStyle = extendStyle + `;text-align: center; left: 50%; transform: translateX(-50%)`;
    }
    const fontSize = e.stArgs[2]; // st的字号
    extendStyle = extendStyle + `;font-size: ${unityFontSizeToHTMLSize(Number(fontSize))}rem`;
    // 立即显示, 跳过打字机
    const fn = Reflect.get(StMap, stType);
    if (fn) {
      fn(e, extendStyle);
    } else {
      console.error(`st type handler: ${stType} not found!`);
    }
  })
}

/**
 * 處理三種st特效的fn
 */
type StType = StArgs[1]
type StMap = {
  [key in StType]: (e: StText, parsedStyle: string) => void
}
const StMap: StMap = {
  instant(e: StText, parsedStyle: string): void {
    stOutput.value!.innerHTML = stOutput.value!.innerHTML + parseStInnerHtml(e, parsedStyle).content;
    eventBus.emit("stDone");
  },
  serial(e: StText, parsedStyle: string): void {
    showTextDialog(
      e.text.map(text => {
        // 为啥要这样, 因为这个库在空字符时会删除当前的内容重新打印, 导致一句话出现两次的bug
        text.content = text.content || "&zwj;";
        return text;
      }).map(text => parseTextEffect(text)),
      stOutput.value!,
      (content) => {
        return `<div style="${parsedStyle}">${content}</div>`
      }, {
      typeSpeed: 10
    }
    ).then(() => {
      eventBus.emit("stDone");
    });
    typingInstance.isSt = true;
  },
  smooth(e: StText, parsedStyle: string): void {
    parsedStyle = parsedStyle + ";opacity: 0";
    stOutput.value!.innerHTML = stOutput.value!.innerHTML + parseStInnerHtml(e, parsedStyle).content;
    const el = stOutput.value!.children.item(stOutput.value!.children.length - 1);
    const timeline = gsap.timeline();
    timeline.fromTo(el, {
      opacity: 0,
    }, {
      opacity: 1,
      duration: 1.5
    }).then(() => {
      eventBus.emit("stDone");
    })
  }
}

/**
 * 處理st特效 instant和smooth
 *
 * 將e.text全部包裹在div中
 */
function parseStInnerHtml(e: StText, parsedStyle: string) {
  return parseTextEffect({
    content: e.text.map(text => parseTextEffect(text).content).join(""),
    effects: []
  }, parsedStyle, "div");
}
/**
 * 处理dialog对话事件
 */
function handleShowTextEvent(e: ShowText) {
  usePlayerStore().updateLogText(e)
  showDialog.value = true;
  e = deepCopyObject(e);
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
    showTextDialog(e.text.map(text => parseTextEffect(text)), typewriterOutput.value!).then(() => {
      eventBus.emit("textDone");
    })
    typingInstance && (typingInstance.isSt = false);
  })
}

/**
 * 将字体特效处理成html标签
 * @param text 文字特效
 * @param extendStyle 额外append到style里的内容, 目前用来控制st的位置
 * @param tag 包裹的标签, 默认是span让他们可以拼接在一起
 */
function parseTextEffect(text: Text, extendStyle = "", tag = "span"): Text {
  const effects = text.effects;
  // 解决typedjs对&的特殊处理
  text.content = text.content.replace("&", "&amp;");
  // 注解
  const rt = (effects.filter(effect => effect.name === "ruby")[0] || { value: [] }).value.join("")
  const style = effects.filter(effect => effect.name !== "ruby").map(effect => {
    const value = effect.value.join("");
    const name = effect.name;
    if (name === "color") {
      return `color: ${value}`;
    } else if (name === "fontsize") {
      return `font-size: ${unityFontSizeToHTMLSize(Number(value))}rem`
    }
    // 暂时废弃, 没办法处理字体自适应
    return (StyleEffectTemplate[effect.name] || "").replace("${value}", effect.value.join(""))
  }).join(";");
  // 如果有注解就用ruby标签实现
  if (rt) {
    text.content = `<${tag} style="${style};${extendStyle}" class="ruby" data-content="${rt}"><span class="rb">${text.content}</span><span class="rt">${rt}</span></${tag}>`
  } else {
    text.content = `<${tag} style="${style};${extendStyle}">${text.content}</${tag}>`
  }
  return text;
}
/**
 * 打字机主方法, 将处理好的文字标签插入dom中
 * @param text 处理好的特效
 * @param output 输出到的dom
 * @param onParseContent 二次处理内容, 目前用于将st用div整体包裹实现定位
 * @param override 覆蓋默認typing配置内容
 */
function showTextDialog(text: Text[], output: HTMLElement, onParseContent?: (source: string) => string, override?: TypedOptions) {
  return new Promise<void>((resolve) => {
    if (text.length === 0) {
      setTypingComplete(true);
      resolve();
      return;
    }
    setTypingComplete(false);
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
    /**
     * 实现分段打印的核心函数
     * 原理是每段打印完成后修改 pause 里的内容让打字机认为自己并没有完成打印而是暂停, 于是继续把替换进去的下一段文字打印出来
     */
    function onComplete(self: TypedExtend) {
      if (index >= text.length) {
        setTimeout(() => {
          setTypingComplete(true);
          resolve();
        }, 100)
        return;
      }
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
        setTypingComplete(false, self);
        self.start();
      }, text[index].waitTime || 0);
      index++;
    }
    // st的续约, 因为不能两个Typed同时持有一个对象, 所以采用将之前的内容作为已打印内容拼接的形式
    function continueSt() {
      lastStOutput = stOutput.value!.innerHTML;
      setTypingComplete(false, typingInstance);
      typingInstance.pause.status = true;
      typingInstance.pause.typewrite = true;
      typingInstance.pause.curString = lastStOutput + firstContent;
      typingInstance.pause.curStrPos = lastStOutput.length;
      typingInstance.options.onComplete = onComplete;
      typingInstance.startDelay = 0;
      setTimeout(() => {
        typingInstance.start();
      }, text[0].waitTime || 0);
    }
    if (typingInstance && typingInstance.isSt) {
      continueSt();
    } else {
      // 如果之前st是instant也会走到这里, 因此判断代理的el是不是st的container
      if (output === stOutput.value) {
        typingInstance = new Typed(output, {
          ...DefaultTypedOptions,
          ...override,
          startDelay: 99999,
          strings: [""],
        }) as TypedExtend;
        typingInstance.isSt = true;
        typingInstance.stop();
        continueSt();
      } else {
        // 全新清空
        typingInstance?.stop && typingInstance?.stop();
        typingInstance?.destroy && typingInstance?.destroy();output.innerHTML = "";
        typingInstance = new Typed(output, {
          ...DefaultTypedOptions,
          ...override,
          startDelay: text[0].waitTime || 0,
          strings: [lastStOutput + firstContent],
          onComplete: onComplete,
        }) as TypedExtend;
      }
    }
  })
}

/**
 * 處理hide和hideDialog事件
 */
function handleHideDialog() {
  showDialog.value = false;
}

/**
 * 处理 to be continued 效果
 */
function handleToBeContinued() {
  hideMenu();
  showToBeContinue.value = true;
  nextTick(() => {
    const style = getComputedStyle(toBeContinuedText.value!);
    const w = Number(style.width.replace("px", ""));
    toBeContinuedText.value!.style.right = `${-w - 10}px`;
    toBeContinuedText.value!.style.opacity = "1";
    const timeline = gsap.timeline();
    timeline
      .to(toBeContinuedBg0.value!, {
        opacity: 1,
        duration: 0.3,
      })
      .to(toBeContinuedBg1.value!, {
        opacity: 1,
        duration: 0.4,
      }, "-=0.15")
      .to(toBeContinuedText.value!, {
        right: 20,
        duration: 0.3,
      }, "<")
      .to(toBeContinuedText.value!, {
        opacity: 0,
        duration: 0.6
      }, "+=1.2").then(() => eventBus.emit('toBeContinueDone'))
    .then(() => {
      eventBus.emit("toBeContinueDone");
    })
  });
}

/**
 * 显示下一章标题
 */
function handleNextEpisode(e: ShowTitleOption) {
  showNextEpisodeLock = true;
  showNextEpisode.value = true;
  hideMenu();
  nextTick(() => {
    const container = nextEpisodeContainer.value!;
    const topChild = container.children[0];
    const bottomChild = container.children[1];
    let flag = false;
    const timeline = gsap.timeline();
    timeline.to(topChild, {
      translateY: 0,
      duration: 0.5,
      ease: "power4.out"
    })
      .to(bottomChild, {
        translateY: 0,
        duration: 0.5,
        ease: "power4.out",
        onComplete() {
          showToBeContinue.value = false;
        }
      }, "<")
      .to(topChild, {
        translateY: "-100%",
        duration: 0.5,
        ease: "power4.in"
      })
      .to(bottomChild, {
        translateY: "100%",
        duration: 0.5,
        ease: "power4.in",
        onUpdate() {
          if (flag) {
            return;
          }
          const matrix = getComputedStyle(bottomChild).transform;
          if (Number(matrix.substring(matrix.lastIndexOf(",") + 2).replace(")", "")) > 100) {
            subTitleContent.value = e.subtitle || "";
            proxyShowCoverTitle(titleEL, titleContent, parseTitle(e.title), (el) => {
              const tl = gsap.timeline();
              tl.fromTo(el, {
                scaleY: 0.8
              }, {
                scaleY: 1,
                duration: 0.2
              })
            });
            flag = true;
          }
        }
      }, "<").then(() => { eventBus.emit("nextEpisodeDone") });
  });
}
function handlePopupImage(url: string) {
  popupSrc.image = url;
}
function handlePopupVideo(url: string) {
  hideMenu();
  popupSrc.video = url;
}
function onPopupVideoEnd() {
  console.log("video end");
}
function hideMenu() {
  eventBus.emit("hidemenu");
}
function showMenu() {
  eventBus.emit("showmenu");
}
function handlePopupClose() {
  popupSrc.image = "";
  videoComponent.value?.pause();
  nextTick(() => {
    popupSrc.video = "";
  })
}
/**
 * 播放加载动画
 * @param dataUrl
 */
function handleStartLoading(dataUrl: string) {
  if (loadingImageSrc.value) {
    return;
  }
  const loadingImageIndex = Math.floor(Math.random() * 40);
  loadingImageSrc.value = `${dataUrl}/loading/${loadingImageIndex}.webp`;
  showLoading.value = true;
}

/**
 * 滚动加载log
 * @param state 已加载的资源状态
 */
function handleOneResourceLoaded(state: ResourceLoadState) {
  showLoading.value = true;
  const lastUrlPathIndex = state.resourceName.lastIndexOf("/") + 1;
  const resourceName = state.resourceName.substring(lastUrlPathIndex === -1 ? 0 : lastUrlPathIndex, state.resourceName.length);
  loadLog.value.push({
    type: state.type,
    resourceName: resourceName
  });
}

/**
 * 隐藏加载动画
 */
function handleEndLoading() {
  showLoading.value = false;
}
const fontSizeBounds = computed(() => (props.playerHeight / 1080));
const stWidth = 3000;
const stHeight = 1600;
// st坐标系映射视口坐标系
const stPositionBounds = computed(() => ({ width: props.playerWidth / stWidth, height: props.playerHeight / stHeight }))
// 按比例缩放文字
function fontSize(multi: number) {
  return fontSizeBounds.value * multi;
}
const standardFontSize = computed(() => fontSize(2.5));
const standardUnityFontSize = 64;
/**
 * 以64作为标准st字体大小?
 * @param size
 */
function unityFontSizeToHTMLSize(size: number) {
  return (size / standardUnityFontSize) * standardFontSize.value;
}

/**
 * typingInstance不能被代理且自身的typingComplete也有意义
 * @param complete 是否完成
 * @param instance 如果有,同时设
 */
function setTypingComplete(complete: boolean, instance?: TypedExtend) {
  typingComplete.value = complete;
  if (instance) {
    instance.typingComplete = complete;
  }
}
const overrideTitleStyle = computed(() => {
  if (overrideTitleZIndex.value) {
    return {
      "z-index": overrideTitleZIndex.value,
    };
  }
  return {
      //当为nexetEpisode时取消背景模糊
      "backdrop-filter": showNextEpisode.value? 'none' : 'blur(7px)'
  };
});
// 文本框总高度
const dialogHeight = computed(() => props.playerHeight * 0.37);
// 选择框位置
const standardDialogHeight = 550;
const standardDialogTopOffset = 100;
// 计算title的padding以让其符合边框第二边线
const titleBorderWidth = 2280;
const standardBorderWidth = 26;
const titleBorderPadding = computed(() => props.playerWidth / titleBorderWidth * standardBorderWidth);
const loadLog = ref<ResourceLoadState[]>([]);
const mapLoadLog = computed(() => deepCopyObject(loadLog.value).reverse().slice(0, 4).map(it => it || { type: "success", resourceName: "" }));
onMounted(() => {
  eventBus.on("showTitle", handleShowTitle);
  eventBus.on("showPlace", handleShowPlace);
  eventBus.on('showText', handleShowTextEvent);
  eventBus.on('st', handleShowStEvent);
  eventBus.on('clearSt', handleClearSt);
  eventBus.on("hide", handleHideDialog);
  eventBus.on("hideDialog", handleHideDialog);
  eventBus.on("click", moveToNext);
  eventBus.on("toBeContinue", handleToBeContinued);
  eventBus.on("nextEpisode", handleNextEpisode);
  eventBus.on("popupImage", handlePopupImage);
  eventBus.on("popupVideo", handlePopupVideo);
  eventBus.on("hidePopup", handlePopupClose);
  eventBus.on("startLoading", handleStartLoading);
  eventBus.on("oneResourceLoaded", handleOneResourceLoaded);
  eventBus.on("loaded", handleEndLoading);
});
onUnmounted(() => {
  eventBus.off("showTitle", handleShowTitle);
  eventBus.off("showPlace", handleShowPlace);
  eventBus.off('showText', handleShowTextEvent);
  eventBus.off('st', handleShowStEvent);
  eventBus.off('clearSt', handleClearSt);
  eventBus.off("hide", handleHideDialog);
  eventBus.off("hideDialog", handleHideDialog);
  eventBus.off("click", moveToNext);
  eventBus.off("toBeContinue", handleToBeContinued);
  eventBus.off("nextEpisode", handleNextEpisode);
  eventBus.off("popupImage", handlePopupImage);
  eventBus.off("popupVideo", handlePopupVideo);
  eventBus.off("hidePopup", handlePopupClose);
  eventBus.off("startLoading", handleStartLoading);
  eventBus.off("oneResourceLoaded", handleOneResourceLoaded);
  eventBus.off("loaded", handleEndLoading);
});
// 暂时用不上了, 比如font-size还需要根据屏幕进行适配
type StyleEffectTemplateMap = {
  [key in TextEffectName]: string
}
const StyleEffectTemplate: StyleEffectTemplateMap = {
  color: "color: ${value}",
  fontsize: "font-size: ${value}px",
  ruby: ''
}
// 默认的打字机效果
const DefaultTypedOptions: TypedOptions = {
  typeSpeed: 20, // 每个字速度 单位是ms
  showCursor: false, // 是否显示虚拟光标
  fadeOut: true,
  contentType: "html" // 内容类型 显然是html
}
/**
 * 用来算比例的
 */
type TextLayerProps = {
  playerHeight: number; // 整块视口的高
  playerWidth: number; // 整块视口的宽
}
</script>

<style scoped lang="scss">
$border-radius: 5px;
$dialog-z-index: 3;
$place-z-index: 8;
$title-z-index: 10;
$select-z-index: 10;
$image-video-z-index: 10;
$to-be-continue-z-index: 200;
$next-episode-z-index: 201;
$loading-z-index: 202;
$st-z-index: 10;
$text-outline: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;

.name {
  font-size: 3.5rem;
  color: white;
  align-self: flex-end;
}

.department {
  margin-left: 1rem;
  font-size: 2.5rem;
  color: rgb(156, 218, 240);
}

.title {
  display: flex;
  align-items: flex-end;
}

.dialog {
  width: 100%;
  padding: 3rem 8rem;
  box-sizing: border-box;
  background-image: linear-gradient(to bottom, rgba(255, 0, 0, 0), rgba(19, 32, 45, 0.9) 30%);
  position: absolute;
  bottom: 0;
  z-index: $text-layer-z-index + $dialog-z-index;
  white-space: pre-line;

  .inner-dialog {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .next-image-btn {
    $size: 10px;
    position: absolute;
    right: 0;
    bottom: 1rem;
    width: 10px;
    height: 10px;
    background: url("./assets/text-next.png");
    background-size: $size $size;
    animation: next-btn .6s linear alternate infinite;
  }

  @keyframes next-btn {
    0% {
      transform: translateY(0)
    }

    40% {
      transform: translateY(10%)
    }

    100% {
      transform: translateY(50%)
    }
  }
}

.content {
  --font-size: 2rem;
  margin-top: 1.5%;
  color: white;
  font-size: var(--font-size);
  line-height: 1.5em;
}

.container {
  font-family: 'TJL', 'Microsoft YaHei', 'PingFang SC', -apple-system, system-ui,
    'Segoe UI', Roboto, Ubuntu, Cantarell, 'Noto Sans', BlinkMacSystemFont,
    'Helvetica Neue', 'Hiragino Sans GB', Arial, sans-serif;
  position: absolute;
  user-select: none;
  overflow: hidden;

  hr {
    border: 0.1px rgba(255, 255, 255, 0.666) solid;
  }

  .container-inner {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .title-container {
    text-align: center;
    opacity: 0;
    color: white;
    z-index: $text-layer-z-index + $title-z-index;
    // $padding: 10px;
    // padding: $padding;

    .title-border {
      position: relative;
      --side-padding: 0px;
      // width: calc(100% - 2 * #{$padding} - 2 * var(--side-padding));
      height: 100%;
      // background: url("./assets/title-border.png") no-repeat;
      background-size: 100% 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      padding: var(--side-padding) 0;
      box-sizing: border-box;

      img {
        height: 95%;
      }


      .title-contain {
        --font-size: 2rem;
        position: absolute;
        left: 0;
        line-height: 1;
        font-size: var(--font-size);
        color: black;
        font-weight: 700;
        padding: var(--font-size) 0;
        width: 100%;
        background: linear-gradient(58deg,
            rgba(240, 240, 240, 0.1) 0%,
            rgba(240, 240, 240, 1) 38%,
            rgba(240, 240, 240, 0.1) 100%), url("./assets/poli-light.png") rgb(164 216 237) no-repeat 0 30%;

        .sub-title {
          font-size: calc(var(--font-size) * 0.6);
          margin-bottom: calc(var(--font-size) * 0.52);

          .sub-title-inner {
            padding: 0 5px;
            background: linear-gradient(0deg, #f6ed7e 0%, #F6ED7D 13%, transparent 13%) 0 calc(var(--font-size) * -0.12);
          }
        }

        .main-title {
          color: #4a609a;
        }
      }
    }
    :deep(.ruby) {
      position: relative;
      .rt {
        top: calc(-1 * var(--font-size) * 0.45);
      }
    }
  }

  .place-container {
    --font-size: 1rem;
    position: absolute;
    opacity: 0;
    left: 0;
    top: 10%;
    color: white;
    z-index: $text-layer-z-index + $place-z-index;

    .round-place {
      position: relative;
      line-height: var(--font-size);
      padding: calc(var(--font-size) / 2) 3rem calc(var(--font-size) / 2) 1rem;

      &:after {
        content: '';
        width: 100%;
        height: 100%;
        top: 0;
        left: -20px;
        background-color: rgba(44, 65, 92, 0.7);
        transform: skewX(-20deg);
        border-radius: 0 10px 10px 0;
        position: absolute;
        z-index: -1;
      }

      .place-content {
        padding-left: 10px;
        color: white;
        font-style: var(--font-size);

        &:after {
          content: '';
          width: 3px;
          display: block;
          height: var(--font-size);
          background-color: rgba(255, 255, 255, 0.3);
          position: absolute;
          top: 0;
          transform: translateY(50%);
        }
      }
    }
  }

  .st-container {
    z-index: $text-layer-z-index + $st-z-index;
    color: white;
    text-shadow: $text-outline;
  }

  .fade-in-out {
    animation: fade-in-out 3s;
  }

  :deep(.ruby) {
    position: relative;
    display: inline-block;
    line-height: var(--font-size);
    height: var(--font-size);
    .rb {
      display: inline-block;
      line-height: var(--font-size);
      height: var(--font-size);
    }
    .rt {
      position: absolute;
      left: 0;
      top: calc(-1 * var(--font-size) * 0.5 - 6px);
      font-size: calc(var(--font-size) * 0.5);
      width: 100%;
      text-align: center;
      line-height: 1;
    }
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

.next-episode-container {
  pointer-events: none;
  z-index: $text-layer-z-index + $next-episode-z-index;

  .next-episode-cover {
    display: block;
    height: 50%;
    width: 100%;
    background-color: black;

    &:first-child {
      transform: translateY(-100%);
    }

    &:last-child {
      transform: translateY(100%);
    }
  }
}

.to-be-continued-container {
  pointer-events: none;
  z-index: $text-layer-z-index + $to-be-continue-z-index;

  .to-be-continued-bg0,
  .to-be-continued-bg1 {
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  .to-be-continued-bg0 {
    background: #545454;
  }

  .to-be-continued-bg1 {
    transform: translateY(-100%);
    background: radial-gradient(#808080, #808080 30%, #545454 65%, #545454 100%);
  }

  .to-be-continued {
    position: absolute;
    color: white;
    text-shadow: $text-outline;
    right: -150px;
    bottom: 20px;
    opacity: 0;
  }
}

.image-video-container {
  z-index: $text-layer-z-index + $image-video-z-index;

  .image-video-container-inner {
    width: 100%;
    height: 100%;
    position: relative;

    .image-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .image {
        object-fit: contain;
        height: 70%;
        transform: translateY(10%);
      }
    }
  }
}

.loading-container {
  z-index: $text-layer-z-index + $loading-z-index;
  background-color: black;
  .loading-image {
    position: absolute;
    width: 70%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    object-fit: contain;
  }
  .loading-log {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    text-align: right;
    .loading-log-item {
      color: grey;
    }
    .loading-log-item-success {}
    .loading-log-item-error {
      color: red;
    }
  }
}

.absolute-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
