import type { ISkeletonData, Spine } from 'pixi-spine'
import { ShowCharacter } from "@/types/events";
import { Character, CharacterEffectType, CharacterInstance } from "@/types/common";
import { Sprite } from 'pixi.js';

/**
 * 角色层定义
 */
export interface CharacterLayer {
  /**
   * 初始化函数, player初始化时调用, 向事件总线注册事件处理函数
   * @return 初始化成功: true, 初始化失败: false
   */
  init(): boolean;
  /**
   * 销毁函数, player退出时调用, 取消对事件总线的监听
   */
  dispose(): void;
  /**
   * 判断当前显示在player中的角色sprite/spine是否有给定的characterNumber对应的角色
   * @param characterNumber 要判断的角色
   * @return 具有对应的角色: true
   */
  hasCharacterInstance(characterNumber: number): boolean;
  /**
   * 判断在cache中是否已经创建了给定的characterNumber对应的角色sprite/spine
   * @param characterNumber 要判断的角色
   * @return 具有对应的角色: true
   */
  hasCharacterInstanceCache(characterNumber: number): boolean;
  /**
   * 根据给定的characterNumber获取对应的角色实例
   * @param characterNumber  要获取的角色
   * @return 创建好的实例, 不存在时undefined
   */
  getCharacterInstance(characterNumber: number): CharacterInstance | undefined;
  /**
   * 根据给定的characterNumber获取对应的角色spine实例
   * @param characterNumber  要获取的角色
   * @return 创建好的spine实例, 不存在时undefined
   */
  getCharacterSpineInstance(characterNumber: number): Spine | undefined;
  /**
   * 主处理函数, 作为事件监听器监听事件总线中的"showCharacter"事件并完成角色层的工作
   * @param data 要处理的数据
   * @return 事件响应成功: true
   */
  showCharacter(data: ShowCharacter): boolean;
  /**
   * 单独一个角色的处理函数, 接收showCharacter方法传入的单个信息并作处理, 返回Promise用以标识全部处理完毕
   * @param data 要处理的数据
   * @return resolve :该角色的特效全部处理完毕
   */
  showOneCharacter(data: CharacterEffectInstance): Promise<void>;
  /**
   * 所有人物特效已处理完成时调用, 向总线发送characterDone事件
   */
  characterDone(): void;
  /**
   * 从打包好的spine数据中创建pixi-spine对象
   * @param characterNumber 要创建的角色的characterNumber
   * @param spineData 打包好的spine数据
   * @return 创建出的pixi-spine对象
   */
  createSpineFromSpineData(characterNumber: number, spineData: ISkeletonData): Spine;
  /**
   * 执行showCharacter函数时检查所需资源是否已经创建, 若没有创建则调用createSpineFromSpineData进行创建
   * @param characterMap 需要处理的资源
   * @return 创建过程顺利: true
   */
  beforeProcessShowCharacterAction(characterMap: Character[]): boolean;
  /**
   * 为特效层构建特效操作实例
   * @param row 传递给showCharacter的原始数据
   */
  buildCharacterEffectInstance(row: ShowCharacter): CharacterEffectInstance[];
  /**
   * 将角色spine放到app的stage中, 并修改对应的状态
   * @param characterNumber 要放置的角色的characterNumber
   * @return 放置成功: true
   */
  putCharacterOnStage(characterNumber: number): boolean;
  /**
   * document resize事件监听器, 在大小变换时同时修改所有spine/sprite的缩放比列
   */
  onWindowResize(): void;
  /**
   * 当前角色spine的缩放比例
   */
  characterScale: number | undefined;
  /**
   * 保存所有创建好的角色spine对象
   * @key number 角色唯一key
   * @value CharacterInstance 包含spine对象的实例
   */
  characterSpineCache: Map<number, CharacterInstance>,
  effectPlayerMap: Map<CharacterEffectType, CharacterEffectPlayerInterface<EmotionWord | CharacterEffectWord | FXEffectWord | SignalEffectWord>>,
}

/**
 * 所有角色特效基础接口
 */
export interface CharacterEffectPlayerInterface<T extends EmotionWord | CharacterEffectWord | FXEffectWord | SignalEffectWord> {
  /**
   * 初始化函数, player初始化时调用
   */
  init(): void;
  /**
   * 播放对应特效
   */
  processEffect(type: T, instance: CharacterEffectInstance): Promise<void>;
  /**
   * 销毁函数, player退出时调用, 取消对事件总线的监听
   */
  dispose(): void;
}

/**
 * 所有角色特效统一接口
 */
export type BaseCharacterEffectPlayer<T extends EmotionWord | CharacterEffectWord | FXEffectWord | SignalEffectWord>
  = CharacterEffectPlayerInterface<T> & EffectFunction<T>

/**
 * 对话特效处理
 */
export interface CharacterEmotionPlayer extends BaseCharacterEffectPlayer<EmotionWord> {
  /**
   * 获取特效处理函数
   * @param type 角色特效类型
   */
  getHandlerFunction(type: EmotionWord): EffectFunctionUnit;
}

/**
 * 人物特效处理
 */
