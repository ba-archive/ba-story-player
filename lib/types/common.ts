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
  face: number,
  highlight: boolean
}

export interface CharacterEffect {
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
  name: string,
  value: string[],
  textIndex: number
}

export interface Effect {
  type: string
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
  TextCN?: string
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
  menuState: boolean,
  characters: Character[],
  characterEffect: CharacterEffect[],
  options?: Option[],
  textEffect: TextEffect[],
  text: {
    TextJp: Text[],
    TextCn?: Text[],
    TextTw?: Text[],
    TextEN?: Text[]
  },
  VoiceJp: string,
  stArgs?: [number[], string, number],
  nextChapterName?: string,
  fight?: number,
  clear?: "st" | "all",
  otherEffect?: Effect[]
}

export interface CharacterInstance {
  CharacterName: string
  instance: Spine
}

export interface ShowText {
  text: string
  CharacterName: number
}

export interface NameAndNickName {
  name: string
  nickName: string
}