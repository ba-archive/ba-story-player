import eventBus from '@/eventBus'
import { usePlayerStore } from '@/stores'
import { wait } from '@/utils'
import gsap from 'gsap'
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
      switch (effect.type) {
        case 'wait':
          promiseArray.push(wait(effect.args))
          break;
        case 'bgshake':
          let bgInstance = playerStore.bgInstance
          if (bgInstance) {
            let tl = gsap.timeline()
            let fromX = bgInstance.x - bgInstance.width * 0.01
            let toX = bgInstance.x + bgInstance.width * 0.01
            tl.to(bgInstance, {
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
            promiseArray.push(tl.then())
          }
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