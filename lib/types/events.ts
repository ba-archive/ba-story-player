import { Character, Effect, Speaker, Text, TextEffect } from "./common"
import { BGEffectExcelTableItem, BGMExcelTableItem, TransitionTableItem } from "./excels"

export type Events = {
  //通用

  /**
   * 清除当前内容
   */
  hide: undefined
  /**
   * 特效播放完毕
   */

  //特效层

  /**
   * 播饭特效
   */
  playEffect: PlayEffect
  effectDone: undefined
  transitionIn: TransitionTableItem
  transitionOut: TransitionTableItem
  /**
   * 人物完成展示
   */

  //人物层

  /**
   * 展示人物
   */
  showCharacter: ShowCharacter
  /**
   * 人物已处理完毕
   */
  characterDone: undefined

  //背景层

  /**
   * 展示背景图片
   */
  showBg: string

  //声音层

  /**
   * 播放bgm, sound或voiceJP
   */
  playAudio: PlayAudio
  /**
   * 播放人物情绪动作特效音
   */
  playEmotionAudio: string

  //UI层

  /**
   * 跳过剧情
   */
  skip: undefined
  /**
   * 自动模式切换
   */
  auto: undefined
  hidemenu: undefined
  showmenu: undefined

  //文字层
  /**
   * 展示标题
   */
  showTitle: string
  /**
   * 展示地点
   */
  showPlace: string
  /**
   * 显示普通对话框文字
   */
  showText: ShowText
  /**
   * 显示无对话框文字
   */
  st: StText
  /**
   * 清除无对话框文字和对话框
   */
  clearSt: undefined
  /**
   * 显示选项
   */
  option: ShowOption[]
  /**
   * 进入下一剧情语句
   */
  next: undefined
  /**
   * 根据选项加入下一剧情语句
   */
  select: number

  //L2D层
  /**
   * 加载L2D
   */
  playL2D: undefined
  /**
   * 更换动画
   */
  changeAnimation: string
  /**
   * 结束l2d播放
   */
  endL2D: undefined
}

export interface ShowCharacter {
  /**
   * 角色列表
   */
  characters: Character[]
  /**
   * 角色特效
   */
  // characterEffects: CharacterEffect[]
}

export interface PlayAudio {
  bgm?: {
    url?: string
    bgmArgs: BGMExcelTableItem
  }
  soundUrl?: string
  voiceJPUrl?: string
}

export interface ShowText {
  /**
   * 文本
   */
  text: Text[]
  /**
   * 说话的人, 包括名字和所属
   */
  speaker?: Speaker
}

/**
 * st特效参数, 第一个为位置, 第二个为显示效果
 */
export type StArgs = [number[], 'serial' | 'instant', number]

export interface StText {
  /**
   * 文本
   */
  text: Text[]
  /**
   * st的参数, 目前只需要注意第二个参数, serial打字机效果, instant立即全部显示.
   */
  stArgs: StArgs,
}

export interface ShowOption {
  /**
   * 剧情原始结构SelectionGroup, 请作为next的参数
   */
  SelectionGroup: number,
  /**
   * 选项文本
   */
  text: string
}

export interface PlayEffect {
  BGEffect?: BGEffectExcelTableItem
  otherEffect: Effect[]
}
