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
   * 隐藏当前所有角色
   */
  hideCharacter(): void;
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
  effectPlayerMap: Map<CharacterEffectType, CharacterEffectPlayerInterface<EmotionWord | CharacterEffectWord | FXEffectWord>>,
}

/**
 * 所有角色特效基础接口
 */
export interface CharacterEffectPlayerInterface<T extends EmotionWord | CharacterEffectWord | FXEffectWord> {
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
export type BaseCharacterEffectPlayer<T extends EffectsWord>
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
 * 人物fx特效处理
 */
export interface CharacterFXPlayer extends BaseCharacterEffectPlayer<FXEffectWord> {
  /**
   * 获取特效处理函数
   * @param type 人物特效类型
   */
  getHandlerFunction(type: FXEffectWord): EffectFunctionUnit;
}

/**
 * CharacterEmotionPlayer使用, 提供角色spine与施加在其身上的所有特效
 */
export interface CharacterEffectInstance extends Character {
  instance: Spine;
}

export type EffectsWord = EmotionWord | CharacterEffectWord | FXEffectWord

type Options = EmotionOptions & ActionOptions & FXOptions

type EffectFunctionUnit = (instance: CharacterEffectInstance, options: any, sprites: Sprite[]) => Promise<void> | undefined

export type EffectFunction<T extends EffectsWord> = {
  [key in T]: (instance: CharacterEffectInstance, options: Options[key], sprites: Sprite[]) => Promise<void>
}

type DescriptionUnit<T> = {
  [key in keyof T]: {
    [option in keyof T[key]]: string
  }
}

export type OptionDescriptions = {
  emotion: {
    globalOptions: {
      [key in keyof GlobalEmotionOptions]: string
    }
  } & DescriptionUnit<BasicEmotionOptions>,
  action: DescriptionUnit<ActionOptions>,
  fx: DescriptionUnit<FXOptions>
}

/**
 * 位置标识
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
 * 在x, y方向各自的缩放
 */
export interface Scale {
  x: number
  y: number
}

export type BaseOptions<T extends string> = Record<T, Record<string, any>>
/**
 * 情绪动作的具体参数
 */
export interface BasicEmotionOptions extends BaseOptions<EmotionWord> {
  Heart: {
    heartImg: {
      scale: number
      position: PositionOffset
    }
    jumpAnimation: {
      firstScale: Scale
      secondScale: Scale
      duration: number
    }
  },
  Respond: {
    flashAnimation: {
      alpha: number
      duration: number
    }
    perImgSetting: {
      angle: number
      scale: number
      anchor: PositionOffset
    }[]
  },
  Music: {
    rotateAngle: number
    animation: {
      offset: PositionOffset
      duration: number
    }
  },
  Twinkle: {
    starImgs: {
      pos: PositionOffset[]
      scale: number[]
    }
    fadeInDuration: number
    flashAnimation: {
      scales: number[]
      duration: number[]
      totalDuration: number
    }
  },
  Sad: {},
  Sweat: {
    smallImg: {
      scale: number
      offset: {
        x: number
        y: number
      },
      dropAnimationOffset: number
    }
    dropAnimation: {
      yOffset: number
      duration: number
    }
  },
  Dot: {
    dotContainerPos: PositionOffset
    dotPos: number[]
    showAnimation: {
      showDelay: number
      alpahaDuration: number
    }
  },
  Chat: {
    rotateAngle: number,
    rotateTime: number,
    rotatePivot: {
      x: number
      y: number
    }
  },
  Exclaim: {
    scaleAnimation: {
      scale: number
      scaleDuration: number
      recoverScale: number
      recoverDuration: number
    }
    fadeOutWaitTime: number
  },
  Angry: {
    pivotPosition: {
      x: number
      y: number
    },
    animationScale: {
      scale: number
      duration: number
    }
    endScale: {
      scale: number
      duration: number
    }
  },
  Surprise: {
    imgSetting: {
      angles: number[]
      questionImgPos: PositionOffset
    }
    scaleAnimation: {
      startScale: number
      questionImgYScale: number
      duration: number
      anchor: PositionOffset
    }
    jumpAnimation: {
      xOffset: number
      jumpYOffset: number
      duration: number
    }
  },
  Question: {
    scaleAnimation: {
      scale: number
      anchor: PositionOffset
      scaleDuration: number
      recoverScale: number
      recoverDuration: number
    }
  },
  Shy: {
    shyImg: {
      anchor: PositionOffset
      scale: number
      position: PositionOffset
    }
    scaleAnamation: {
      anchor: PositionOffset
      startScale: number
      duration: number
    }
    shakeAnimation: {
      angleFrom: number
      angleTo: number
      duration: number
      times: number
    }
  },
  Upset: {
    upsetImgPos: PositionOffset
    rotateAnimation: {
      angleFrom: number
      angleTo: number
      duration: number
    }
    yScaleAnimation: {
      scale: number
      duration: number
    }
    animationTotalDuration: number
  }
}

/**
 * emotion情绪动画共有的参数
 */
export interface GlobalEmotionOptions {
  startPositionOffset: { x: number, y: number };
  scale: number;
  fadeOutPreDuration?: number;
  fadeOutDuration: number;
  /**
   * 为了解决spine作为Container使用时奇怪的pivot问题而生
   *
   * 用作比例, 填写的是当立绘scale前width,height为基准时
   *
   * 自身位于spine内的offset
   *
   * 目前使用yuuka(运动服)的width956,height2424作为基准
   */
  makeSpineHappyOffset: {
    x: number;
    y: number;
  }
}

export type EmotionOptions = {
  [Option in keyof BasicEmotionOptions]: BasicEmotionOptions[Option] & GlobalEmotionOptions
}

export interface ActionOptions extends BaseOptions<CharacterEffectWord> {
  a: {},
  d: {
    duration: number
  },
  dl: {
    speed: number
  },
  dr: {
    speed: number
  },
  ar: {
    speed: number
  },
  al: {
    speed: number
  },
  hophop: {
    yOffset: number
    duration: number
  },
  greeting: {
    yOffset: number
    duration: number
  },
  shake: {
    shakeAnimation: {
      from: number
      to: number
      duration: number
      repeat: number
    }
  },
  m1: {},
  m2: {},
  m3: {},
  m4: {},
  m5: {},
  stiff: {
    shakeAnimation: {
      from: number
      to: number
      duration: number
      repeat: number
    }
  },
  closeup: {
    scale: number
  },
  jump: {
    yOffset: number
    duration: number
  },
  falldownR: {
    anchor: PositionOffset
    rightAngle: number
    leftAngle: number
    firstRotateDuration: number
    leftRotationPercent: number
    falldownDuration: number
    xOffset: number
  },
  hide: {}
}

export interface FXOptions extends BaseOptions<FXEffectWord> {
  shot: {
    scale: number
    shotDuration: number
    shotDelay: number
    shotPos: PositionOffset[]
  }
}

export interface SignalOptions extends BaseOptions<SignalEffectWord> {

}