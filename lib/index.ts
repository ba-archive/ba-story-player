import { storeToRefs } from "pinia";
import { Application, Loader, Text } from "pixi.js";
import { SpineParser } from 'pixi-spine'
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
import { effectInit } from '@/layers/effectLayer'
import spineLoader, { setLoadRes, getLoadRes } from '@/stores/spineLoader'

let playerStore: ReturnType<typeof usePlayerStore>
let l2dPlaying = false
let voiceIndex = 1
let playL2dVoice = true
let l2dVoiceExcelTable = {
  'CH0184_MemorialLobby': [...Array(10).keys()].slice(1, 11).map(value => value.toString())
} as { [index: string]: string[] }
/**
 * 调用各层的初始化函数
 */
export async function init(elementID: string, height: number, width: number, story: StoryRawUnit[], dataUrl: string) {
  playerStore = usePlayerStore()
  let { _app, allStoryUnit, effectDone, characterDone, currentStoryIndex
    , dataUrl: url
  } = storeToRefs(playerStore)
  url.value = dataUrl
  _app.value = new Application({ height, width })
  let app = playerStore.app

  document.querySelector(`#${elementID}`)?.appendChild(app.view)
  let loadingText = new Text('loading...', { fill: ['white'] })
  loadingText.y = app.screen.height - 50
  loadingText.x = app.screen.width - 150
  app.stage.addChild(loadingText)
  eventBus.on('*', (type, e) => console.log(type, e))

  Loader.registerPlugin(SpineParser);


  await loadExcels()
  allStoryUnit.value = translate(story)
  addLoadResources()
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
  // characterInit()
  soundInit()
  effectInit()

  let hasLoad = false
  spineLoader.load((loader, res) => {
    setLoadRes(res)
    playerStore.app.loader.load((loader, res) => {
      //当chrome webgl inspector打开时可能导致callback被执行两次
      if (!hasLoad) {
        console.log(res)
        app.stage.removeChild(loadingText)
        emitEvents()
        hasLoad = true
      }
    })
  })

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
  await transitionIn()
  hide()
  showBg()
  await transitionOut()
  showCharacter()
  playAudio()
  playL2d()
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
      // characterEffects: playerStore.currentStoryUnit.characterEffect
    })
  }
}

/**
 * 播放声音
 */
