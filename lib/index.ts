import { Application, Loader, Text, settings } from "pixi.js";
import { SpineParser } from 'pixi-spine'
import { textInit } from "./layers/textLayer";
import { usePlayerStore, initPrivateState } from "./stores";
import { bgInit } from "@/layers/bgLayer"
import { characterInit } from "./layers/characterLayer";
import { soundInit } from "./layers/soundLayer";
import eventBus from "@/eventBus";
import axios from 'axios'
import { StoryRawUnit } from "./types/common";
import { translate } from '@/layers/translationLayer'
import { PlayAudio, PlayEffect } from "@/types/events";
import { effectInit } from '@/layers/effectLayer'
import { Language } from "./types/store";

let playerStore: ReturnType<typeof usePlayerStore>
let privateState: ReturnType<typeof initPrivateState>
let l2dPlaying = false
let voiceIndex = 1
let playL2dVoice = true
let l2dVoiceExcelTable = {
  'CH0184_MemorialLobby': [...Array(10).keys()].slice(1, 11).map(value => value.toString())
} as { [index: string]: string[] }
let characterDone = true
let effectDone = true
let app: Application

/**
 * 调用各层的初始化函数
 */
export async function init(elementID: string, height: number, width: number, story: StoryRawUnit[], dataUrl: string, language: Language) {
  //缓解图片缩放失真
  settings.MIPMAP_TEXTURES = 2

  playerStore = usePlayerStore()
  privateState = initPrivateState()
  privateState.dataUrl = dataUrl
  privateState.language = language
  //加入判断防止vite热更新重新创建app导致加载资源错误
  if (!privateState.app) {
    privateState.app = new Application({ height, width })
  }

  app = playerStore.app

  document.querySelector(`#${elementID}`)?.appendChild(app.view)
  //添加提示加载文字
  let loadingText = new Text('loading...', { fill: ['white'] })
  loadingText.y = app.screen.height - 50
  loadingText.x = app.screen.width - 150
  app.stage.addChild(loadingText)
  eventBus.on('*', (type, e) => console.log(type, e))

  Loader.registerPlugin(SpineParser);

  await loadExcels()
  privateState.allStoryUnit = translate(story)
  addLoadResources()

  eventBus.on('next', () => {
    if (characterDone && effectDone) {
      if (!playerStore.storyIndexIncrement()) {
        end()
        return
      }
      emitEvents()
    }
  })
  eventBus.on('select', e => {
    playerStore.select(e)
    emitEvents()
  })
  eventBus.on('effectDone', () => effectDone = true)
  eventBus.on('characterDone', () => characterDone = true)
  eventBus.on('auto', () => console.log('auto!'))

  textInit()
  bgInit()
  characterInit()
  soundInit()
  effectInit()

  let hasLoad = false
  app.loader.load((loader, res) => {
    privateState.loadRes = res
    playerStore.app.loader.load((loader, res) => {
      //当chrome webgl inspector打开时可能导致callback被执行两次
      if (!hasLoad) {
        console.log(res)
        app.stage.removeChild(loadingText)
        emitEvents()
        hasLoad = true
        // window.app = app;
        // eventBus.emit("showCharacter", {
        //   characters: [{
        //     "CharacterName": 4179367264,
        //     "position": 3,
        //     "face": "05",
        //     "highlight": false,
        //     "effects": [
        //       {
        //         "type": "action",
        //         "effect": "a",
        //         "async": false
        //       }
        //     ]
        //   }]
        // })
      }
    })
  })

}

/**
 * 根据当前剧情发送事件
 */
