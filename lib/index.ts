import { storeToRefs } from "pinia";
import { Application } from "pixi.js";
import { textInit } from "./layers/textLayer";
import { usePlayerStore } from "./stores";
import { bgInit } from "@/layers/bgLayer"
import { characterInit } from "./layers/characterLayer";
import { soundInit } from "./layers/soundLayer";
import eventBus from "@/eventBus";
import axios from 'axios'
import { StoryRawUnit } from "./types/common";
import { translate } from '@/layers/translationLayer'
import { PlayAudio, PlayEffect } from "./types/events";

let playerStore: ReturnType<typeof usePlayerStore>
let l2dPlaying = false
let voiceIndex = 1
let playL2dVoice = true
/**
 * 调用各层的初始化函数
 */
export async function init(elementID: string, height: number, width: number, story: StoryRawUnit[], dataUrl: string) {
  playerStore = usePlayerStore()
  let { _app, allStoryUnit, effectDone, characterDone, loadRes, BGNameExcelTable, CharacterNameExcelTable, currentStoryIndex
    , BGMExcelTable, dataUrl: url
  } = storeToRefs(playerStore)
  url.value = dataUrl
  _app.value = new Application({ height, width })
  allStoryUnit.value = translate(story)

  addEmotionResources()
  // @ts-ignore
  _app.value!.loader
    .add('bg_park_night.jpg', `${dataUrl}/bg/BG_Park_Night.jpg`)
    .add('LobbyCH0184', `${dataUrl}/spine/CH0184_home/CH0184_home.skel`)
    .add('CH0184_spr', `${dataUrl}/spine/CH0184_spr/CH0184_spr.skel`)
    .load((loader, res) => {
      loadRes.value = res
    })

  await axios.get(`${dataUrl}/data/ScenarioBGNameExcelTable.json`).then(res => {
    for (let i of res.data['DataList']) {
      BGNameExcelTable.value[i['Name']] = i
    }
  })
  await axios.get(`${dataUrl}/data/ScenarioCharacterNameExcelTable.json`).then(res => {
    for (let i of res.data['DataList']) {
      CharacterNameExcelTable.value[i['CharacterName']] = i
    }
  })
  await axios.get(`${dataUrl}/data/BGMExcelTable.json`).then(res => {
    for (let i of res.data['DataList']) {
      BGMExcelTable.value[i['Id']] = i
    }
  })
  eventBus.on('next', () => {
    if (characterDone.value && effectDone.value) {
      currentStoryIndex.value++
      emitEvents()
    }
  })
  eventBus.on('select', e => {
    select(e)
    emitEvents()
  })
  eventBus.on('effectDone', () => effectDone.value = true)
  eventBus.on('characterDone', () => characterDone.value = true)
  eventBus.on('auto', () => console.log('auto!'))
  textInit()
  bgInit()
  characterInit()
  soundInit()

  document.querySelector(`#${elementID}`)?.appendChild(_app.value.view)
  eventBus.on('*', (type, e) => console.log(type, e))
  emitEvents()
}

/**
 * 根据当前剧情发送事件 
 */
export async function emitEvents() {
  let { currentStoryIndex, currentStoryUnit, allStoryUnit } = storeToRefs(playerStore)
  if (currentStoryIndex.value >= allStoryUnit.value.length) {
    end()
    return
  }
  showBg()
  showCharacter()
  playAudio()
  playL2d()
  hide()
  show()
  playEffect()

  if (currentStoryUnit.value.type == 'title') {
    eventBus.emit('showTitle', playerStore.text[0].content)
  }
  else if (currentStoryUnit.value.type == 'place') {
    eventBus.emit('showPlace', playerStore.text[0].content)
  }
  else if (currentStoryUnit.value.type == 'text') {
    eventBus.emit('showText', {
      text: playerStore.text,
      textEffect: playerStore.textEffect,
      speaker: playerStore.speaker
    })
  }
  else if (currentStoryUnit.value.type == 'option') {
    eventBus.emit('option', playerStore.option)
  }
  else if (currentStoryUnit.value.type == 'st') {
    eventBus.emit('st', {
      text: playerStore.text,
      textEffect: playerStore.textEffect,
      stArgs: playerStore.currentStoryUnit.stArgs!
    })
    if (l2dPlaying && playL2dVoice) {
      //判断并播放l2d语音, 根据clearST增加语音的下标
      eventBus.emit('playAudio', {
        voiceJPUrl: `${playerStore.dataUrl}/Audio/VoiceJp/${playerStore.l2dCharacterName}_MemorialLobby/${voiceIndex}.wav`
      })
      playL2dVoice = false
    }
  }
  else if (currentStoryUnit.value.type == 'effectOnly') {
    if (currentStoryUnit.value.clearSt) {
      eventBus.emit('clearSt')
      if (l2dPlaying) {
        voiceIndex++
        playL2dVoice = true
      }
    }
  }
  else if (currentStoryUnit.value.type == 'continue') {
  }
}

