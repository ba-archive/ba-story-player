import { usePlayerStore } from "@/stores";
import {
  CharacterEffectInstance,
  CharacterEffectPlayer,
  CharacterEffectWord,
  PositionOffset,
} from "@/types/characterLayer";
import gsap from "gsap";
import { Spine } from "pixi-spine";
import actionOptions, { moveSpeed } from "./options/actionOptions";
import { ColorOverlayFilter } from "@pixi/filter-color-overlay";
import {
  calcCharacterYAndScale,
  CharacterLayerInstance,
  getStageSize,
} from "./index";

const AnimationIdleTrack = 0; // 光环动画track index
const AnimationFaceTrack = 1; // 差分切换

const CharacterEffectPlayerInstance: CharacterEffectPlayer = {
  init() {
    return;
  },
  dispose(): void {},
  getHandlerFunction(type: CharacterEffectWord) {
    return Reflect.get(this, type);
  },
  processEffect(
    type: CharacterEffectWord,
    instance: CharacterEffectInstance
  ): Promise<void> {
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
    const { x } = calcSpineStagePosition(characterInstance, instance.position);
    characterInstance.x = x;
    characterInstance.zIndex = Reflect.get(POS_INDEX_MAP, instance.position);
    if (characterInstance.state.hasAnimation("Idle_01")) {
      characterInstance.state.setAnimation(AnimationIdleTrack, "Idle_01", true);
    }
    characterInstance.alpha = 1;
    const colorFilter = characterInstance.filters![
      characterInstance.filters!.length - 1
    ] as ColorOverlayFilter;
    let finalAlpha = colorFilter.alpha;
    colorFilter.alpha = 1;

    return new Promise(resolve => {
      characterInstance.visible = true;
      const timeLine = gsap.timeline();
      timeLine.to(colorFilter, {
        alpha: finalAlpha,
        duration: 1,
        onComplete: resolve,
      });
    });
  },
  al(instance: CharacterEffectInstance, options): Promise<void> {
    initCharacter(instance);
    let { app } = usePlayerStore();

    let tl = gsap.timeline();
    let initX = app.screen.width + instance.instance.width;
    let distance = initX - instance.instance.x;
    let duration = distance / moveSpeedPx();
    tl.fromTo(
      instance.instance,
      { pixi: { x: initX } },
      { pixi: { x: instance.instance.x }, duration }
    );
    return timeLinePromise(tl);
  },
  ar(instance: CharacterEffectInstance, option): Promise<void> {
    initCharacter(instance);

    let tl = gsap.timeline();
    let distance = instance.instance.x + instance.instance.width;
    let duration = distance / moveSpeedPx();
    tl.fromTo(
      instance.instance,
      { pixi: { x: -instance.instance.width } },
      { pixi: { x: instance.instance.x }, duration }
    );
    return timeLinePromise(tl);
  },
  closeup(instance: CharacterEffectInstance, options): Promise<void> {
    if (!instance.isCloseUp()) {
      let scale = instance.instance.scale.x * options.scale;
      instance.instance.scale.set(scale);
    }

    return Promise.resolve();
  },
  d(instance: CharacterEffectInstance, options): Promise<void> {
    let colorFilter = instance.instance.filters![
      instance.instance.filters!.length - 1
    ] as ColorOverlayFilter;
    let tl = gsap.timeline();

    tl.to(colorFilter, { alpha: 1, duration: options.duration });
    return timeLinePromise(tl, () => {
      instance.instance.alpha = 0;
      instance.instance.visible = false;
    });
  },
  dl(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline();
    let distance = instance.instance.x + instance.instance.width;
    let duration = distance / moveSpeedPx();
    tl.to(instance.instance, {
      pixi: { x: -instance.instance.width },
      duration,
    });
    return timeLinePromise(tl, () => (instance.instance.visible = false));
  },
  dr(instance: CharacterEffectInstance, options): Promise<void> {
    let { app } = usePlayerStore();

    let tl = gsap.timeline();
    let finalX = app.screen.width + instance.instance.width;
    let distance = finalX - instance.instance.x;
    let duration = distance / moveSpeedPx();
    tl.to(instance.instance, { pixi: { x: finalX }, duration });
    return timeLinePromise(tl, () => (instance.instance.visible = false));
  },
  falldownR(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline();
    let pivotOffset = {
      x:
        (instance.instance.width * options.anchor.x) /
        instance.instance.scale.x,
      y:
        (instance.instance.height * options.anchor.y) /
        instance.instance.scale.y,
    };
    let orginPivot = instance.instance.pivot.clone();
    let originY = instance.instance.y;
    instance.instance.pivot.x += pivotOffset.x;
    instance.instance.pivot.y += pivotOffset.y;
    instance.instance.position.set(
      instance.instance.x + pivotOffset.x * instance.instance.scale.x,
      instance.instance.y + pivotOffset.y * instance.instance.scale.x
    );
    let finalY =
      instance.instance.y + instance.instance.height * (options.anchor.y + 0.1);
    tl.to(instance.instance, {
      pixi: { angle: options.rightAngle },
      duration: options.firstRotateDuration,
      repeat: 1,
      yoyo: true,
    })
      .to(instance.instance, {
        pixi: { y: finalY },
        duration: options.falldownDuration,
      })
      .to(
        instance.instance,
        {
          pixi: { angle: options.leftAngle },
          duration: options.falldownDuration * options.leftRotationPercent,
          repeat: 1,
          yoyo: true,
        },
        "<-=0.1"
      )
      .to(
        instance.instance,
        {
          pixi: { angle: options.rightAngle },
          duration: options.firstRotateDuration,
        },
        ">"
      )
      .to(
        instance.instance,
        { pixi: { x: `+=${options.xOffset * instance.instance.width}` } },
        0
      );

    return timeLinePromise(tl, () => {
      instance.instance.angle = 0;
      instance.instance.pivot = orginPivot;
      instance.instance.visible = false;
      instance.instance.y = originY;
    });
  },
  falldownL(instance, options) {
    let tl = gsap.timeline();
    let pivotOffset = {
      x:
        (instance.instance.width * options.anchor.x) /
        instance.instance.scale.x,
      y:
        (instance.instance.height * options.anchor.y) /
        instance.instance.scale.y,
    };
    let orginPivot = instance.instance.pivot.clone();
    let originY = instance.instance.y;
    instance.instance.pivot.x += pivotOffset.x;
    instance.instance.pivot.y += pivotOffset.y;
    instance.instance.position.set(
      instance.instance.x + pivotOffset.x * instance.instance.scale.x,
      instance.instance.y + pivotOffset.y * instance.instance.scale.x
    );
    let finalY =
      instance.instance.y + instance.instance.height * (options.anchor.y + 0.1);
    tl.to(instance.instance, {
      pixi: { angle: options.leftAngle },
      duration: options.firstRotateDuration,
      repeat: 1,
      yoyo: true,
    })
      .to(instance.instance, {
        pixi: { y: finalY },
        duration: options.falldownDuration,
      })
      .to(
        instance.instance,
        {
          pixi: { angle: options.rightAngle },
          duration: options.falldownDuration * options.leftRotationPercent,
          repeat: 1,
          yoyo: true,
        },
        "<-=0.1"
      )
      .to(
        instance.instance,
        {
          pixi: { angle: options.leftAngle },
          duration: options.firstRotateDuration,
        },
        ">"
      )
      .to(
        instance.instance,
        { pixi: { x: `+=${options.xOffset * instance.instance.width}` } },
        0
      );

    return timeLinePromise(tl, () => {
      instance.instance.angle = 0;
      instance.instance.pivot = orginPivot;
      instance.instance.visible = false;
      instance.instance.y = originY;
    });
  },
  greeting(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline();
    let yOffset = options.yOffset * instance.instance.height;
    tl.to(instance.instance, {
      pixi: { y: `-=${yOffset}` },
      repeat: 1,
      yoyo: true,
      duration: options.duration / 2,
    });

    return timeLinePromise(tl);
  },
  hide(instance: CharacterEffectInstance): Promise<void> {
    instance.instance.visible = false;
    return Promise.resolve(undefined);
  },
  hophop(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline();
    let yOffset = options.yOffset * instance.instance.height;
    tl.to(instance.instance, {
      pixi: { y: `-=${yOffset}` },
      repeat: 3,
      yoyo: true,
      duration: options.duration / 2,
    });

    return timeLinePromise(tl);
  },
  jump(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline();
    let yOffset = options.yOffset * instance.instance.height;
    tl.to(instance.instance, {
      pixi: { y: `-=${yOffset}` },
      repeat: 1,
      yoyo: true,
      duration: options.duration / 2,
    });

    return timeLinePromise(tl);
  },
  m1(instance: CharacterEffectInstance): Promise<void> {
    return timeLinePromise(moveTo(instance, 1));
  },
  m2(instance: CharacterEffectInstance): Promise<void> {
    return timeLinePromise(moveTo(instance, 2));
  },
  m3(instance: CharacterEffectInstance): Promise<void> {
    return timeLinePromise(moveTo(instance, 3));
  },
  m4(instance: CharacterEffectInstance): Promise<void> {
    return timeLinePromise(moveTo(instance, 4));
  },
  m5(instance: CharacterEffectInstance): Promise<void> {
    return timeLinePromise(moveTo(instance, 5));
  },
  shake(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline();
    let fromX = options.shakeAnimation.from * instance.instance.width;
    let toX = options.shakeAnimation.to * instance.instance.width;
    tl.to(instance.instance, {
      pixi: { x: `+=${fromX}` },
      repeat: 1,
      yoyo: true,
      duration: options.shakeAnimation.duration / 2,
    })
      .to(instance.instance, {
        pixi: { x: `+=${toX}` },
        repeat: 1,
        yoyo: true,
        duration: options.shakeAnimation.duration / 2,
      })
      .repeat(options.shakeAnimation.repeat - 1);

    return timeLinePromise(tl);
  },
  stiff(instance: CharacterEffectInstance, options): Promise<void> {
    let tl = gsap.timeline();
    let fromX = options.shakeAnimation.from * instance.instance.width;
    let toX = options.shakeAnimation.to * instance.instance.width;
    tl.to(instance.instance, {
      pixi: { x: `+=${fromX}` },
      repeat: 1,
      yoyo: true,
      duration: options.shakeAnimation.duration / 2,
    })
      .to(instance.instance, {
        pixi: { x: `+=${toX}` },
        repeat: 1,
        yoyo: true,
        duration: options.shakeAnimation.duration / 2,
      })
      .repeat(options.shakeAnimation.repeat - 1);

    return timeLinePromise(tl);
  },
};

