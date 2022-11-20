import { PiniaCustomStateProperties, _GettersTree } from "pinia"
import { Application, LoaderResource, Sprite } from "pixi.js"
import { UnwrapRef } from "vue"
import { CharacterInstance, Dict, StoryUnit, ShowText, Speaker } from "./common"
import { BGMExcelTableItem, BGNameExcelTableItem, CharacterNameExcelTableItem } from "./excels"
import {Text,TextEffect} from '@/types/common'
import {ShowOption} from '@/types/events'

export interface State {
  _app: null | Application
  dataUrl:string
  userName:string
  language:'Cn'|'Jp'
  allStoryUnit: StoryUnit[]
  currentStoryIndex:number
  characterNameTable: { [index: string]: number },
  loadRes: null | Dict<LoaderResource>,

  currentCharacterMap: Map<number, CharacterInstance>

  //背景层
  _bgInstance: null | Sprite

  //文字层
  _logText: ShowText[],

  //保证特效播放完成
  effectDone: boolean,
  characterDone: boolean,

  //资源管理
  BGNameExcelTable: { [index: number]: BGNameExcelTableItem },
  CharacterNameExcelTable: { [index: number]: CharacterNameExcelTableItem }
  BGMExcelTable: { [index: number]: BGMExcelTableItem }

  //
  l2dCharacterName:string
}

type GetterState = UnwrapRef<State> & UnwrapRef<PiniaCustomStateProperties<State>>

export interface Getters extends _GettersTree<State> {
  app: (state: GetterState) => Application
  currentStoryUnit:(state:GetterState)=>StoryUnit

  bgInstance: (state: GetterState) => Sprite | null
  logText: (state: GetterState) => ShowText[]
  speaker: (state: GetterState) =>  Speaker|undefined

  storySummary: (state: GetterState) => string

  CharacterName: (state: GetterState) => (name: string) => number

  CharacterNumber2Name: (state: GetterState) => (name: number) => string

  text:(state:GetterState)=>Text[]

  textEffect:(state:GetterState)=>TextEffect[]

  option:(state:GetterState)=>ShowOption[]

  currentSpeakerCharacterName:(state:GetterState)=>number

  /**
   * 获取角色spineData
   */
  characterSpineData: (state: GetterState) => (CharacterName: number) => import('@pixi-spine/base').ISkeletonData | undefined,

  /**
   * 获取背景图片的url, 如果对应的BGName不是背景图片则返回空字符串
   */
  bgUrl: (state: GetterState) => string
  bgmUrl: (state: GetterState) => string
  soundUrl: (state: GetterState) => string
  /**
   * 获取L2D资源
   */
  l2dSpineData: (state: GetterState) => import('@pixi-spine/base').ISkeletonData | undefined,
  isL2d:(state:GetterState)=>boolean
  /**
   * 获取L2D动作名
   */
  l2dAnimationName: (state: GetterState) => string
}

export interface Actions {
  nextInit: () => void
}
