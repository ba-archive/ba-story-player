import { Sprite } from "pixi.js";
import { BGEffectExcelTableItem, BGEffectType } from "./excels";

/**
 * BGEffect处理函数
 */
export type BGEffectHandlerFunction<type extends BGEffectType> = (
  resources: Sprite[],
  setting: BGEffectExcelTableItem,
  options: BGEffectHandlerOptions[type]
) => Promise<EffectRemoveFunction>;


export interface BGEffectHandlerOptions {
  BG_FocusLine: unknown;
  "": unknown;
  "BG_ScrollT_0.5": unknown;
  BG_Filter_Red: unknown;
  BG_Wave_F: unknown;
  BG_Flash: unknown;
  BG_UnderFire_R: unknown;
  BG_Love_L: unknown;
  "BG_ScrollB_0.5": unknown;
  BG_Rain_L: {
    frequency: number;
  };
  BG_UnderFire: unknown;
  BG_WaveShort_F: unknown;
  BG_SandStorm_L: unknown;
  "BG_ScrollT_1.5": unknown;
  BG_Shining_L: unknown;
  "BG_ScrollB_1.0": unknown;
  BG_Love_L_BGOff: unknown;
  BG_Dust_L: unknown;
  "BG_ScrollL_0.5": unknown;
  "BG_ScrollL_1.0": unknown;
  BG_Ash_Black: unknown;
  BG_Mist_L: unknown;
  BG_Flash_Sound: unknown;
  "BG_ScrollL_1.5": unknown;
  "BG_ScrollR_1.5": unknown;
  BG_Shining_L_BGOff: unknown;
  "BG_ScrollT_1.0": unknown;
  "BG_ScrollB_1.5": unknown;
  BG_Filter_Red_BG: unknown;
  BG_Ash_Red: unknown;
  BG_Fireworks_L_BGOff_02: unknown;
  "BG_ScrollR_0.5": unknown;
  BG_Snow_L: unknown;
  BG_Fireworks_L_BGOff_01: unknown;
  "BG_ScrollR_1.0": unknown;
}


/**
 * 类型与处理函数的对应
 */
export type BGEffectHandlers = {
  [key in BGEffectType]: BGEffectHandlerFunction<key>;
};



export type BGEffectImgTable = Record<BGEffectType, string[]>;



export type CurrentBGEffect =
  | {
    effect: BGEffectType;
    removeFunction: EffectRemoveFunction;
    resources: Sprite[];
  }
  | undefined;


export type EffectRemoveFunction = () => Promise<void>;