export interface CharacterEffectPlayer extends BaseCharacterEffectPlayer<CharacterEffectWord> {
  /**
   * 获取特效处理函数
   * @param type 人物特效类型
   */
  getHandlerFunction(type: CharacterEffectWord): EffectFunctionUnit;
}

/**
 * CharacterEmotionPlayer使用, 提供角色spine与施加在其身上的所有特效
 */
export interface CharacterEffectInstance extends Character {
  instance: Spine;
}

type EffectFunctionUnit = (instance: CharacterEffectInstance, options: any, sprites: Sprite[],) => Promise<void> | undefined

export type EffectFunction<T extends string> = {
  [key in T]: EffectFunctionUnit;
}

/**
 * 标识角色在stage上的位置
 */
export interface PositionOffset {
  x: number;
  y: number;
}

/**
 * 对话特效定义
 */
export type EmotionWord =
  "Heart" | "Respond" | "Music" | "Twinkle" |
  "Sad" | "Sweat" | "Dot" | "Chat" | "Exclaim" |
  "Angry" | "Surprise" | "Question" | "Shy" | "Upset";

/**
 * 人物特效定义
 */
export type CharacterEffectWord =
  "a" | "d" | "dl" | "dr" |
  "ar" | "al" | "hophop" | "greeting" |
  "shake" | "m1" | "m2" | "m3" |
  "m4" | "m5" | "stiff" | "closeup" |
  "jump" | "falldownR" | "hide";

/**
 * fx特效定义
 */
export type FXEffectWord = "shot";

/**
 * signal特效定义
 */
export type SignalEffectWord = "signal";

/**
 * 每个参数需要遵循的格式
 */
export interface OptionUnit<ValueType> {
  /**
   * 参数值
   */
  value: ValueType
  /**
   * 该参数功能描述
   */
  description: string
}

export interface PositionOffset {
  x: number
  y: number
}

export interface Scale {
  x: number
  y: number
}

export type BaseOptions<T extends string> = Record<T, Record<string, OptionUnit<any>>>
/**
 * 情绪动作的具体参数
 */
export interface BasicEmotionOptions extends BaseOptions<EmotionWord> {
  Heart: {
    heartImg: OptionUnit<{
      scale: number
      position: PositionOffset
    }>
    jumpAnimation: OptionUnit<{
      firstScale: Scale
      secondScale: Scale
      duration: number
    }>
  },
  Respond: {
    flashAnimation: OptionUnit<{
      alpha: number
      duration: number
    }>
    perImgSetting: OptionUnit<{
      angle: number
      scale: number
      anchor: PositionOffset
    }[]>
  },
  Music: {
    rotateAngle: OptionUnit<number>
    animation: OptionUnit<{
      offset: PositionOffset
      duration: number
    }>
  },
  Twinkle: {},
  Sad: {},
  Sweat: {
    smallImg: OptionUnit<{
      scale: number
      offset: {
        x: number
        y: number
      },
      dropAnimationOffset: number
    }>
    dropAnimation: OptionUnit<{
      yOffset: number
      duration: number
    }>
  },
  Dot: {},
  Chat: {
    rotateAngle: OptionUnit<number>,
    rotateTime: OptionUnit<number>,
    rotatePivot: OptionUnit<{
      x: number
      y: number
    }>
  },
  Exclaim: {
    scaleAnimation: OptionUnit<{
      scale: number
      scaleDuration: number
      recoverScale: number
      recoverDuration: number
    }>
    fadeOutWaitTime: OptionUnit<number>
  },
  Angry: {
    pivotPosition: OptionUnit<{
      x: number
      y: number
    }>,
    animationScale: OptionUnit<{
      scale: number
      duration: number
    }>
    endScale: OptionUnit<{
      scale: number
      duration: number
    }>
  },
  Surprise: {},
  Question: {
    scaleAnimation: OptionUnit<{
      scale: number
      anchor: PositionOffset
      scaleDuration: number
      recoverScale: number
      recoverDuration: number
    }>
  },
  Shy: {
    shyImg: OptionUnit<{
      anchor: PositionOffset
      scale: number
      position: PositionOffset
    }>
    scaleAnamation: OptionUnit<{
      anchor: PositionOffset
      startScale: number
      duration: number
    }>
    shakeAnimation: OptionUnit<{
      angleFrom: number
      angleTo: number
      duration: number
      times: number
    }>
  },
  Upset: {}
}

export interface GlobalEmotionOptions {
  startPositionOffset: OptionUnit<{ x: number, y: number }>
  scale: OptionUnit<number>
  fadeOutPreDuration?: OptionUnit<number>
  fadeOutDuration: OptionUnit<number>
}

export type EmotionOptions = {
  [Option in keyof BasicEmotionOptions]: BasicEmotionOptions[Option] & GlobalEmotionOptions
}

export interface ActionOptions extends BaseOptions<CharacterEffectWord> {
  a: {},
  d: {},
  dl: {},
  dr: {},
  ar: {},
  al: {},
  hophop: {},
  greeting: {},
  shake: {},
  m1: {},
  m2: {},
  m3: {},
  m4: {},
  m5: {},
  stiff: {},
  closeup: {},
  jump: {},
  falldownR: {},
  hide: {}
}