import type {ISkeletonData, Spine} from 'pixi-spine'
import {ShowCharacter} from "@/types/events";
import {Character, CharacterEffect, CharacterInstance} from "@/types/common";

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
   * @return 初始化成功: true, 初始化失败: false
   */
  dispose(): boolean;
  /**
   * 判断当前显示在player中的角色sprite/spine是否有给定的characterNumber对应的角色
   * @param characterNumber 要判断的角色
   * @return 具有对应的角色: true
   */
  hasCharacterInstance(characterNumber: number): Boolean;
  /**
   * 判断在cache中是否已经创建了给定的characterNumber对应的角色sprite/spine
   * @param characterNumber 要判断的角色
   * @return 具有对应的角色: true
   */
  hasCharacterInstanceCache(characterNumber: number): Boolean;
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
  showCharacter(data: ShowCharacter): Boolean;
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
  beforeProcessShowCharacterAction(characterMap: CharacterEffectMap[]): boolean;
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
  characterSpineCache: Map<number, CharacterInstance>
}

/**
 * 对话特效处理
 */
export interface CharacterEmotionPlayer {
  /**
   * 初始化函数, player初始化时调用, 向为EffectWord准备处理函数映射表
   */
  init(): void;
  /**
   * 预处理, 检查是否能够播放对应特效
   */
  processEffect(type: EmotionWord, instance: CharacterEffectInstance): void;
  /**
   * 获取特效处理函数
   * @param type 角色特效类型
   */
  getHandlerFunction(type: EmotionWord): (instance: CharacterEffectInstance) => void | undefined;
  emotionHeart(instance: CharacterEffectInstance): void;
  emotionRespond(instance: CharacterEffectInstance): void;
  emotionNote(instance: CharacterEffectInstance): void;
  emotionTwinkle(instance: CharacterEffectInstance): void;
  emotionSad(instance: CharacterEffectInstance): void;
  emotionSweat(instance: CharacterEffectInstance): void;
  emotionDot(instance: CharacterEffectInstance): void;
  emotionChat(instance: CharacterEffectInstance): void;
  emotionExclaim(instance: CharacterEffectInstance): void;
  emotionAngry(instance: CharacterEffectInstance): void;
  emotionSurprise(instance: CharacterEffectInstance): void;
  emotionQuestion(instance: CharacterEffectInstance): void;
  emotionShy(instance: CharacterEffectInstance): void;
}

/**
 * showCharacter方法使用, 保存一个角色与施加在其身上的所有特效
 */
export interface CharacterEffectMap extends Character {
  effect: CharacterEffect[];
}

/**
 * CharacterEmotionPlayer使用, 提供角色spine与施加在其身上的所有特效
 */
export interface CharacterEffectInstance extends Character {
  effect: CharacterEffect;
  instance: Spine;
}

/**
 * 对话特效定义
 */
export type EmotionWord =
  "Heart" | "Respond" | "Music" | "Twinkle" |
  "Sad" | "Sweat" | "Dot" | "Chat" | "Exclaim" |
  "Angry" | "Surprise" | "Question" | "Shy"|"Upset";

/**
 * 人物特效定义
 */
export enum CharacterEffectWord {
  "a" = "a",
  "d" = "d",
  "dl" = "dl",
  "dr" = "dr",
  "ar" = "ar",
  "al" = "al",
  "hophop" = "hophop",
  "greeting" = "greeting",
  "shake" = "shake",
  "m1" = "m1",
  "m2" = "m2",
  "m3" = "m3",
  "m4" = "m4",
  "m5" = "m5",
  "stiff" = "stiff",
  "closeup" = "closeup",
  "jump" = "jump",
  "falldownR" = "falldownR",
  "hide" = "hide",
}

/**
 * fx特效定义
 */
export enum FXEffectWord {
  "shot" = "shot"
}

/**
 * signal特效定义
 */
export enum SignalEffectWord {
  "signal" = "signal"
}
