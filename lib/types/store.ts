import { Application, LoaderResource, Sprite } from "pixi.js"
import { CharacterInstance, Dict, StoryUnit, Speaker } from "./common"
import { ShowText } from './events'
import { BGMExcelTableItem, BGNameExcelTableItem, CharacterNameExcelTableItem, TransitionTableItem } from "./excels"
import { Text, TextEffect } from '@/types/common'
import { ShowOption } from '@/types/events'

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
   * 当前在故事中的坐标
   */
  currentStoryIndex: number
  /**
   * spine资源
   */
  loadRes: Dict<LoaderResource> | null

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
  characterNameTable: { [index: string]: number },
  /**
   * 根据BGName获取资源信息, 包括l2d和背景图片
   */
  BGNameExcelTable: { [index: number]: BGNameExcelTableItem },
  /**
   * 根据CharacterName获取角色name和nickName(名字与所属)
   */
  CharacterNameExcelTable: { [index: number]: CharacterNameExcelTableItem }
  /**
   * 根据bgm id获取bgm资源信息
   */
  BGMExcelTable: { [index: number]: BGMExcelTableItem }
  /**
   * 根据transition标识获取transition相关信息
   */
  TransitionExcelTable: { [index: number]: TransitionTableItem }
  /**
   * 根据emotion名获取emotion图片信息
   */
  emotionResourcesTable: { [index: string]: string[] },
  fxImageTable: { [index: string]: string[] },
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
  currentStoryUnit: StoryUnit

  speaker: Speaker | undefined

  storySummary: string

  CharacterName: (name: string) => number

  text: Text[]

  textEffect: TextEffect[]

  option: ShowOption[]

  currentSpeakerCharacterName: number

  /**
   * 获取角色spineData
   */
  characterSpineData: (CharacterName: number) => import('@pixi-spine/base').ISkeletonData | undefined,
  /**
   * 获取情绪图像资源
   * @param emotionName 情绪名
   * @returns 情绪资源图片url数组, 按从底而上, 从左到右排列
   */
  emotionResources: (emotionName: string) => string[]
  /**
   * 获取fx特效图像资源
   * @param fxName 
   * @returns 图像资源url数组
   */
  fxImages: (fxName: string) => string[]

  /**
   * 获取背景图片的url, 如果对应的BGName不是背景图片则返回空字符串
   */
  bgUrl: string
  /**
   * 获取bgm链接, 无bgm时返回空链接
   */
  bgmUrl: string
  /**
   * 获取bgm相关参数
   */
  bgmArgs: BGMExcelTableItem | undefined
  /**
   * 获取效果音url
   */
  soundUrl: string
  emotionSoundUrl: (emotionName: string) => string
  l2dCharacterName: string,
  /**
   * 获取L2D资源
   */
  l2dSpineData: import('@pixi-spine/base').ISkeletonData | undefined,
  /**
   * 获取L2D动作名
   */
  l2dAnimationName: string
}

export type GetterFunctions = {
  [Getter in keyof BasicGetters]: () => BasicGetters[Getter]
}
export type Getters = Readonly<BasicGetters>

export interface Actions {
  setBgInstance: (sprite: Sprite) => void
  /**
   * 直接进入相邻的故事节点, 到最后则返回false
   */
  storyIndexIncrement: () => boolean
  /**
   *  根据选项结果进入下一个故事节点, 不存在该节点则返回false
   */
  select: (option: number) => boolean
  /**
   * 设置logText的值, 即已经显示过的文字
   * @param logText 
   * @returns 
   */
  setLogText: (logText: ShowText[]) => void
}
