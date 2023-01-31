import eventBus from '@/eventBus'
import { usePlayerStore } from '@/stores'
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
    for (let effect of effects.otherEffect) {
    }
    if (effects.BGEffect) {
      await playBGEffect(effects.BGEffect)
    }
    eventBus.emit('effectDone')
  })
  eventBus.on('removeEffect', removeEffect)
}

export async function removeEffect() {
  await removeBGEffect()
}