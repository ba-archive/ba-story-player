import type { Spine } from 'pixi-spine';
import { PlayAudio, PlayEffect, ShowOption, ShowText, StArgs } from './events';
import { BGEffectExcelTableItem, TransitionTableItem } from './excels';
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
  /**
   * 文字特效
   */
  effects: TextEffect[]
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
   * 人物spinedata的url
   */
  spineUrl: string,
  /**
   * 人物表情
   */
  face: string,
  /**
   * 人物是否高亮
   */
  highlight: boolean
  /**
   * 人物是否是全息投影状态
   */
  signal: boolean
  /**
   * 人物特效
   */
  effects: CharacterEffect[]
}

export type CharacterEffectType = 'emotion' | 'action' | 'fx';

export interface CharacterEffect {
  type: CharacterEffectType;
  effect: string
  async: boolean
  arg?: string
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
  name: 'color' | 'fontsize' | 'ruby',
  /**
   * 特效参数
   */
  value: string[],
}

export interface Effect {
  type: 'wait' | 'zmc' | 'bgshake'
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
  //rawUnit中的属性
  GroupId: number,
  SelectionGroup: number,
  PopupFileName: string,

  type: StoryType,
  audio?: PlayAudio
  /**
   * 渐变
   */
  transition?: TransitionTableItem,
  /**
   * 背景图片
   */
  bg?: {
    url: string,
    /**
     * 以覆盖原来背景的方式显示, 值为渐变时间
     */
    overlap?: number,
  },
  l2d?: {
    spineUrl: string
    animationName: string
  },
  effect: PlayEffect
  characters: Character[],
  /**
   * 文字相关的属性, 包括选项, 对话, st文字, 章节名, 人物名
   */
  textAbout: {
    options?: ShowOption[],
    /**
     * 当内容为一个单词时填入, 如地点, 标题, 章节名
     */
    word?: string
    /**
     * 显示的对话文字
     */
    showText: ShowText,
    st?: {
      stArgs?: StArgs
      clearSt?: boolean,
    }
  }
  fight?: number,
  hide?: 'menu' | 'all'
  show?: 'menu'
  video?: {
    videoPath: string
    soundPath: string
  }
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
