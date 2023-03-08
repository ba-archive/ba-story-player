import eventBus from "@/eventBus";
import { usePlayerStore } from "@/stores";
import {
  CharacterEffectInstance,
  CharacterEffectPlayerInterface,
  CharacterEffectWord,
  CharacterLayer,
  EffectsWord,
  EmotionWord,
  FXEffectWord,
  ILoopAnimationStateListener
} from "@/types/characterLayer";
import { Character, CharacterEffectType, CharacterInstance, WinkAnimationObject, WinkObject } from "@/types/common";
import { ShowCharacter } from "@/types/events";
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import { CRTFilter } from '@pixi/filter-crt';
import { MotionBlurFilter } from '@pixi/filter-motion-blur';
import gsap, { Power0 } from "gsap";
import { PixiPlugin } from 'gsap/PixiPlugin';
import { IAnimationState, ISkeletonData, Spine } from "pixi-spine";
import * as PIXI from 'pixi.js';
import CharacterEffectPlayerInstance, { calcSpineStagePosition, POS_INDEX_MAP } from "./actionPlayer";
import CharacterEmotionPlayerInstance from './emotionPlayer';
import CharacterFXPlayerInstance from "./fxPlayer";

const AnimationIdleTrack = 0; // 光环动画track index
const AnimationFaceTrack = 1; // 差分切换
const AnimationWinkTrack = 2; // TODO 眨眼动画

type ICharacterEffectPlayerInterface = CharacterEffectPlayerInterface<EmotionWord | CharacterEffectWord | FXEffectWord>;
type IEffectPlayerMap = {
  [key in CharacterEffectType]: ICharacterEffectPlayerInterface;
}
const EffectPlayerMap: IEffectPlayerMap = {
  "action": CharacterEffectPlayerInstance,
  "emotion": CharacterEmotionPlayerInstance,
  "fx": CharacterFXPlayerInstance,
}

/**
 * 角色初始的pivot相对与长宽的比例, 当前值代表左上角
 */
export const Character_Initial_Pivot_Proportion = { x: 0, y: -1 / 2 }
/**
 * 标准宽度基于的播放器宽度的相对值
 * 标准宽度用于计算图片缩放比例
 */
const Standard_Width_Relative = 0.3

/**
 * 获取用于计算图片缩放比例的标准宽度
 */
export function getStandardWidth() {
  return usePlayerStore().app.screen.width * Standard_Width_Relative
}


PixiPlugin.registerPIXI(PIXI)
gsap.registerPlugin(PixiPlugin)

export function characterInit(): boolean {
  return CharacterLayerInstance.init();
}

function showCharacter(data: ShowCharacter) {
  CharacterLayerInstance.showCharacter(data);
}

