import eventBus from '@/eventBus'
import { usePlayerStore } from '@/stores'
import { wait } from '@/utils'
import gsap from 'gsap'
import { emitterContainer, playBGEffect, removeBGEffect } from './bgEffectHandlers'

/**
 * 初始化特效层, 订阅player的剧情信息.
 */
export function effectInit() {
  let player = document.querySelector('#player') as HTMLDivElement
  let playerStore = usePlayerStore()
  playerStore.app.stage.addChild(emitterContainer)
  eventBus.on('transitionIn', transition => {
    if (transition.TransitionIn == 'fade') {
      player.style.backgroundColor = 'black'
      let playerMain = document.querySelector('#player__main')
      gsap.to(playerMain, { alpha: 0, duration: transition.TransitionInDuration / 1000 })
    }
  })
  eventBus.on('transitionOut', transition => {
    if (transition.TransitionIn == 'fade') {
      player.style.backgroundColor = 'black'
      let playerMain = document.querySelector('#player__main')
      gsap.to(playerMain, { alpha: 1, duration: transition.TransitionOutDuration / 1000 })
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