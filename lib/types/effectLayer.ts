import { Sprite } from "pixi.js";
import { BGEffectExcelTableItem, BGEffectType } from "./excels";

type BasicBGEffectHandlerOptions = Record<BGEffectType, Record<string, any>>

export type BGEffectImgTable=Record<BGEffectType,string[]>

export interface BGEffectHandlerOptions extends BasicBGEffectHandlerOptions{
  "BG_FocusLine": {
    testOption: number
  }
}

/**
 * BGEffect处理函数
 */
export type BGEffectHandlerFunction<type extends BGEffectType> = (resources: Sprite[], setting: BGEffectExcelTableItem, options: BGEffectHandlerOptions[type]) => Promise<void>

/**
 * 类型与处理函数的对应
 */
export type BGEffectHandlers = {
  [key in BGEffectType]: BGEffectHandlerFunction<key>
}