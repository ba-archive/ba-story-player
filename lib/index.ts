import { storeToRefs } from "pinia";
import { Application, Loader } from "pixi.js";
import { textInit } from "./layers/textLayer";
import { usePlayerStore } from "./stores";
import { bgInit } from "@/layers/bgLayer"
import { characterInit } from "./layers/characterLayer";
import { soundInit } from "./layers/soundLayer";


/**
 * 调用各层的初始化函数
 */
export async function init(elementID: string, height: number, width: number) {
  let playerStore = usePlayerStore()
  let { _app, _eventBus, currentStoryUnit, allStoryUnit, effectDone, characterDone, loadRes } = storeToRefs(playerStore)
  _app.value = new Application({ height, width })
  playerStore.characterName
  

  _app.value!.loader.add('bg_park_night.jpg', '/bg/BG_Park_Night.jpg')
    .add('LobbyCH0186', '/l2d/LobbyCH0184/CH0184_home.skel')
    .add('CH0184_spr', '/spr/CH0184/CH0184_spr.skel')
    .load((loader, res) => {
      loadRes.value = res
    })

  _eventBus.value.on('next', () => {
    if (characterDone.value && effectDone.value) {
      next()
      playerStore.nextInit()
    }
  }) 
  _eventBus.value.on('select', e => select(e))
  _eventBus.value.on('effectDone', () => effectDone.value = true)
  _eventBus.value.on('characterDone', () => characterDone.value = true)

  textInit()
  bgInit()
  characterInit()
  soundInit()

  document.querySelector(`#${elementID}`)?.appendChild(_app.value.view)
  next()
}

/**
 * 下一剧情语句
 */
export async function next() {
  let playerStore = usePlayerStore()
  let { currentStoryIndex, currentStoryUnit, allStoryUnit, eventBus, language } = storeToRefs(playerStore)
  currentStoryIndex.value += 1
  if (currentStoryIndex.value >= allStoryUnit.value.length) {
    end()
    return
  }
  if (currentStoryUnit.value.type == 'title') {
    if (checkLanguage()) {
      eventBus.value.emit('showTitle', currentStoryUnit.value.text[`Text${language.value}`]![0].content)
    }
    else {
      eventBus.value.emit('showTitle', currentStoryUnit.value.text.TextJp[0].content)
    }
  }
  else if (currentStoryUnit.value.type == 'place') {
    if (checkLanguage()) {
      eventBus.value.emit('showPlace', currentStoryUnit.value.text[`Text${language.value}`]![0].content)
    }
    else {
      eventBus.value.emit('showPlace', currentStoryUnit.value.text.TextJp[0].content)
    }
  }
  else if(currentStoryUnit.value.type=='text'){

  }
  else if(currentStoryUnit.value.type=='option'){

  }
  else if(currentStoryUnit.value.type=='st'){

  }
  else if(currentStoryUnit.value.type=='effectOnly'){

  }
  else if(currentStoryUnit.value.type=='continue'){

  }
}

/**
 * 根据选择支加入下一语句
 */
export async function select(option: number) {

}


/**
 * 结束播放
 */
export function end() {
  console.log('end!')
}

function checkLanguage() {
  let playerStore = usePlayerStore()
  return playerStore.currentStoryUnit.text[`Text${playerStore.language}`] != undefined
}
