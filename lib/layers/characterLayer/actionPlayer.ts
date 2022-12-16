import { usePlayerStore } from "@/stores";
import {
  CharacterEffectInstance, CharacterEffectPlayer, CharacterEffectWord, PositionOffset
} from "@/types/characterLayer";
import gsap from "gsap";
import { Spine } from "pixi-spine";
import actionOptions, { moveSpeed } from "./options/actionOptions";
import { ColorOverlayFilter } from '@pixi/filter-color-overlay'

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
    characterInstance.alpha = 1
    let colorFilter = characterInstance.filters![characterInstance.filters!.length - 1] as ColorOverlayFilter
    colorFilter.alpha = 1

    return new Promise((resolve) => {
      characterInstance.visible = true;
      const timeLine = gsap.timeline();
      timeLine.to(colorFilter, {
        alpha: 0,
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

  }, closeup(instance: CharacterEffectInstance, options): Promise<void> {
    let scale = instance.instance.scale.x * options.scale
    instance.instance.scale.set(scale)

    return Promise.resolve()
  }, d(instance: CharacterEffectInstance, options): Promise<void> {
    let colorFilter = instance.instance.filters![instance.instance.filters!.length-1] as ColorOverlayFilter
    let tl = gsap.timeline()

    tl.to(colorFilter, { alpha: 1, duration: options.duration })
    return timeLinePromise(tl, () => { instance.instance.alpha = 0 })
  }, dl(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline()
    let distance = instance.instance.x + instance.instance.width
    let duration = distance / (instance.instance.width * options.speed)
    tl.to(instance.instance,
      { pixi: { x: -instance.instance.width }, duration })
    return timeLinePromise(tl)

  }, dr(instance: CharacterEffectInstance, options): Promise<void> {
    let { app } = usePlayerStore()

    let tl = gsap.timeline()
    let finalX = app.screen.width
    let distance = finalX - instance.instance.x
    let duration = distance / (instance.instance.width * options.speed)
    tl.to(instance.instance, { pixi: { x: finalX }, duration },
    )
    return timeLinePromise(tl)
  }, falldownR(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline()
    let pivotOffset = {
      x: instance.instance.width * options.anchor.x / instance.instance.scale.x,
      y: instance.instance.height * options.anchor.y / instance.instance.scale.y
    }
    let orginPivot = instance.instance.pivot.clone()
    instance.instance.pivot.x += pivotOffset.x
    instance.instance.pivot.y += pivotOffset.y
    instance.instance.position.set(instance.instance.x + pivotOffset.x * instance.instance.scale.x, instance.instance.y + pivotOffset.y * instance.instance.scale.x)
    let finalY = instance.instance.y + instance.instance.height * (options.anchor.y + 0.1)
    tl.to(instance.instance, { pixi: { angle: options.rightAngle }, duration: options.firstRotateDuration, repeat: 1, yoyo: true })
      .to(instance.instance, { pixi: { y: finalY }, duration: options.falldownDuration })
      .to(instance.instance, { pixi: { angle: options.leftAngle }, duration: options.falldownDuration * options.leftRotationPercent, repeat: 1, yoyo: true }, '<-=0.1')
      .to(instance.instance, { pixi: { angle: options.rightAngle }, duration: options.firstRotateDuration }, '>')
      .to(instance.instance, { pixi: { x: `+=${options.xOffset * instance.instance.width}` } }, 0)

    return timeLinePromise(tl, () => { instance.instance.angle = 0; instance.instance.pivot = orginPivot })
  }, greeting(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline()
    let yOffset = options.yOffset * instance.instance.height
    tl.to(instance.instance, { pixi: { y: `-=${yOffset}` }, repeat: 1, yoyo: true, duration: options.duration / 2 })

    return timeLinePromise(tl)
  }, hide(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, hophop(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline()
    let yOffset = options.yOffset * instance.instance.height
    tl.to(instance.instance, { pixi: { y: `-=${yOffset}` }, repeat: 3, yoyo: true, duration: options.duration / 2 })

    return timeLinePromise(tl)
  }, jump(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline()
    let yOffset = options.yOffset * instance.instance.height
    tl.to(instance.instance, { pixi: { y: `-=${yOffset}` }, repeat: 1, yoyo: true, duration: options.duration / 2 })

    return timeLinePromise(tl)

  }, m1(instance: CharacterEffectInstance): Promise<void> {
    return timeLinePromise(moveTo(instance, 1))
  }, m2(instance: CharacterEffectInstance): Promise<void> {
    return timeLinePromise(moveTo(instance, 2))
  }, m3(instance: CharacterEffectInstance): Promise<void> {
    return timeLinePromise(moveTo(instance, 3))
  }, m4(instance: CharacterEffectInstance): Promise<void> {
    return timeLinePromise(moveTo(instance, 4))
  }, m5(instance: CharacterEffectInstance): Promise<void> {
    return timeLinePromise(moveTo(instance, 5))
  }, shake(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline()
    let fromX = options.shakeAnimation.from * instance.instance.width
    let toX = options.shakeAnimation.to * instance.instance.width
    tl.to(instance.instance, {
      pixi: { x: `+=${fromX}` }, repeat: 1,
      yoyo: true, duration: options.shakeAnimation.duration / 2
    })
      .to(instance.instance, {
        pixi: { x: `+=${toX}` },
        repeat: 1,
        yoyo: true,
        duration: options.shakeAnimation.duration / 2
      })
      .repeat(options.shakeAnimation.repeat - 1)

    return timeLinePromise(tl)
  }, stiff(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline()
    let fromX = options.shakeAnimation.from * instance.instance.width
    let toX = options.shakeAnimation.to * instance.instance.width
    tl.to(instance.instance, {
      pixi: { x: `+=${fromX}` }, repeat: 1,
      yoyo: true, duration: options.shakeAnimation.duration / 2
    })
      .to(instance.instance, {
        pixi: { x: `+=${toX}` },
        repeat: 1,
        yoyo: true,
        duration: options.shakeAnimation.duration / 2
      })
      .repeat(options.shakeAnimation.repeat - 1)

    return timeLinePromise(tl)
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

/**
 * 将立绘移动到指定位置, 返回一个移动动画timeline
 * @param instance 
 * @param position 
 * @returns 
 */
function moveTo(instance: CharacterEffectInstance, position: number) {
  let movePos = calcSpineStagePosition(instance.instance, position)
  let tl = gsap.timeline()
  let distance = Math.abs(instance.instance.x - movePos.x)
  let duration = distance / (moveSpeed * instance.instance.width)

  return tl.to(instance.instance, { pixi: { x: movePos.x }, duration })
}

export default CharacterEffectPlayerInstance