/**
 * 根据选择支加入下一语句
 */
export async function select(option: number) {
  let { currentStoryIndex } = storeToRefs(playerStore)
  while (playerStore.currentStoryUnit.SelectionGroup != option) {
    currentStoryIndex.value++
  }
}


/**
 * 结束播放
 */
export function end() {
  console.log('end!')
}

/**
 * 显示背景
 */
function showBg() {
  if (playerStore.bgUrl != '') {
    eventBus.emit('showBg', playerStore.bgUrl)
    if (l2dPlaying) {
      eventBus.emit('endL2D')
      l2dPlaying = false
    }
  }
}

/**
 * 显示角色
 */
function showCharacter() {
  if (playerStore.currentStoryUnit.characters.length != 0) {
    playerStore.characterDone = false
    eventBus.emit('showCharacter', {
      characters: playerStore.currentStoryUnit.characters,
      characterEffects: playerStore.currentStoryUnit.characterEffect
    })
  }
}

/**
 * 播放声音
 */
function playAudio() {
  let audio: PlayAudio = {}
  if (playerStore.bgmUrl != '') {
    audio.bgmUrl = playerStore.bgmUrl
  }
  if (playerStore.soundUrl != '') {
    audio.soundUrl = playerStore.soundUrl
  }
  if (Object.keys(audio).length != 0) {
    eventBus.emit('playAudio', audio)
  }
}


function playL2d() {
  if (playerStore.isL2d) {
    if (playerStore.l2dAnimationName == 'Idle_01') {
      eventBus.emit('playL2D')
      l2dPlaying = true
    }
    else {
      eventBus.emit('changeAnimation', playerStore.l2dAnimationName)
    }
  }
}

/**
 * 控制隐藏事件的发送
 */
function hide() {
  if (playerStore.currentStoryUnit.hide) {
    if (playerStore.currentStoryUnit.hide == 'all') {
      eventBus.emit('hidemenu')
    }
    else {
      eventBus.emit('hide')
    }
  }
}

function show() {
  if (playerStore.currentStoryUnit.show) {
    if (playerStore.currentStoryUnit.show == 'menu') {
      eventBus.emit('showmenu')
    }
  }
}

/**
 * 播饭特效
 */
function playEffect() {
  let { effectDone } = storeToRefs(playerStore)
  effectDone.value = false
  let effect: PlayEffect = {}
  let current = playerStore.currentStoryUnit
  if (current.BGEffect != 0) {
    effect.BGEffect = current.BGEffect
  }
  if (current.Transition != 0) {
    effect.Transition = current.Transition
  }
  if (current.otherEffect.length != 0) {
    effect.otherEffect = current.otherEffect
  }

  if (Object.keys(effect).length != 0) {
    eventBus.emit('playEffect', effect)
  }
}

function addLoadResources() {
  addEmotionResources()
  addBGNameResources()
}

/**
 * 添加人物情绪相关资源
 */
function addEmotionResources() {
  for (let i of Object.values(playerStore.emotionResourecesTable)) {
    for (let j of i) {
      playerStore.app.loader.add(j, `${playerStore.dataUrl}/emotions/${j}`)
    }
  }
}

/**
 * 根据BGName添加资源
 */
function addBGNameResources() {
  for (let i of playerStore.allStoryUnit) {
    if (i.BGName != 0) {
      let item = playerStore.BGNameExcelTable[i.BGName]
      if (item.BGType == 'Image') {
        let filename = String(item.BGFileName).split('/').pop()
        playerStore.app.loader.add(filename!, `${playerStore.dataUrl}/bg/${filename}.jpg`)
      }
      else {
        if (item.AnimationName == 'Idle_01') {
          let filename = String(item.BGFileName).split('/').pop()?.replace('SpineBG_Lobby', '')
          filename = `${filename}_home`
          playerStore.app.loader.add(filename, `${playerStore.dataUrl}/spine/${filename}/${filename}.skel`)
        }
      }
    }
  }
}