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
  eventBus.on('transitionIn', transition => {
    switch (transition.TransitionIn) {
      case 'fade':
        playTransition('black', transition.TransitionInDuration, 'in')
        break
      case 'fade_white':
        playTransition('white', transition.TransitionInDuration, 'in')
        break
    }
  })
  eventBus.on('transitionOut', transition => {
    switch (transition.TransitionOut) {
      case 'fade':
        playTransition('black', transition.TransitionOutDuration, 'out')
        break
      case 'fade_white':
        playTransition('white', transition.TransitionOutDuration, 'out')
        break
    }
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
            promiseArray.push(playZmc(bgInstance, effect.args, playerStore.app))
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
}

/**
 * 播放器渐变特效
 * @param color 渐变后的颜色
 * @param durationMs 渐变时间, 单位为ms
 * @param mode 渐变方式 in为淡入, out为淡出
 */
function playTransition(color: 'black' | 'white', durationMs: number, mode: 'in' | 'out') {
  let player = document.querySelector('#player') as HTMLDivElement
  player.style.backgroundColor = color
  let playerMain = document.querySelector('#player__main')
  switch (mode) {
    case 'in':
      gsap.fromTo(playerMain, { alpha: 1 }, { alpha: 0, duration: durationMs / 1000 })
      break
    case 'out':
      gsap.fromTo(playerMain, { alpha: 0 }, { alpha: 1, duration: durationMs / 1000 })
      break
  }
}

/**
 * 背景摇晃
 * @param bgInstance 背景图片实例
 */
async function playBgShake(bgInstance: Sprite) {
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

/**
 * 根据参数执行zmc效果
 * @param bgInstance 背景图片实例
 * @param args zmc参数
 * @param app pixi Application实例
 */
async function playZmc(bgInstance: Sprite, args: ZmcArgs, app: Application) {
  bgInstance.scale.set(1)
  bgInstance.anchor.set(0.5, 0.5)
  //大小算法尚不明确
  bgInstance.scale.set(args.size / bgInstance.width * 0.5)
  switch (args.type) {
    case 'instant':
      bgInstance.pivot.x += args.position[0]
      //y轴方向与pixi默认方向相反
      bgInstance.pivot.y += -args.position[1]
      bgInstance.position.set(app.screen.width / 2, app.screen.height / 2)
      break
    case 'move':
      if (args.duration !== 10) {
        await gsap.to(bgInstance, {
          pixi: { x: `+=${args.position[0]}`, y: `+=${args.position[1]}` },
          duration: args.duration / 1000
        }).then()
      }
      else {
        bgInstance.pivot.x += args.position[0]
        bgInstance.pivot.y += -args.position[1]
        bgInstance.position.set(app.screen.width / 2, app.screen.height / 2)
      }
  }
}