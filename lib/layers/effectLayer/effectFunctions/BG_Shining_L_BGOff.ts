import { usePlayerStore } from "@/stores";
import { Emitter, EmitterConfigV3 } from "@pixi/particle-emitter";
import { Container, filters, Rectangle, Sprite, Texture } from "pixi.js";
import { emitterConfigs, emitterStarter } from "../emitterUtils";
import { getEmitterType, sprite2TransParent } from "../resourcesUtils";

export default async function BG_Shining_L_BGOff(resources: Sprite[]) {
  // 原理是波纹
  const { app } = usePlayerStore();
  const appWidth = app.view.width;
  const appHeight = app.view.height;
  // 波纹特效
  let emitterContainer = new Container();
  app.stage.addChild(emitterContainer);
  emitterContainer.zIndex = -1;
  let ringConfig: EmitterConfigV3 = {
    ...(emitterConfigs("shining_ring") as EmitterConfigV3),
  };
  const ringSprite = sprite2TransParent(resources[0]);
  getEmitterType(ringConfig, "textureRandom").config.textures.push(
    ringSprite.texture
  );
  getEmitterType(ringConfig, "spawnShape").config.data.w = appWidth;
  getEmitterType(ringConfig, "spawnShape").config.data.h = appHeight;
  const ringTextureWidth = resources[0].texture.width;
  const ringBaseRatio = (0.7 * appWidth) / ringTextureWidth;
  const ringScaleConfig = getEmitterType(ringConfig, "scale").config;
  ringScaleConfig.scale.list[0].value = ringBaseRatio * 0.9;
  ringScaleConfig.scale.list[1].value = ringBaseRatio;
  const ringEmitter = new Emitter(emitterContainer, ringConfig);
  const ringRemover = emitterStarter(ringEmitter);
  return async () => {
    await ringRemover();
  };
}
