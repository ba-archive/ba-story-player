import { Application, Sprite } from "pixi.js"
import { CharacterInstance, StoryUnit } from "./common"
import { ShowText } from './events'
import { BGEffectExcelTableItem, BGMExcelTableItem, BGNameExcelTableItem, CharacterNameExcelTableItem, TransitionTableItem } from "./excels"
import { OtherSounds } from "./resources"

export type Language = 'Cn' | 'Jp'

/**
 * 仅可通过函数修改的state
 */
export interface PrivateStates {
  /**
   * pixi.js app实例
   */
  app: Application | null
  /**
   * 后端资源前缀
   */
  dataUrl: string
  /**
   * 用户名, 如xx老师
   */
  userName: string
  language: Language
  /**
   * 当前故事, 由一个个单元结合而成
   */
  allStoryUnit: StoryUnit[]
  /**
   * 用于查找l2d spinedata
   */
  l2dSpineUrl: string

  //背景层
  /**
   * 背景实例
   */
  bgInstance: null | Sprite

  //文字层
  /**
   * 已经展示过的语句的集合, 用于ui层显示日志
   */
  logText: ShowText[],


  //资源管理
  /**
   * 角色韩文名对应唯一数字标识CharacterName
   */
  characterNameTable: Map<string, number>
  /**
   * 根据BGName获取资源信息, 包括l2d和背景图片
   */
  BGNameExcelTable: Map<number, BGNameExcelTableItem>,
  /**
   * 根据CharacterName获取角色name和nickName(名字与所属)
   */
  CharacterNameExcelTable: Map<number, CharacterNameExcelTableItem>
  /**
   * 获取BGEffect
   */
  BGEffectExcelTable: Map<number, BGEffectExcelTableItem>

  /**
   * 根据bgm id获取bgm资源信息
   */
  BGMExcelTable: Map<number, BGMExcelTableItem>
  /**
   * 根据transition标识获取transition相关信息
   */
  TransitionExcelTable: Map<number, TransitionTableItem>
  /**
   * 根据emotion名获取emotion图片信息
   */
  emotionResourcesTable: Map<string, string[]>,
  fxImageTable: Map<string, string[]>,
}

/**
 * 可直接修改的state
 */
export interface PublicStates {
  //人物层
  currentCharacterMap: Map<number, CharacterInstance>

}


export interface BasicGetters {
  app: Application

  /**
   * 故事简要概述
   */
  storySummary: string

  CharacterName: (name: string) => number | undefined

  /**
   * 获取角色spineData
   */
  characterSpineData: (CharacterName: number) => import('@pixi-spine/base').ISkeletonData | undefined,
  /**
   * 获取情绪图像资源
   * @param emotionName 情绪名
   * @returns 情绪资源图片url数组, 按从底而上, 从左到右排列
   */
  emotionResources: (emotionName: string) => string[] | undefined
  /**
   * 获取fx特效图像资源
   * @param fxName 
   * @returns 图像资源url数组
   */
  fxImages: (fxName: string) => string[] | undefined

  emotionSoundUrl: (emotionName: string) => string
  /**
   * 获取其他特效音url
   * @param type 特效音类型, 如select
   * @returns 
   */
  otherSoundUrl: (type: OtherSounds) => string
  /**
   * 获取L2D资源
   */
  l2dSpineData: import('@pixi-spine/base').ISkeletonData | undefined,
}

export type GetterFunctions = {
  [Getter in keyof BasicGetters]: () => BasicGetters[Getter]
}
export type Getters = Readonly<BasicGetters>

export interface Actions {
  setBgInstance: (sprite: Sprite) => void
  /**
   * 设置logText的值, 即已经显示过的文字
   * @param logText 
   * @returns 
   */
  setLogText: (logText: ShowText[]) => void
  /**
   * 设置l2d的spine数据地址便于l2d层获取spinedata
   * @param url 
   * @returns 
   */
  setL2DSpineUrl: (url: string) => void
}