export async function emitEvents() {
  await transitionIn()
  hide()
  showBg()
  await transitionOut()
  showCharacter()
  playAudio()
  playL2d()
  show()
  playEffect()

  switch (playerStore.currentStoryUnit.type) {
    case 'title':
      eventBus.emit('showTitle', playerStore.text[0].content)
      break
    case 'place':
      eventBus.emit('showPlace', playerStore.text[0].content)
      break
    case 'text':
      eventBus.emit('showText', {
        text: playerStore.text,
        textEffect: playerStore.textEffect,
        speaker: playerStore.speaker
      })
      break
    case 'option':
      eventBus.emit('option', playerStore.option)
      break
    case 'st':
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
      break
    case 'effectOnly':
      if (playerStore.currentStoryUnit.clearSt) {
        eventBus.emit('clearSt')
        if (l2dPlaying) {
          voiceIndex++
          playL2dVoice = true
        }
      }
      break
    case 'continue':
      break
    default:
      console.log(`本体中尚未处理${playerStore.currentStoryUnit.type}类型故事节点`)
  }

}

/**
 * 结束播放
 */
export function end() {
  console.log('播放结束')
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
    characterDone = false
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
  if (playerStore.l2dCharacterName !== '') {
    if (playerStore.l2dAnimationName === 'Idle_01') {
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
    if (playerStore.currentStoryUnit.hide === 'all') {
      eventBus.emit('hidemenu')
    }
    else {
      eventBus.emit('hide')
    }
  }
}

function show() {
  if (playerStore.currentStoryUnit.show) {
    if (playerStore.currentStoryUnit.show === 'menu') {
      eventBus.emit('showmenu')
    }
  }
}

/**
 * 播放特效
 */
function playEffect() {
  effectDone = false
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
  addFXResources()
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
        if (!app.loader.resources[filename]) {
          app.loader.add(filename, `${dataUrl}/spine/${filename}/${filename}.skel`)
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
 * 添加人物情绪相关资源(图片和声音)
 */
async function addEmotionResources() {
  for (let emotionResources of Object.values(playerStore.emotionResourcesTable)) {
    for (let emotionResource of emotionResources) {
      if (!playerStore.app.loader.resources[emotionResource]) {
        playerStore.app.loader.add(emotionResource, `${playerStore.dataUrl}/emotions/${emotionResource}`)
      }
    }
  }
  for (let emotionName of Object.keys(playerStore.emotionResourcesTable)) {
    let emotionSoundName = `SFX_Emoticon_Motion_${emotionName}`
    if (!playerStore.app.loader.resources[emotionSoundName]) {
      playerStore.app.loader.add(emotionSoundName, `${playerStore.dataUrl}/Audio/Sound/${emotionSoundName}.wav`)
    }
  }
}

/**
 * 添加FX相关资源
 */
async function addFXResources() {
  for (let fxImages of Object.values(playerStore.fxImageTable)) {
    for (let url of fxImages) {
      if (!playerStore.app.loader.resources[url]) {
        playerStore.app.loader.add(url, `${playerStore.dataUrl}/fx/${url}`)
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
          if (!app.loader.resources[filename!]) {
            app.loader.add(filename, `${playerStore.dataUrl}/spine/${filename}/${filename}.skel`)
            addL2dVoice(filename.replace('_home', ''))
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
  await axios.get(`${dataUrl}/data/ScenarioBGNameExcelTable.json`).then(res => {
    for (let i of res.data['DataList']) {
      privateState.BGNameExcelTable[i['Name']] = i
    }
  })
  await axios.get(`${dataUrl}/data/ScenarioCharacterNameExcelTable.json`).then(res => {
    for (let i of res.data['DataList']) {
      privateState.CharacterNameExcelTable[i['CharacterName']] = i
    }
  })
  await axios.get(`${dataUrl}/data/BGMExcelTable.json`).then(res => {
    for (let i of res.data['DataList']) {
      privateState.BGMExcelTable[i['Id']] = i
    }
  })
  await axios.get(`${dataUrl}/data/ScenarioTransitionExcelTable.json`).then(res => {
    for (let i of res.data['DataList']) {
      privateState.TransitionExcelTable[i['Name']] = i
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
