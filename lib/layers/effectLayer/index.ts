import eventBus from '@/eventBus'
import { usePlayerStore } from '@/stores'
import { ZmcArgs } from '@/types/common'
import { wait } from '@/utils'
import gsap from 'gsap'
import { Application, Sprite } from 'pixi.js'
import { playBGEffect, removeBGEffect } from './bgEffectHandlers'
import { emitterContainer } from './emitterUtils'
import {calcBackgroundImageSize} from "@/layers/bgLayer";

/**
 * 初始化特效层, 订阅player的剧情信息.
 */
export function effectInit() {
  let playerStore = usePlayerStore()
  playerStore.app.stage.addChild(emitterContainer)
  eventBus.on('transitionIn', async transition => {
    let duration = transition.TransitionInDuration !== 1 ? transition.TransitionInDuration : 1000
    switch (transition.TransitionIn) {
      case 'fade':
        await playTransition('black', duration, 'in')
        break
      case 'fade_white':
        await playTransition('white', duration, 'in')
        break
      default: {
        if (transition.TransitionInResource === "Effect/UI/BGFX/UI_FX_HorSwipe_RtoL_Out") {
          await playHorSwipeTransition(duration);
        }
      }
    }
    eventBus.emit('transitionInDone')
  })
  eventBus.on('transitionOut', async transition => {
    let duration = transition.TransitionOutDuration !== 1 ? transition.TransitionOutDuration : 1000
    switch (transition.TransitionOut) {
      case 'fade':
        await playTransition('black', duration, 'out')
        break
      case 'fade_white':
        await playTransition('white', duration, 'out')
        break
   }
    eventBus.emit('transitionOutDone')
  })
  eventBus.on('playEffect', async effects => {
    let promiseArray: Array<Promise<any>> = []
    for (let effect of effects.otherEffect) {
      let bgInstance = playerStore.bgInstance
      switch (effect.type) {
        case 'wait':
          promiseArray.push(wait(effect.args))
          break;
        case 'bgshake':
          if (bgInstance) {
            promiseArray.push(playBgShake(bgInstance))
          }
          break
        case 'zmc':
          if (bgInstance) {
            promiseArray.push(zmcPlayer.playZmc(bgInstance, effect.args, playerStore.app))
          }
          break
        default:
          break;
      }
    }
    if (effects.BGEffect) {
      promiseArray.push(playBGEffect(effects.BGEffect))
    }
    await Promise.allSettled(promiseArray)
    eventBus.emit('effectDone')
  })
  eventBus.on('removeEffect', removeEffect)
}

export async function removeEffect() {
  await removeBGEffect()
  let { bgInstance } = usePlayerStore()
  zmcPlayer.removeZmc(bgInstance)
}

/**
 * 播放器渐变特效
 * @param color 渐变后的颜色
 * @param durationMs 渐变时间, 单位为ms
 * @param mode 渐变方式 in为淡入, out为淡出
 */
async function playTransition(color: 'black' | 'white', durationMs: number, mode: 'in' | 'out'): Promise<void> {
  let background = document.querySelector('#player__background') as HTMLDivElement
  background.style.backgroundColor = color
  let playerMain = document.querySelector('#player__main')
  switch (mode) {
    case 'in':
      await gsap.fromTo(playerMain, { alpha: 1 }, { alpha: 0, duration: durationMs / 1000 })
      break
    case 'out':
      await gsap.fromTo(playerMain, { alpha: 0 }, { alpha: 1, duration: durationMs / 1000 })
      break
  }
}

function playHorSwipeTransition(duration: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const background = document.querySelector('#player__background') as HTMLDivElement;
    const cover = document.createElement("div");
    const obj = { a: 0 };
    cover.classList.add("transition-cover");
    const style = getComputedStyle(background);
    cover.style.backgroundPositionX = style.width;
    background.appendChild(cover);
    let resolved = false;
    const timeline = gsap.timeline();
    timeline.to(cover, {
      backgroundPositionX: "0",
      duration: duration / 1000,
    }).to(obj, {
      a: 1,
      duration: 0.1,
      onStart() {
        resolve();
      }
    }).then(() => {
      background.removeChild(cover);
    });
  });

}