export const CharacterLayerInstance: CharacterLayer = {
  init() {
    const { app } = usePlayerStore();
    // 将stage的sort设置为true,此时sprite将按照zIndex属性进行显示的排序,而是不按照children array的顺序
    app.stage.sortableChildren = true;
    document.addEventListener("resize", this.onWindowResize);
    eventBus.on("showCharacter", showCharacter);
    eventBus.on("hide", () => Reflect.apply(this.hideCharacter, this, []))
    eventBus.on("hideCharacter", () => Reflect.apply(this.hideCharacter, this, []))
    eventBus.on("resize", originWidth => {
      this.characterSpineCache.forEach(character => {
        const instance = character.instance
        if (instance.visible) {
          instance.x *= app.screen.width / originWidth
        }
      })
    })
    Object.keys(EffectPlayerMap).forEach((key) => {
      const player = Reflect.get(EffectPlayerMap, key) as ICharacterEffectPlayerInterface;
      player && player.init();
    })
    return true;
  },
  dispose(): boolean {
    document.removeEventListener("resize", this.onWindowResize);
    eventBus.off("showCharacter", showCharacter);
    // 删除眨眼的handler
    this.characterSpineCache.forEach((it) => clearWinkHandler(it.winkObject));
    //TODO 销毁各种sprite,spine实体
    return true;
  },
  hasCharacterInstance(characterNumber: number): boolean {
    const { currentCharacterMap } = usePlayerStore();
    return Boolean(currentCharacterMap.get(characterNumber));
  },
  hasCharacterInstanceCache(characterNumber: number): boolean {
    return Boolean(this.characterSpineCache.get(characterNumber));
  },
  getCharacterInstance(characterNumber: number): CharacterInstance | undefined {
    const { currentCharacterMap } = usePlayerStore();
    return currentCharacterMap.get(characterNumber) ?? this.characterSpineCache.get(characterNumber);
  },
  getCharacterSpineInstance(characterNumber: number): Spine | undefined {
    return this.getCharacterInstance(characterNumber)?.instance ?? this.characterSpineCache.get(characterNumber)?.instance;
  },
  beforeProcessShowCharacterAction(characterMap: Character[]): boolean {
    const { characterSpineData } = usePlayerStore();
    for (const item of characterMap) {
      const characterName = item.CharacterName;
      if (!this.hasCharacterInstanceCache(characterName)) {
        const spineData = characterSpineData(characterName);
        if (!spineData) {
          return false;
        }
        this.createSpineFromSpineData(item, spineData);
      }
      this.putCharacterOnStage(item);
    }
    return true;
  },
  createSpineFromSpineData(character: Character, spineData: ISkeletonData): Spine {
    const instance = new Spine(spineData);
    instance.sortableChildren = true;
    const { currentCharacterMap } = usePlayerStore();
    const characterInstance: CharacterInstance = {
      CharacterName: character.CharacterName,
      position: character.position,
      currentFace: character.face,
      instance,
      isOnStage() {
        return Boolean(instance.parent);
      },
      isShow() {
        return this.isOnStage() && instance.alpha != 0;
      },
      isHeightLight() {
        return this.isOnStage() && instance.alpha != 0;
      },
    }
    currentCharacterMap.set(character.CharacterName, characterInstance)
    this.characterSpineCache.set(character.CharacterName, characterInstance)
    return instance;
  },
  putCharacterOnStage(character: Character): boolean {
    const { app } = usePlayerStore()
    const instance = this.getCharacterInstance(character.CharacterName)!;
    instance.position = character.position;
    instance.currentFace = character.face;
    wink(instance);
    const spine = instance.instance
    if (!spine) {
      return false;
    }
    // spine如果是新建的, 初始化数据
    if (spine.position.y === 0) {
      // 供特效使用
      const { scale, y } = calcCharacterYAndScale(spine);
      //设置x轴初始位置
      const { x } = calcSpineStagePosition(spine, character.position)

      // 设置锚点到左上角
      spine.pivot = {
        x: Character_Initial_Pivot_Proportion.x * spine.width,
        y: Character_Initial_Pivot_Proportion.y * spine.height,
      };
      spine.scale.set(scale);
      // 设置spine在播放器的y轴坐标
      spine.position.set(x, y);
    }
    // 不显示
    spine.alpha = 0
    //这样会导致基于visible的判断失效
    // spine.visible = false;
    app.stage.addChild(spine);
    return true;
  },
  buildCharacterEffectInstance(row: ShowCharacter): CharacterEffectInstance[] {
    return row.characters.map(item => {
      return {
        ...item,
        instance: this.getCharacterSpineInstance(item.CharacterName)!,
        isCloseUp() {
          // 供特效使用
          const { scale } = calcCharacterYAndScale(this.instance);
          return Math.abs(scale - this.instance.scale.x) >= 0.05
        }
      };
    })
  },
  hideCharacter() {
    const { currentCharacterMap } = usePlayerStore()
    currentCharacterMap.forEach(character => {
      character.instance.visible = false
      character.instance.scale.set(1)
      // 设置锚点到左上角
      character.instance.pivot = {
        x: Character_Initial_Pivot_Proportion.x * character.instance.width,
        y: Character_Initial_Pivot_Proportion.y * character.instance.height,
      };
      // 设置缩放比列
      const { scale: defaultScale } = calcCharacterYAndScale(character.instance);
      character.instance.scale.set(defaultScale);
    })
  },
  showCharacter(data: ShowCharacter): boolean {
    if (!this.beforeProcessShowCharacterAction(data.characters)) {
      return false;
    }
    let mapList = this.buildCharacterEffectInstance(data);
    //将data没有但显示着的角色取消highlight
    this.characterSpineCache.forEach(character => {
      if (character.instance.visible
        && !data.characters.some(value => value.CharacterName === character.CharacterName)) {
        let colorFilter = character.instance.filters![character.instance.filters!.length - 1] as ColorOverlayFilter
        colorFilter.alpha = 0.3
      }
    })

    // 当目前显示的角色没有新的表情动作且和现有角色的position冲突时隐藏
    const filterEmotion = data.characters
      .filter(it => it.effects.some(ef => ef.type === "emotion"));
    const showName = filterEmotion.map(it => it.CharacterName);
    const showPosition = data.characters.map(it => it.position);
    const filterHide = [...this.characterSpineCache.values()]
      .filter(it => {
        return it.isOnStage() &&
          it.isShow() &&
          (
            !showName.includes(it.CharacterName) && showPosition.includes(it.position)
          )
      }
      )
    filterHide.forEach(chara => {
      chara.instance.visible = false;
      chara.instance.alpha = 0;
      // 清除closeup特效
      const { scale } = calcCharacterYAndScale(chara.instance);
      chara.instance.scale.set(scale);
    });


    //处理角色替换了初始位置的情况, 移除掉hide放置角色错误隐藏
    const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
      arr.reduce((groups, item) => {
        (groups[key(item)] ||= []).push(item);
        return groups;
      }, {} as Record<K, T[]>);
    //将角色按CharacterName分组
    let CharacterNameGroup = groupBy(mapList, value => value.CharacterName)
    for (let [key, group] of Object.entries(CharacterNameGroup)) {
      if (group.length !== 1) {
        //通过CharacterName出现两次则移除掉hide effect
        mapList = mapList.map(value => {
          if (value.CharacterName === Number(key)) {
            value.effects = value.effects.filter(effect => effect.effect !== 'hide')
          }
          return value
        })
      }
    }

    // 处理sync情况
    Promise
      .all(
        mapList.map(character => this.showOneCharacter(character))
      )
      .then(this.characterDone)
      .catch(reason => {
        console.log(reason)
        this.characterDone()
      });
    return true;
  },
  showOneCharacter(data: CharacterEffectInstance): Promise<void> {
    // // 当人物没有closeup时取消closeup
    // if (Math.abs(CharacterLayerInstance.characterScale! - data.instance.scale.x) > 0.05) {
    //   if (!data.effects.some(effect => effect.effect === 'closeup')) {
    //     data.instance.scale.set(CharacterLayerInstance.characterScale)
    //   }
    // }

    // 表情
    if (data.instance.state.hasAnimation(data.face))
      data.instance.state.setAnimation(AnimationFaceTrack, data.face, true);
    data.instance.filters = []

    //处理全息状态
    if (data.signal) {
      let crtFilter = new CRTFilter({
        lineWidth: data.instance.width * 0.005,
        time: 0
      })
      let adjustmentFilter = new AdjustmentFilter({
        gamma: 1.3,
        red: 1,
        green: 1.1,
        blue: 1.15,
      })
      let motionBlurFilter = new MotionBlurFilter()
      data.instance.filters.push(
        crtFilter,
        adjustmentFilter,
        motionBlurFilter
      )
      loopCRtAnimation(crtFilter)
      let tl = gsap.timeline()
      tl.to(motionBlurFilter.velocity, { x: 5, duration: 0.1, repeat: 1, yoyo: true })
        .to(motionBlurFilter.velocity, { x: -5, duration: 0.1, repeat: 1, yoyo: true })
      tl.repeat(-1)
      tl.repeatDelay(3)
    }

    const colorFilter = new ColorOverlayFilter([0, 0, 0], 0)
    // TODO highlight
    //处理人物高光
    if (!data.highlight) {
      colorFilter.alpha = 0.3
    }
    if (data.effects.some(it => it.type === "action" && ['a', 'al', 'ar'].includes(it.effect))) {
      // 有淡入效果, 交给特效控制器
      //不要改变color filter的alpha, 会导致a最后的alpha出错
    } else {
      // 没有淡入效果, 直接显示
      const chara = data.instance;
      //当人物被移出画面时重设为初始位置
      if (!chara.visible) {
        const { x } = calcSpineStagePosition(chara, data.position);
        chara.x = x;
        chara.zIndex = Reflect.get(POS_INDEX_MAP, data.position);
        chara.state.setAnimation(AnimationIdleTrack, 'Idle_01', true);
      }
      chara.alpha = 1
      chara.visible = true;
    }
    data.instance.filters.push(colorFilter);

    return new Promise<void>(async (resolve, reject) => {
      const effectListLength = data.effects.length;
      if (effectListLength === 0) {
        resolve()
      }

      const reasons: any[] = [];
      let effectPromise: Array<Promise<void>> = []
      for (const index in data.effects) {
        const effect = data.effects[index];
        const effectPlayer = getEffectPlayer(effect.type);
        if (!effectPlayer) {
          // TODO error handle
          reject(`获取特效类型{${effect.type}}对应的播放器时失败`);
          return;
        }
        if (effect.async) {
          await effectPlayer.processEffect(effect.effect as EffectsWord, data)
          // .then(resolveHandler)
          // .catch((err) => {
          //   reason.push(err);
          //   resolveHandler();
          // })
        } else {
          effectPromise.push(effectPlayer.processEffect(effect.effect as EffectsWord, data))
          // .then(resolveHandler)
          // .catch((err) => {
          //   reason.push(err);
          //   resolveHandler();
          // })
        }
      }
      const results = await Promise.allSettled(effectPromise)
      for (let result of results) {
        if (result.status === 'rejected') {
          reasons.push(result.reason)
        }
      }
      if (reasons.length !== 0) {
        reject(reasons)
      }
      else {
        resolve()
      }
    })
  },
  characterDone() {
    eventBus.emit("characterDone");
  },
  //TODO 根据角色是否已经缩放(靠近老师)分类更新
  onWindowResize() { },
  characterSpineCache: new Map<number, CharacterInstance>(),
}

