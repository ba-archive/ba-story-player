/**
 * 初始化背景层, 订阅player的剧情信息.
 */
import { Sprite, LoaderResource } from "pixi.js";

import { BgLayer } from "@/types/bgLayer";
import { Dict } from "@/types/common";
import { usePlayerStore } from "@/stores";
import eventBus from "@/eventBus";

export function bgInit() {
  return BgLayerInstance.init();
}

const BgLayerInstance: BgLayer = {
  /**
   * 注册/销毁实例
   */
  init() {
    this.initEvent();
  },
  dispose() {
    this.disposeEvent();
  },

  /**
   * 注册/销毁事件监听
   */
  initEvent() {
    this.handleShowBg = this.handleShowBg.bind(this);

    eventBus.on("showBg", this.handleShowBg);
  },
  disposeEvent() {
    eventBus.off("showBg", this.handleShowBg);
  },

  /**
   * 事件监听处理函数
   */
  handleShowBg(name: string) {
    const { app, bgInstance: oldInstance, setBgInstance } = usePlayerStore();
    const { loader } = app;

    loader.load((loader, resources) => {
      const instance = this.getBgSpriteFromResource(resources, name);

      if (instance) {
        app.stage.addChild(instance);
        oldInstance && app.stage.removeChild(oldInstance);
        setBgInstance(instance);
      }
    });
  },

  /**
   * 方法
   */
  getBgSpriteFromResource(resources: Dict<LoaderResource>, name: string) {
    const { app } = usePlayerStore();
    let sprite: Sprite | null = null;

    if (!resources[name]) {
      console.error(`can't find resource: ${name}`);
      return;
    }

    sprite = new Sprite(resources[name].texture);

    const { x, y, width, height } = calcImageCoverSize(
      sprite.width,
      sprite.height,
      app.renderer.width,
      app.renderer.height
    );
    sprite = Object.assign(sprite, { x, y, width, height });

    return sprite;
  },
};

/**
 * 计算图片 cover 样式尺寸 - utils
 */
function calcImageCoverSize(
  rawWidth: number,
  rawHeight: number,
  viewportWidth: number,
  viewportHeight: number
) {
  const ratio = Math.min(rawWidth / viewportWidth, rawHeight / viewportHeight);
  const width = rawWidth / ratio;
  const height = rawHeight / ratio;
  const x = (viewportWidth - width) / 2;
  const y = (viewportHeight - height) / 2;

  return { x, y, width, height, ratio };
}
