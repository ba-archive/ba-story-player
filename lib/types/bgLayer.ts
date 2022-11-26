import { LoaderResource, Sprite } from "pixi.js";

import { Dict } from "@/types/common";

export interface BgLayer {
  /**
   * 初始化 BgLayer 实例函数
   */
  init(): void;
  /**
   * 销毁 BgLayer 实例函数
   */
  dispose(): void;
  /**
   * 初始化实例事件
   */
  initEvent(): void;
  /**
   * 销毁实例事件
   */
  disposeEvent(): void;
  /**
   * showBg 事件处理函数
   * @param name 背景图片名
   */
  handleShowBg(name: string): void;
  /**
   * 从 Loader Resource 获取背景 Sprite
   * @param resources loader resources
   * @param name 背景图片名
   */
  getBgSpriteFromResource(
    resources: Dict<LoaderResource>,
    name: string
  ): Sprite | undefined;
}