/**
 * 角色position对应的覆盖关系
 */
export const POS_INDEX_MAP = {
  "1": 2,
  "2": 3,
  "3": 4,
  "4": 3,
  "5": 2,
};

/**
 * 角色position x轴值相对于中心的偏移量, 单位是播放器宽度
 */
export const POS_X_CNETER_OFFSET = {
  "1": -7 / 24,
  "2": -1 / 6,
  "3": 0,
  "4": 1 / 6,
  "5": 7 / 24,
};

/**
 * 根据position: 0~5 计算出角色的原点位置
 * @param character 要显示的角色
 * @param position 角色所在位置
 */
export function calcSpineStagePosition(
  character: Spine,
  position: number
): PositionOffset {
  const { screenWidth, screenHeight } = getStageSize();
  let center = screenWidth / 2;
  //当角色pivot x变为人物中心附近时改变计算算法
  // if (Math.abs(CharacterLayerInstance.characterScale! - character.scale.x) > 0.05) {
  //   let closeupScale = character.scale.x
  //   character.scale.set(CharacterLayerInstance.characterScale)
  //   const OriginHalfWidth = 0.55 * character.width
  //   let pos = {
  //     x: center + Reflect.get(POS_X_CNETER_OFFSET, position) * screenWidth - character.width / 2,
  //     y: screenHeight * 0.3
  //   }
  //   character.scale.set(closeupScale)
  //   pos.x -= 0.55 * character.width - OriginHalfWidth
  //   return pos
  // }

  return {
    x: center + Reflect.get(POS_X_CNETER_OFFSET, position) * screenWidth,
    y: screenHeight * 0.3, //未使用
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
    await tl;
  } catch (e) {
    throw e;
  }

  if (callBack) {
    callBack();
  }
}

