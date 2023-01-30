import eventBus from '@/eventBus'
import { usePlayerStore } from '@/stores'
import gsap from 'gsap'
import { Sprite } from 'pixi.js'
import { bgEffectHandlerOptions, bgEffectHandlers, emitterContainer } from './bgEffectHandlers'

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
      let bgEffectItem = effects.BGEffect
      let effect = bgEffectItem.Effect
      let resources = playerStore.bgEffectImgMap.get(effect)
      if (resources) {
        let imgs: Sprite[] = []
        for (let resource of resources) {
          imgs.push(Sprite.from(resource))
        }
        console.log(imgs)
        let handler = Reflect.get(bgEffectHandlers, effect)
        await handler(imgs, bgEffectItem, bgEffectHandlerOptions[effect])

        //默认会在特效完成后清除所有资源, 如果特效完成后需要留下一些效果, 请复制相关资源以使用
        for (let img of imgs) {
          img.destroy()
        }
      }
    }
    eventBus.emit('effectDone')
  })

}