/**
 * 背景摇晃
 * @param bgInstance 背景图片实例
 */
async function playBgShake(bgInstance: Sprite): Promise<void> {
  let tl = gsap.timeline()
  let fromX = -bgInstance.width * 0.01
  let toX = bgInstance.width * 0.01
  await tl.to(bgInstance, {
    pixi: { x: `+=${fromX}` }, repeat: 1,
    yoyo: true, duration: 0.1
  })
    .to(bgInstance, {
      pixi: { x: `+=${toX}` },
      repeat: 1,
      yoyo: true,
      duration: 0.1
    })
    .repeat(1)
    .then()
}

/**
 * 可能对同个背景图片设置多次zmc, 用默认scale判断是否已经设置图片原始尺寸
 */
const Default_Scale = 100
let zmcPlayer = {
  bgInstanceOriginScale: Default_Scale,
  bgInstanceOriginPosition: { x: 0, y: 0 },
  onZmc: false,
  /**
   * 根据参数执行zmc效果
   * @param bgInstance 背景图片实例
   * @param args zmc参数
   * @param app pixi Application实例
   */
  async playZmc(bgInstance: Sprite, args: ZmcArgs, app: Application): Promise<void> {
    //背景图片切换时取消zmc状态
    this.onZmc = true
    let removeOnZmc = () => {
      this.onZmc = false
      eventBus.off('showBg', removeOnZmc)
    }
    eventBus.on('showBg', removeOnZmc)
    if (this.bgInstanceOriginScale === Default_Scale) {
      this.bgInstanceOriginScale = bgInstance.scale.x
      this.bgInstanceOriginPosition = bgInstance.position.clone()
    }
    const scaleArg = args.size;
    const offsetX = args.position[0];
    const offsetY = args.position[1];
    const { scale: rawScale } = calcBackgroundImageSize(bgInstance, app);
    const scale = 3150 / scaleArg;
    const finalScale = scale * rawScale;

    const viewHalfWidth = app.screen.width / 2;
    const viewHalfHeight = app.screen.height / 2;
    const finalOffsetX = offsetX / scale;
    const finalOffsetY = offsetY / scale;
    const afterScaleWidth = bgInstance.width / bgInstance.scale.x * finalScale;
    const afterScaleHalfWidth = afterScaleWidth / 2;
    const afterScaleHeight = bgInstance.height / bgInstance.scale.y * finalScale;
    const afterScaleHalfHeight = afterScaleHeight / 2;
    const finalX = -(afterScaleHalfWidth - ((viewHalfWidth - finalOffsetX)));
    const finalY = -(afterScaleHalfHeight - ((viewHalfHeight + finalOffsetY)));

    switch (args.type) {
      case 'instant':
        bgInstance.scale.set(finalScale);
        bgInstance.position.set(finalX, finalY);
        break
      case 'move':
        if (args.duration !== 10) {
          const timeline = gsap.timeline({
            defaults: {
              duration: args.duration / 1000
            }
          });
          await timeline.to(bgInstance, {
            x: finalX,
          }).to(bgInstance, {
            y: finalY,
          }, "<").to(bgInstance.scale, {
            x: finalScale,
          }, "<").to(bgInstance.scale, {
            y: finalScale,
          }, "<")
        }
        else {
          bgInstance.scale.set(finalScale);
          bgInstance.position.set(finalX, finalY);
        }
    }
  },

  /**
   * 移除zmc特效
   */
  async removeZmc(bgInstance: Sprite | null) {
    if (!this.onZmc) {
      this.bgInstanceOriginScale = Default_Scale
      return
    }
    if (bgInstance) {
      //存有图片原始比例且当前比例不是原始比例, 判断处于zmc状态
      if (this.onZmc
        && this.bgInstanceOriginScale !== Default_Scale
        && bgInstance.scale.x !== this.bgInstanceOriginScale) {
        bgInstance.scale.set(this.bgInstanceOriginScale)
        bgInstance.pivot.set(0, 0)
        bgInstance.position = this.bgInstanceOriginPosition
        this.bgInstanceOriginScale = Default_Scale
        this.onZmc = false
      }
    }
  }
}