function playAudio() {
  let audio: PlayAudio = {}
  if (playerStore.bgmUrl != '') {
    audio.bgm = {
      url: playerStore.bgmUrl,
      bgmArgs: playerStore.bgmArgs!
    }
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
 * 播放特效
 */
function playEffect() {
  let { effectDone } = storeToRefs(playerStore)
  effectDone.value = false
  let effect: PlayEffect = {}
  let current = playerStore.currentStoryUnit
  if (current.BGEffect != 0) {
    effect.BGEffect = current.BGEffect
  }
  if (current.otherEffect.length != 0) {
    effect.otherEffect = current.otherEffect
  }

  if (Object.keys(effect).length != 0) {
    eventBus.emit('playEffect', effect)
  }
}

/**
 * 添加所有资源
 */
function addLoadResources() {
  addCharacterSpineResources()
  addEmotionResources()
  addBGNameResources()
  addBgmResources()
  addSoundResources()
}

/**
 * 添加人物立绘资源
 */
function addCharacterSpineResources() {
  let dataUrl = playerStore.dataUrl
  for (let unit of playerStore.allStoryUnit) {
    if (unit.characters.length != 0) {
      for (let character of unit.characters) {
        let filename = getCharacterFileName(character.CharacterName)
        if (!spineLoader.resources[filename]) {
          spineLoader.add(filename, `${dataUrl}/spine/${filename}/${filename}.skel`)
        }
      }
    }
  }
}

/**
 * 获取人物立绘文件名
 */
function getCharacterFileName(CharacterName: number) {
  let item = playerStore.CharacterNameExcelTable[CharacterName]
  let temp = String(item.SpinePrefabName).split('/')
  temp = temp[temp.length - 1].split('_')
  let id = temp[temp.length - 1]
  return `${id}_spr`
}

/**
 * 添加人物情绪相关资源
 */
async function addEmotionResources() {
  for (let emotionResources of Object.values(playerStore.emotionResourcesTable)) {
    for (let emotionResource of emotionResources) {
      if (!playerStore.app.loader.resources[emotionResource]) {
        playerStore.app.loader.add(emotionResource, `${playerStore.dataUrl}/emotions/${emotionResource}`)
      }
    }
  }
}

/**
 * 添加bgm资源
 */
function addBgmResources() {
  let loader = playerStore.app.loader
  for (let unit of playerStore.allStoryUnit) {
    if (unit.BGMId != 0) {
      let path = getBgmPath(unit.BGMId)
      if (!loader.resources[path]) {
        loader.add(path, path)
      }
    }
  }
}

/**
 * 获取bgm地址
 */
function getBgmPath(id: number) {
  let item = playerStore.BGMExcelTable[id]
  return `${playerStore.dataUrl}/${item.Path}.ogg`
}

/**
 * 添加sound资源
 */
function addSoundResources() {
  let loader = playerStore.app.loader
  for (let unit of playerStore.allStoryUnit) {
    if (unit.Sound != '') {
      let path = `${playerStore.dataUrl}/Audio/Sound/${unit.Sound}.wav`
      if (!loader.resources[path]) {
        loader.add(path, path)
      }
    }
  }
}

/**
 * 根据BGName添加资源, 即加载背景和l2d资源
 */
function addBGNameResources() {
  for (let i of playerStore.allStoryUnit) {
    if (i.BGName != 0) {
      let item = playerStore.BGNameExcelTable[i.BGName]
      if (item.BGType == 'Image') {
        let filename = String(item.BGFileName).split('/').pop()
        if (!playerStore.app.loader.resources[filename!]) {
          playerStore.app.loader.add(filename!, `${playerStore.dataUrl}/bg/${filename}.jpg`);
        }
      }
      else {
        if (item.AnimationName == 'Idle_01') {
          let filename = String(item.BGFileName).split('/').pop()?.replace('SpineBG_Lobby', '')
          filename = `${filename}_home`
          if (!spineLoader.resources[filename!]) {
            spineLoader.add(filename, `${playerStore.dataUrl}/spine/${filename}/${filename}.skel`)
            addL2dVoice(filename.replace('_home',''))
          }
        }
      }
    }
  }
}

/**
 * 添加l2d语音
 */
function addL2dVoice(name: string) {
  let voicePath = `${name}_MemorialLobby`
  console.log(voicePath)
  for (let voiceFileName of l2dVoiceExcelTable[voicePath]) {
    playerStore.app.loader.add(voiceFileName,
      `${playerStore.dataUrl}/Audio/VoiceJp/${voicePath}/${voiceFileName}.wav`)
  }
}

/**
 * 加载原始数据资源
 */
async function loadExcels() {
  let dataUrl = playerStore.dataUrl
  let { BGNameExcelTable, CharacterNameExcelTable, BGMExcelTable, TransitionExcelTable } = storeToRefs(playerStore)
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
  await axios.get(`${dataUrl}/data/ScenarioTransitionExcelTable.json`).then(res => {
    for (let i of res.data['DataList']) {
      TransitionExcelTable.value[i['Name']] = i
    }
  })
}

async function transitionIn() {
  let name = playerStore.currentStoryUnit.Transition
  if (name) {
    let item = playerStore.TransitionExcelTable[name]
    eventBus.emit('transitionIn', item)
    await wait(item.TransitionInDuration)
  }
}

async function transitionOut() {
  let name = playerStore.currentStoryUnit.Transition
  if (name) {
    let item = playerStore.TransitionExcelTable[name]
    eventBus.emit('transitionOut', item)
    await wait(item.TransitionOutDuration)
  }
}

/**
 * wait in promise
 */
function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
