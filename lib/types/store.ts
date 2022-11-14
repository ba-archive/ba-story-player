import { Emitter } from "mitt"
import { PiniaCustomStateProperties, _GettersTree } from "pinia"
import { Application, LoaderResource, Sprite } from "pixi.js"
import { UnwrapRef } from "vue"
import { CharacterInstance, Dict, StoryUnit, ShowText, NameAndNickName } from "./common"
import { Events } from "./events"
import { BGNameExcelTableItem, CharacterNameExcelTableItem } from "./excels"

export interface State {
  _app: null | Application
  _eventBus: Emitter<Events>
  currentStoryUnit: null | StoryUnit
  allStoryUnit: StoryUnit[]
  characterNameTable: { [index: string]: number },
  loadRes: null | Dict<LoaderResource>,

  currentCharacterList: CharacterInstance[]

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
}

type GetterState = UnwrapRef<State> & UnwrapRef<PiniaCustomStateProperties<State>>

export interface Getters extends _GettersTree<State> {
  app: (state: GetterState) => Application
  eventBus: (state: GetterState) => Emitter<Events>

  bgInstance: (state: GetterState) => Sprite | null
  logText: (state: GetterState) => ShowText[]
  nameAndNickName: (state: GetterState) => (CharacterName: number) => NameAndNickName

  storySummary: (state: GetterState) => string

  CharacterName: (state: GetterState) => (name: string) => number


  /**
   * 获取角色spineData
   */
  characterSpineData: (state: GetterState) => (CharacterName: number) => import('@pixi-spine/base').ISkeletonData | undefined,

  /**
   * 获取背景图片的url, 如果对应的BGName不是背景图片则返回空字符串 
   */
  bgUrl: (state: GetterState) => string
  /**
   * 获取L2D资源
   */
  l2dSpineData: (state: GetterState) => import('@pixi-spine/base').ISkeletonData | undefined,
  /**
   * 获取L2D动作名 
   */
  l2dAnimationName: (state: GetterState) => string
}

export interface Actions {
  nextInit: () => void
}
