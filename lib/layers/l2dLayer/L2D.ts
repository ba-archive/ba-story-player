import { Spine } from "pixi-spine";
import eventBus from "@/eventBus";
import { usePlayerStore } from "@/stores";

export function L2DInit() {
  const { app } = usePlayerStore();
  let item: Spine;
  // 当前顶层的spine index
  let currentIndex: number = 100;

  // 接收动画消息
  eventBus.on("changeAnimation", (e) => {
    item.state.setAnimation(1, e, false);
  });
  // 停止
  eventBus.on("endL2D", () => {
    app.stage.removeChild(item);
  });
  // 播放live2D
  eventBus.on("playL2D", () => {
    const { l2dSpineData } = usePlayerStore();
    item = new Spine(l2dSpineData!);
    // 动画是否已经播放, true 代表播放完成
    const hasPlayedAnimation = {} as { [key: string]: boolean };
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
    // 起始动画
    const startAnimations = item.spineData.animations
      .map((i) => i.name)
      .filter((i) => i.startsWith("Start_Idle"))
      .sort();
    startAnimations.push("Idle_01");
    // 添加到spine
    app.stage.addChild(item);
    // 0轨道播放待机 部分没有做待机的动画,用try兜底避免throw
    try {
      item.zIndex = currentIndex;
      item.state.setAnimation(0, startAnimations.shift()!, false);
      item.state.addListener({
        // spine中事件回调
        start: function (entry: any) {
          const entryAnimationName = entry.animation.name;
          // 如果没有播放过的话就设置播放状态为播放
          if (!hasPlayedAnimation[entryAnimationName]) {
            eventBus.emit("l2dAnimationDone", false)
            hasPlayedAnimation[entryAnimationName] = true;
          }
        },
        complete: function (entry: any) {
          const entryAnimationName = entry.animation.name;
          if (
            entryAnimationName.includes("Idle") &&
            startAnimations.length > 0
          ) {
            // 待机动画 Idle 循环播放, 为空时代表起始动画播放完成, 开始播放待机动画
            let e = item.state.setAnimation(
              0,
              startAnimations.shift()!,
              startAnimations.length === 0
            );
            return;
          }
          // TODO: 是否播放完可以下一步
          eventBus.emit("l2dAnimationDone", true);
          // 0轨道, 空动画, 待机动画跳过
          if (
            entry.trackIndex == 0 ||
            entryAnimationName == "<empty>" ||
            entryAnimationName == "Idle_01"
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
