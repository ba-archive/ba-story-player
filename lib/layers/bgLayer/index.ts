/**
 * 初始化背景层, 订阅player的剧情信息.
 */
import { Sprite, LoaderResource } from "pixi.js";
import gsap from "gsap";

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
    eventBus.on("resize", this.handleResize)
  },
  disposeEvent() {
    eventBus.off("showBg", this.handleShowBg);
  },

  /**
   * 事件监听处理函数
   */
  handleShowBg({ url, overlap }) {
    const { app: { loader } } = usePlayerStore();

    loader.load((loader, resources) => {
      const instance = this.getBgSpriteFromResource(resources, url);

      if (instance) {
        if (overlap) {
          this.loadBgOverlap(instance, overlap);
        } else {
          this.loadBg(instance);
        }
      }
    });
  },

  handleResize() {
    const { bgInstance, app } = usePlayerStore()
    if (bgInstance) {
      const { x, y, width, height } = calcImageCoverSize(
        bgInstance.width,
        bgInstance.height,
        app.renderer.width,
        app.renderer.height
      );
      bgInstance.position.set(x, y)
      bgInstance.width = width
      bgInstance.height = height
    }
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
  loadBg(instance: Sprite) {
    const { app, bgInstance: oldInstance, setBgInstance } = usePlayerStore();

    instance.zIndex = -100 // 背景层应该在特效, 人物层之下
    app.stage.addChild(instance);
    setBgInstance(instance);

    oldInstance && app.stage.removeChild(oldInstance);
  },
  async loadBgOverlap(instance: Sprite, overlap: number) {
    const { app, bgInstance: oldInstance, setBgInstance } = usePlayerStore();
    let tl = gsap.timeline();
    instance.zIndex = -99

    app.stage.addChild(instance);
    setBgInstance(instance);

    await tl
      .fromTo(instance, { alpha: 0 }, { alpha: 1, duration: overlap / 1000 })
    eventBus.emit('bgOverLapDone')

    oldInstance && app.stage.removeChild(oldInstance);
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
  // 整体 scale 1.02 倍 (bgshake)
  const ratio = Math.min(
    rawWidth / (viewportWidth * 1.15),
    rawHeight / (viewportHeight * 1.15)
  );
  const width = rawWidth / ratio;
  const height = rawHeight / ratio;
  const x = (viewportWidth - width) / 2;
  const y = (viewportHeight - height) / 2;

  return { x, y, width, height, ratio };
}
