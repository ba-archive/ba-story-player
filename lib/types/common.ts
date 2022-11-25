import type { Spine } from 'pixi-spine'
import {CharacterEffectWord, EmotionWord, FXEffectWord, SignalEffectWord} from "@/types/characterLayer";
export type StoryType = "title" | "place" | "text" | "option" | "st" | "effectOnly" | 'continue'

export type Dict<T> = {
  [key: string]: T;
};


export interface Text {
  /**
   * 文本
   */
  content: string
  /**
   * 显示文本前等待的时间
   */
  waitTime?: number
}

export interface Character {
  /**
   * 人物位置
   */
  position: number,
  /**
   * 人物CharacterName, 请通过它获取人物spinedata
   */
  CharacterName: number,
  /**
   * 人物表情
   */
  face: string,
  /**
   * 人物是否高亮
   */
  highlight: boolean
}

export interface CharacterEffect {
  type:'emotion'|'action'|'fx'|'signal'
  target: number,
  effect: EmotionWord | CharacterEffectWord | FXEffectWord | SignalEffectWord | string,
  async: boolean
}

export interface Option {
  SelectionGroup: number,
  text: {
    TextJp: string,
    TextCn?: string,
    TextTw?: string,
    TextEn?: string
  }
}

export interface TextEffect {
  /**
   * 特效类型, 
   * `color`颜色
   * `fontsize` 字体大小
   * `ruby` 日文注音
   */
  name: 'color'|'fontsize'|'ruby',
  /**
   * 特效参数
   */
  value: string[],
  /**
   * 特效作用的text的index
   */
  textIndex: number
}

export interface Effect {
  type: 'wait'|'zmc' |'bgshake'
  args: Array<string>
}

export interface StoryRawUnit {
  GroupId: number
  SelectionGroup: number
  BGMId: number
  Sound: string
  Transition: number
  BGName: number
  BGEffect: number
  PopupFileName: string
  ScriptKr: string
  TextJp: string
  TextCn?: string
  TextTw?: string
  TextEn?: string
  VoiceJp: string
}

export interface StoryUnit {
  GroupId: number,
  SelectionGroup: number,
  BGMId: number,
  Sound: string,
  Transition: number,
  BGName: number,
  BGEffect: number
  PopupFileName: string,
  type: StoryType,
  characters: Character[],
  characterEffect: CharacterEffect[],
  options?: Option[],
  textEffect:{
    TextJp: TextEffect[],
    TextCn?: TextEffect[],
    TextTw?: TextEffect[],
    TextEN?: TextEffect[]
  },
  text: {
    TextJp: Text[],
    TextCn?: Text[],
    TextTw?: Text[],
    TextEN?: Text[]
  },
  VoiceJp: string,
  stArgs?: string[]
  nextChapterName?: string,
  fight?: number,
  clearSt?: boolean,
  hide?:'menu'|'all'
  show?:'menu'
  otherEffect: Effect[]
  naName?:string
}

export interface CharacterInstance {
  CharacterName: number;
  instance: Spine;
  isShow: () => boolean;
  isOnStage: () => boolean;
  isHeightLight: () => boolean;
}

export interface Speaker {
  /**
   * 人物姓名
   */
  name: string
  /**
   * 人物所属
   */
  nickName: string
}
