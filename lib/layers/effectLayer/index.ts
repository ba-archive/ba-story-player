import eventBus from '@/eventBus'
import gsap from 'gsap'
/**
 * 初始化特效层, 订阅player的剧情信息.
 */
export function effectInit() {
  let player = document.querySelector('#player') as HTMLDivElement
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
    for(let effect of effects.otherEffect){
      
    }
    eventBus.emit('effectDone')
  })

}