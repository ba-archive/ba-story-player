import { Character, CharacterEffect, Option, TextEffect, Text, Speaker, Effect } from "./common"

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
  showmenu:undefined

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
  endL2D: undefined
}

export interface ShowCharacter {
  characters: Character[]
  characterEffects: CharacterEffect[]
}

export interface PlayAudio {
  bgmUrl?: string
  soundUrl?: string
  voiceJPUrl?: string
}

export interface ShowText {
  text: Text[]
  textEffect: TextEffect[]
  speaker?: Speaker
}

export interface StText {
  text: Text[]
  textEffect: TextEffect[]
  stArgs: string[]
}

export interface ShowOption {
  SelectionGroup: number,
  text: string
}

export interface PlayEffect {
  BGEffect?: number
  Transition?: number
  otherEffect?: Effect[]
}