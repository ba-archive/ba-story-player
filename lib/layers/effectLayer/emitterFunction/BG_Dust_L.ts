import { usePlayerStore } from "@/stores";
import { EmitterConfigV3, Emitter } from "@pixi/particle-emitter";
import { Container, Sprite, TilingSprite } from "pixi.js";
import {
  emitterConfigs,
  emitterContainer,
  emitterHelper,
} from "../bgEffectHandlers";
import { loadSpriteSheet, sprite2TransParent } from "../util";

export async function BG_Dust_L(resources: Sprite[]) {
  // 原理是三个平铺图片不断移动, 加上火光粒子效果
  const { app } = usePlayerStore();
  const appWidth = app.view.width;
  const appHeight = app.view.height;
  let smokeContainer = new Container();
  emitterContainer.addChild(smokeContainer);
  smokeContainer.zIndex = 1;
  let smokeAnimationsName = "dust_smoke";

  let smokeSpritesheet = await loadSpriteSheet(
    resources[0],
    { x: 1, y: 2 },
    smokeAnimationsName
  );
  const smokeTexture = Reflect.get(
    smokeSpritesheet.animations,
    smokeAnimationsName
  )[0];
  const smokeTextureTilingL = new TilingSprite(smokeTexture);
  const smokeTextureTilingR = new TilingSprite(smokeTexture);
  const smokeTextureTilingR1 = new TilingSprite(smokeTexture);
  // 算出一个当前渲染中最长的长度
  const smokeWidth = Math.sqrt(appWidth * appWidth + appHeight * appHeight);
  // 高度应该是当前分切图片的高度, 暂时没法确定, 先魔法数
  const smokeHeight = 200;
  [smokeTextureTilingL, smokeTextureTilingR, smokeTextureTilingR1].forEach(
    (i) => {
      // 避免 tiling 产生的像素
      i.clampMargin = 1.5;
      i.rotation = 0.45;
      i.tint = 0x4c413f;
      i.width = smokeWidth;
      i.height = smokeHeight;
    }
  );
  smokeTextureTilingL.x = -10;
  smokeTextureTilingL.y = appHeight - smokeHeight;
  // 负数是以左上角为原点向上转角度
  smokeTextureTilingR.rotation = -0.45;
  // 放大, 避免下方出现空隙
  smokeTextureTilingR.scale.set(1.2);
  smokeTextureTilingR.x = appWidth / 2;
  smokeTextureTilingR.y = appHeight;
  // 角度高一点, 错乱一点, 避免和 R 一致, R1 是后边的图
  smokeTextureTilingR1.rotation = -0.55;
  smokeTextureTilingR1.x = appWidth / 2 - 50;
  smokeTextureTilingR1.y = appHeight - 10;
  smokeContainer.addChild(smokeTextureTilingR1);
  smokeContainer.addChild(smokeTextureTilingR);
  smokeContainer.addChild(smokeTextureTilingL);
  let smokeRemover = emitterHelper({
    update: () => {
      // 向左
      smokeTextureTilingL.tilePosition.x -= 1;
      smokeTextureTilingR.tilePosition.x += 1;
      smokeTextureTilingR1.tilePosition.x += 1;
    },
    destroy: () => {
      // 不能把函数直接赋值过去, this会变
      smokeContainer.destroy();
    },
  } as any);
  // 火光粒子特效
  let fireContainer = new Container();
  emitterContainer.addChild(fireContainer);
  fireContainer.zIndex = 100;
  const transParentSprite = resources[1];
  let fireConfig: EmitterConfigV3 = {
    ...(emitterConfigs("dust_fire") as EmitterConfigV3),
  };
  fireConfig.pos = {
    x: 30,
    y: appHeight - 20,
  };
  let fireAnimationsName = "dust_fire";
  let fireSpritesheet = await loadSpriteSheet(
    transParentSprite,
    { x: 1, y: 3 },
    fireAnimationsName
  );
  const fireTextures = Reflect.get(
    fireSpritesheet.animations,
    fireAnimationsName
  );
  // 塞入随机 texture 中
  fireConfig.behaviors[2].config.textures.push(...fireTextures);
  let fireEmitter = new Emitter(fireContainer, fireConfig);
  setTimeout(() => {
    fireEmitter.maxParticles = 15;
  }, 1500);
  let fireRemover = emitterHelper(fireEmitter);
  return async () => {
    await smokeRemover();
    await fireRemover();
  };
}