/**
 * 初始化角色的位置, zIndex, 动画和可见性.
 * @param instance
 */
function initCharacter(instance: CharacterEffectInstance) {
  const characterInstance = instance.instance;
  const { x } = calcSpineStagePosition(characterInstance, instance.position);
  const { y } = calcCharacterYAndScale(instance.instance);
  characterInstance.x = x;
  characterInstance.y = y;
  characterInstance.zIndex = Reflect.get(POS_INDEX_MAP, instance.position);
  if (characterInstance.state.hasAnimation("Idle_01")) {
    characterInstance.state.setAnimation(AnimationIdleTrack, "Idle_01", true);
  }
  characterInstance.visible = true;
  characterInstance.alpha = 1;
}

/**
 * 将立绘移动到指定位置, 返回一个移动动画timeline
 * @param instance
 * @param position
 * @returns
 */
function moveTo(instance: CharacterEffectInstance, position: number) {
  let movePos = calcSpineStagePosition(instance.instance, position);
  let tl = gsap.timeline();
  let distance = Math.abs(instance.instance.x - movePos.x);
  let duration = distance / moveSpeedPx();
  instance.position = position;
  return tl.to(instance.instance, { pixi: { x: movePos.x }, duration });
}

/**
 * 以px计算的移动速度
 */
export function moveSpeedPx() {
  return (5 * usePlayerStore().app.screen.width * 1) / 5;
}

export default CharacterEffectPlayerInstance;