function loopCRtAnimation(crtFilter: CRTFilter) {
  gsap.to(crtFilter, { time: "+=10", duration: 1, ease: Power0.easeNone }).then(() => loopCRtAnimation(crtFilter))
}

function getEffectPlayer(type: CharacterEffectType) {
  return Reflect.get(EffectPlayerMap, type) as ICharacterEffectPlayerInterface
}
/**
 * 眨眼
 *
 * 至少游戏里只会眨一次或者两次
 *
 * 固定只有01表情时才会眨眼
 * @param instance 要眨眼的角色结构体
 * @param first 是否为改变表情时的初始化
 */
function wink(instance: CharacterInstance, first = true) {
  //只在有眨眼动画时起作用
  if (!instance.instance.state.hasAnimation('Eye_Close_01')) {
    return
  }
  const face = instance.currentFace;
  const spine = instance.instance;
  clearWinkHandler(instance.winkObject);
  if (face !== "01") {
    spine.state.clearTrack(AnimationWinkTrack);
    return;
  }
  const winkTimeout = Math.floor(Math.random() * 1000) + 3500;
  instance.winkObject = {
    handler: window.setTimeout(wink, winkTimeout, instance, false)
  }
  if (first) {
    return;
  }
  const loopTime = Math.floor(Math.random() * 2) + 1
  const winkAnimationObject = loopAnimationTime(spine.state, AnimationWinkTrack, "Eye_Close_01", "eye", loopTime);
  instance.winkObject.animationObject = winkAnimationObject;
  winkAnimationObject.start();
}

