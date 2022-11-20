import type { Spine } from 'pixi-spine'
export type StoryType = "title" | "place" | "text" | "option" | "st" | "effectOnly" | 'continue'

export type Dict<T> = {
  [key: string]: T;
};


export interface Text {
  content: string
  waitTime?: number
}

export interface Character {
  position: number,
  CharacterName: number,
  face: string,
  highlight: boolean
}

export interface CharacterEffect {
  type:'emotion'|'action'|'signal'|'fx'
  target: number,
  effect: string,
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
  name: 'color'|'fontsize'|'ruby',
  value: string[],
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
}

export interface ShowText {
  text: string
  CharacterName: number
}

export interface Speaker {
  name: string
  nickName: string
}
