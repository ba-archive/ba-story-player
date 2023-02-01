import { Spine } from "pixi-spine";
import eventBus from "@/eventBus";
import { usePlayerStore } from "@/stores";
import { getResourcesUrl } from "@/utils";
import { Application } from "pixi.js";

export function L2DInit() {
  const { app } = usePlayerStore();
  // 主要播放 spine
  let mainItem: Spine;
  // 背景混合或者其他播放 spine, 如普通星野和运动邮箱
  let otherItems: Spine[];
  // 当前顶层的spine index
  let currentIndex: number = 100;
  let startAnimations: {animation: string; spine: Spine}[]
  // 接收动画消息
  eventBus.on("changeAnimation", (e) => {
    const temAnimation = e.replace(/_(A|M)/, '')
    const devAnimation = mainItem.spineData.animations.find(i=>i.name.includes(temAnimation))
    if(devAnimation){
      mainItem.state.setAnimation(1, devAnimation.name, false);
    }else{
      console.error('不存在对应dev动画')
      mainItem.state.setAnimation(1, e, false);
    }
  });
  // 停止
  eventBus.on("endL2D", () => {
    app.stage.removeChild(mainItem);
  });
  // 播放live2D
  eventBus.on("playL2D", () => {
    const { l2dSpineData, curL2dConfig } = usePlayerStore();
    // 动画是否已经播放, true 代表播放完成
    const hasPlayedAnimation = {} as { [key: string]: boolean };
    // 设置 spine 播放信息
    function setSpinePlayInfo({ item }: { item: Spine }) {
      const { width, height } = calcL2DSize(
        item.width,
        item.height,
        app.renderer.width,
        app.renderer.height
      );
      // 设置位置, 大小
      item = Object.assign(item, {
        x: app.renderer.width / 2,
        y: app.renderer.height,
        width,
        height,
      });
      item.zIndex = currentIndex;
      // 添加到spine
      app.stage.addChild(item);
      item.state.addListener({
        // spine中事件回调
        start: function (entry: any) {
          debugger
          const entryAnimationName = entry.animation.name + entry.name;
          // 如果没有播放过的话就设置播放状态为播放
          if (!hasPlayedAnimation[entryAnimationName]) {
            eventBus.emit("l2dAnimationDone", {done: false, animation: entryAnimationName});
            hasPlayedAnimation[entryAnimationName] = true;
          }
        },
        complete: function (entry: any) {
          const entryAnimationName = entry.animation.name + entry.name;
          if (
            entryAnimationName.includes("Idle") &&
            startAnimations.length > 0
          ) {
            const curStartAnimations = startAnimations.shift()!;
            // 待机动画 Idle 循环播放, 为空时代表起始动画播放完成, 开始播放待机动画
            let e = curStartAnimations.spine.state.setAnimation(
              0,
              curStartAnimations.animation,
              startAnimations.length === 0
            );
            return;
          }
          // TODO: 是否播放完可以下一步
          eventBus.emit("l2dAnimationDone", {done: true, animation: entryAnimationName});
          // 0轨道, 空动画, 待机动画跳过
          if (
            entry.trackIndex == 0 ||
            entryAnimationName.includes("<empty>") ||
            entryAnimationName.includes("Idle_01")
          ) {
            return;
          }

          if (entryAnimationName.indexOf("_Talk_") >= 0) {
            // 说话动作结束后设为待机
            let e = item.state.setAnimation(entry.trackIndex, "Idle_01", true);
            // 跳转到下一个动画的过场
            e!.mixDuration = 0.8;
          } else {
            // 结束后动作置空
            item.state.setEmptyAnimation(entry.trackIndex, 0.8);
          }
        },
      });
    }
    mainItem = new Spine(l2dSpineData!);
    // 设置名字区分
    mainItem.name = curL2dConfig?.name || ''
    if (curL2dConfig?.otherSpine) {
      otherItems = curL2dConfig.otherSpine.map((i) => {
        const temItem = new Spine(
          app.loader.resources[getResourcesUrl("otherL2dSpine", i)].spineData!
        );
        temItem.name = i;
        setSpinePlayInfo({ item: temItem });
        return temItem;
      });
    }
    setSpinePlayInfo({ item: mainItem });
    // 起始动画
    startAnimations = [
      ...mainItem.spineData.animations
        .map((i) => i.name)
        .filter((i) => i.startsWith("Start_Idle"))
        .sort(),
      "Idle_01",
    ].map((i) => {
      return {
        animation: i,
        spine: mainItem,
      };
    });
    if (curL2dConfig?.playQue) {
      startAnimations = curL2dConfig.playQue.map((i) => {
        return {
          animation: i.animation,
          // playQue 中的name和otherSpine中的一致
          spine:
            i.name === curL2dConfig.name
              ? mainItem
              : otherItems.find((j) => j.name === i.name)!,
        };
      });
    }
    // 0轨道播放待机 部分没有做待机的动画,用try兜底避免throw
    try {
      const curStartAnimations = startAnimations.shift()!;
      curStartAnimations.spine.state.setAnimation(
        0,
        curStartAnimations.animation,
        false
      );
    } catch {}
  });
}
/**
 * 计算 l2d 样式尺寸 - utils
 */
function calcL2DSize(
  rawWidth: number,
  rawHeight: number,
  viewportWidth: number,
  viewportHeight: number
) {
  const ratio = Math.min(rawWidth / viewportWidth, rawHeight / viewportHeight);
  // 稍微放大点完全遮住
  const width = (rawWidth / ratio) * 1.05; // 1.05 是根据l2d呼吸时最小和正常的比例推测得到的
  const height = (rawHeight / ratio) * 1.05;
  return { width, height, ratio };
}
