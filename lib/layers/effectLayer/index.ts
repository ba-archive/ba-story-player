import eventBus from '@/eventBus'
import gsap from 'gsap'
/**
 * 初始化特效层, 订阅player的剧情信息.
 */
export function effectInit(){
  let player=document.querySelector('#player') as HTMLDivElement
  eventBus.on('transitionIn',transition=>{
    if(transition.TransitionIn=='fade'){
      player.style.backgroundColor='black'
      let playerCanvas=document.querySelector('#player canvas')
      gsap.to(playerCanvas,{alpha:0,duration:transition.TransitionInDuration/1000})
    }
  })
  eventBus.on('transitionOut',transition=>{
    if(transition.TransitionIn=='fade'){
      player.style.backgroundColor='black'
      let playerCanvas=document.querySelector('#player canvas')
      gsap.to(playerCanvas,{alpha:1,duration:transition.TransitionOutDuration/1000})
    }
  })
  eventBus.on('playEffect',effects=>{
    eventBus.emit('effectDone')
  })

}