/**
 * 指定循环次数的播放循环动画
 *
 * 通过AnimationStateListener在每次播放结束后判断播放次数,
 *
 * 如果没有达到次数就继续播放
 * @param state spine的state对象
 * @param trackIndex 动画的trackIndex
 * @param animationName 动画的animationName
 * @param id 用于标识loop handler的key
 * @param loop 循环次数
 */
function loopAnimationTime<AnimationState extends IAnimationState>(state: AnimationState, trackIndex: number, animationName: string, id: string, loop: number): WinkAnimationObject {
  return {
    _pause: false,
    start() {
      const controller = state.listeners.filter(it => Reflect.get(it, "complete") && Reflect.get(it, "key") === id)
      if (controller.length !== 0) {
        state.removeListener(controller[0]);
      }
      let loopCount = 1;
      const listener: ILoopAnimationStateListener = {
        complete: (entry) => {
          if (entry.trackIndex !== trackIndex) {
            return;
          }
          if (loopCount < loop && !this._pause) {
            loopCount++;
            state.setAnimation(trackIndex, animationName, false);
          }
        },
        key: id
      };
      state.addListener(listener);
      state.setAnimation(trackIndex, animationName, false);
    },
    pause() {
      this._pause = true;
    }
  }
}

function clearWinkHandler(winkObject?: WinkObject) {
  if (!winkObject) {
    return
  }
  if (winkObject.handler) {
    window.clearTimeout(winkObject.handler);
    winkObject.handler = 0;
  }
  winkObject.animationObject?.pause();
}

// 当播放器高度为PlayerHeight时角色的CharacterScale
const PlayerHeight = 550;
const CharacterScale = 0.34;
// spine在播放器之下的部分;
const spineHideRate = 0.49;
export function calcCharacterYAndScale(spine: Spine) {
  const { screenHeight } = getStageSize();
  const scale = screenHeight / PlayerHeight * CharacterScale;
  const spineHeight = spine.height / spine.scale.y * scale;
  return {
    scale,
    y: screenHeight - spineHeight * (1 - spineHideRate)
  }
}

/**
 * 获取显示区域的大小
 * @return screenWidth 容器的宽 screenHeight 容器的高
 */
export function getStageSize() {
  const { app } = usePlayerStore();
  const screen = app.screen;
  const screenWidth = screen.width;
  const screenHeight = screen.height;
  return {
    screenWidth,
    screenHeight
  };
}
