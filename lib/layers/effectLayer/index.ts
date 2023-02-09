import eventBus from '@/eventBus'
import { usePlayerStore } from '@/stores'
import { ZmcArgs } from '@/types/common'
import { wait } from '@/utils'
import gsap from 'gsap'
import { Application, Sprite } from 'pixi.js'
import { emitterContainer, playBGEffect, removeBGEffect } from './bgEffectHandlers'

/**
 * 初始化特效层, 订阅player的剧情信息.
 */
export function effectInit() {
  let playerStore = usePlayerStore()
  playerStore.app.stage.addChild(emitterContainer)
  eventBus.on('transitionIn', async transition => {
    let duration = transition.TransitionInDuration !== 1 ? transition.TransitionInDuration : transition.TransitionOutDuration
    switch (transition.TransitionIn) {
      case 'fade':
        await playTransition('black', duration, 'in')
        break
      case 'fade_white':
        await playTransition('white', duration, 'in')
        break
    }
    eventBus.emit('transitionInDone')
  })
  eventBus.on('transitionOut', async transition => {
    let duration = transition.TransitionOutDuration !== 1 ? transition.TransitionOutDuration : transition.TransitionInDuration
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
  let player = document.querySelector('#player') as HTMLDivElement
  player.style.backgroundColor = color
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

/**
 * 背景摇晃
 * @param bgInstance 背景图片实例
 */
async function playBgShake(bgInstance: Sprite): Promise<void> {
  let tl = gsap.timeline()
  let fromX = bgInstance.x - bgInstance.width * 0.01
  let toX = bgInstance.x + bgInstance.width * 0.01
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

const Default_Scale = 100
let zmcPlayer = {
  bgInstanceOriginScale: Default_Scale,
  bgInstanceOriginPosition: { x: 0, y: 0 },
  /**
   * 根据参数执行zmc效果
   * @param bgInstance 背景图片实例
   * @param args zmc参数
   * @param app pixi Application实例
   */
  async playZmc(bgInstance: Sprite, args: ZmcArgs, app: Application): Promise<void> {
    if (this.bgInstanceOriginScale === Default_Scale) {
      this.bgInstanceOriginScale = bgInstance.scale.x
      this.bgInstanceOriginPosition = bgInstance.position.clone()
    }
    bgInstance.scale.set(1)
    bgInstance.anchor.set(0.5, 0.5)
    //大小算法尚不明确, 先用一个魔法数代替
    bgInstance.scale.set(args.size / bgInstance.width * (7 / 8) * this.bgInstanceOriginScale)
    switch (args.type) {
      case 'instant':
        bgInstance.pivot.x += args.position[0]
        //y轴方向与pixi默认方向相反
        bgInstance.pivot.y += -args.position[1]
        bgInstance.position.set(app.screen.width / 2, app.screen.height / 2)
        break
      case 'move':
        if (args.duration !== 10) {
          //不清楚具体如何作用, 经测试大概需要乘以原来缩放的1.5倍
          let positionProportion = this.bgInstanceOriginScale * 1.5
          await gsap.to(bgInstance, {
            pixi: { x: `+=${args.position[0] * positionProportion}`, y: `+=${args.position[1] * positionProportion}` },
            duration: args.duration / 1000
          }).then()
        }
        else {
          bgInstance.pivot.x += args.position[0]
          bgInstance.pivot.y += -args.position[1]
          bgInstance.position.set(app.screen.width / 2, app.screen.height / 2)
        }
    }
  },

  /**
   * 移除zmc特效
   */
  async removeZmc(bgInstance: Sprite | null) {
    if (bgInstance) {
      if (this.bgInstanceOriginScale !== Default_Scale) {
        bgInstance.scale.set(this.bgInstanceOriginScale)
        bgInstance.pivot.set(0, 0)
        bgInstance.position = this.bgInstanceOriginPosition
      }
    }
  }
}
