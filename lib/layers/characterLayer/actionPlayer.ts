import { usePlayerStore } from "@/stores";
import {
  CharacterEffectInstance, CharacterEffectPlayer, CharacterEffectWord, PositionOffset
} from "@/types/characterLayer";
import gsap from "gsap";
import { Spine } from "pixi-spine";
import actionOptions from "./actionOptions";


const AnimationIdleTrack = 0; // 光环动画track index
const AnimationFaceTrack = 1; // 差分切换

const CharacterEffectPlayerInstance: CharacterEffectPlayer = {
  init() {
    return;
  },
  dispose(): void {
  },
  getHandlerFunction(type: CharacterEffectWord) {
    return Reflect.get(this, type)
  },
  processEffect(type: CharacterEffectWord, instance: CharacterEffectInstance): Promise<void> {
    const fn = this.getHandlerFunction(type);
    if (!fn) {
      return new Promise((resolve, reject) => {
        reject();
      });
    }
    return fn(instance, actionOptions[type], []) as Promise<void>;
  },
  a(instance: CharacterEffectInstance): Promise<void> {
    const characterInstance = instance.instance;
    const { x, y } = calcSpineStagePosition(characterInstance, instance.position);
    characterInstance.x = x;
    characterInstance.y = y;
    characterInstance.zIndex = Reflect.get(POS_INDEX_MAP, instance.position);
    characterInstance.state.setAnimation(AnimationIdleTrack, 'Idle_01', true);
    return new Promise((resolve) => {
      characterInstance.alpha = 0;
      characterInstance.visible = true;
      const timeLine = gsap.timeline();
      timeLine.to(characterInstance, {
        alpha: 1,
        duration: 1,
        onComplete: resolve
      });
    })
  }, al(instance: CharacterEffectInstance, options): Promise<void> {
    initCharacter(instance)
    let { app } = usePlayerStore()

    let tl = gsap.timeline()
    let initX = app.screen.width
    let distance = initX - instance.instance.x
    let duration = distance / (instance.instance.width * options.speed)
    tl.fromTo(instance.instance, { pixi: { x: initX } },
      { pixi: { x: instance.instance.x }, duration })
    return timeLinePromise(tl)

  }, ar(instance: CharacterEffectInstance, option): Promise<void> {
    initCharacter(instance)

    let tl = gsap.timeline()
    let distance = instance.instance.x + instance.instance.width
    let duration = distance / (instance.instance.width * option.speed)
    tl.fromTo(instance.instance, { pixi: { x: -instance.instance.width } },
      { pixi: { x: instance.instance.x }, duration })
    return timeLinePromise(tl)

  }, closeup(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, d(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline()

    tl.to(instance.instance, { pixi: { alpha: 0 }, duration: options.duration })
    return timeLinePromise(tl, () => { instance.instance.visible = false })
  }, dl(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline()
    let distance = instance.instance.x + instance.instance.width
    let duration = distance / (instance.instance.width * options.speed)
    tl.to(instance.instance,
      { pixi: { x: -instance.instance.width }, duration })
    return timeLinePromise(tl, () => instance.instance.visible = false)

  }, dr(instance: CharacterEffectInstance, options): Promise<void> {
    let { app } = usePlayerStore()

    let tl = gsap.timeline()
    let finalX = app.screen.width
    let distance = finalX - instance.instance.x
    let duration = distance / (instance.instance.width * options.speed)
    tl.to(instance.instance, { pixi: { x: finalX }, duration },
    )
    return timeLinePromise(tl, () => instance.instance.visible = false)
  }, falldownR(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, greeting(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, hide(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, hophop(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, jump(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, m1(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, m2(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, m3(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, m4(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, m5(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, shake(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, stiff(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }
}


/**
 * 角色position对应的覆盖关系
 */
const POS_INDEX_MAP = {
  "1": 2,
  "2": 3,
  "3": 4,
  "4": 3,
  "5": 2,
};

/**
 * 根据position: 0~5 计算出角色的原点位置
 * @param character 要显示的角色
 * @param position 角色所在位置
 */
function calcSpineStagePosition(character: Spine, position: number): PositionOffset {
  const { screenWidth, screenHeight } = getStageSize();
  return {
    x: screenWidth / 5 * (position - 1) - (character.width * character.scale.x / 2),
    y: screenHeight * 0.3
  };
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

/**
 * 根据timeline生成promise
 * @param tl 
 * @param callBack 可选, 返回promise前调用的函数
 * @returns 
 */
async function timeLinePromise(tl: gsap.core.Timeline, callBack?: () => any) {
  try {
    await tl.then()
  } catch (e) {
    throw e
  }

  if (callBack) {
    callBack()
  }
}

/**
 * 初始化角色的位置, zIndex, 动画和可见性.
 * @param instance 
 */
function initCharacter(instance: CharacterEffectInstance) {
  const characterInstance = instance.instance;
  const { x, y } = calcSpineStagePosition(characterInstance, instance.position);
  characterInstance.x = x;
  characterInstance.y = y;
  characterInstance.zIndex = Reflect.get(POS_INDEX_MAP, instance.position);
  characterInstance.state.setAnimation(AnimationIdleTrack, 'Idle_01', true);
  characterInstance.visible = true
  characterInstance.alpha = 1
}

export default CharacterEffectPlayerInstance