import eventBus from "@/eventBus";
import { bgInit } from "@/layers/bgLayer";
import { characterInit } from "@/layers/characterLayer";
import { effectInit } from '@/layers/effectLayer';
import { soundInit } from "@/layers/soundLayer";
import { translate } from '@/layers/translationLayer';
import { initPrivateState, usePlayerStore } from "@/stores";
import { PlayerProps, StoryUnit } from "@/types/common";
import * as utils from '@/utils';
import { getOtherSoundUrls, wait } from "@/utils";
import axios from 'axios';
import { SpineParser } from 'pixi-spine';
import { Application, Loader, settings, Text } from "pixi.js";
import { L2DInit } from "./layers/l2dLayer/L2D";

let playerStore: ReturnType<typeof usePlayerStore>
let privateState: ReturnType<typeof initPrivateState>
let l2dVoiceExcelTable = {
  'CH0184_MemorialLobby': [...Array(10).keys()].slice(1, 11).map(value => value.toString())
} as { [index: string]: string[] }

/**
 * 调用各层的初始化函数
 */
export async function init(elementID: string, props: PlayerProps, endCallback: () => void) {
  //缓解图片缩放失真
  settings.MIPMAP_TEXTURES = 2

  storyHandler.endCallback = endCallback
  playerStore = usePlayerStore()
  privateState = initPrivateState()
  utils.setDataUrl(props.dataUrl)
  privateState.dataUrl = props.dataUrl
  privateState.language = props.language
  privateState.userName = props.userName
  privateState.storySummary = props.storySummary
  //加入判断防止vite热更新重新创建app导致加载资源错误
  if (!privateState.app) {
    privateState.app = new Application({ height: props.height, width: props.width })
  }

  let app = playerStore.app
  document.querySelector(`#${elementID}`)?.appendChild(app.view)

  Loader.registerPlugin(SpineParser);

  //添加加载文字并加载初始化资源以便翻译层进行翻译
  let loadingText = new Text('loading...', { fill: ['white'] })
  loadingText.y = app.screen.height - 50
  loadingText.x = app.screen.width - 150
  app.stage.addChild(loadingText)
  await resourcesLoader.init(app.loader)
  privateState.allStoryUnit = translate(props.story)

  bgInit()
  characterInit()
  soundInit()
  effectInit()
  L2DInit()

  //加载剩余资源
  resourcesLoader.addLoadResources()
  resourcesLoader.load(() => {
    app.stage.removeChild(loadingText)
    loadingText.destroy()
    console.log(playerStore)
    //开始发送事件
    eventEmitter.init()
  })
}


/**
 * 处理故事进度对象
 */
export let storyHandler = {
  currentStoryIndex: 0,
  endCallback: () => { },
  unitPlaying: false,
  auto: false,

  get currentStoryUnit(): StoryUnit {
    if (playerStore && playerStore.allStoryUnit.length > this.currentStoryIndex) {
      return playerStore.allStoryUnit[this.currentStoryIndex]
    }

    //默认值
    return {
      type: 'text',
      GroupId: 0,
      SelectionGroup: 0,
      PopupFileName: '',
      audio: {},
      effect: { otherEffect: [] },
      characters: [],
      textAbout: {
        showText: {
          text: []
        }
      }
    }
  },

  /**
   * 通过下标递增更新当前故事节点
   */
  storyIndexIncrement() {
    if (this.checkEnd()) {
      return
    }
    let currentSelectionGroup = this.currentStoryUnit.SelectionGroup
    this.currentStoryIndex++
    while (!this.checkEnd() &&
      ![0, currentSelectionGroup].includes(this.currentStoryUnit.SelectionGroup)) {
      this.currentStoryIndex++
    }

    return true
  },

  next() {
    if (eventEmitter.unitDone && !this.unitPlaying && !this.auto) {
      storyHandler.storyIndexIncrement()
      storyHandler.storyPlay()
    }
  },

  /**
   * 根据选项控制故事节点
   * @param option
   * @returns
   */
  select(option: number) {
    if (option === 0) {
      this.storyIndexIncrement()
      return
    }
    let index = playerStore.allStoryUnit.findIndex(value => value.SelectionGroup === option)
    if (index === -1) {
      return false
    }
    this.currentStoryIndex = index
    return true
  },
  /**
    * 播放故事直到对话框或选项出现, auto模式下只在选项时停下
    */
  async storyPlay() {
    if (!this.unitPlaying) {
      this.unitPlaying = true
      //当auto开启时只在选项停下
      let playCondition = () => {
        if (this.auto) {
          return ['option']
        }
        else {
          return ['text', 'option']
        }
      }
      while (!playCondition().includes(storyHandler.currentStoryUnit.type)) {
        await eventEmitter.emitEvents()
        storyHandler.storyIndexIncrement()
      }
      await eventEmitter.emitEvents()
      this.unitPlaying = false
    }
  },

  /**
   * 检查故事是否已经结束, 结束则调用结束函数结束播放
   */
  checkEnd() {
    if (playerStore.allStoryUnit.length <= this.currentStoryIndex) {
      this.end()
      return true
    }

    return false
  },

  /**
   * 结束播放
   */
  end() {
    console.log('播放结束')
    this.auto = false
    this.endCallback()
  },

  /**
   * 开启auto模式
   */
  startAuto() {
    this.auto = true
    if (!this.unitPlaying) {
      if (this.currentStoryUnit.type !== 'option') {
        this.storyIndexIncrement()
        this.storyPlay()
      }
    }
    else {
      //可能storyPlay正要结束但还没结束导致判断错误
      setTimeout(() => {
        if (!this.unitPlaying) {
          if (this.currentStoryUnit.type !== 'option') {
            this.storyIndexIncrement()
            this.storyPlay()
          }
        }
      }, 2000)
    }
  },

  /**
   * 停止auto模式
   */
  stopAuto() {
    this.auto = false
  }
}


/**
 * 事件发送控制对象
 */
export let eventEmitter = {
  /** 当前是否处于l2d播放中, 并不特指l2d某个动画 */
  l2dPlaying: false,
  voiceIndex: 1,
  playL2dVoice: true,
  characterDone: true,
  effectDone: true,
  titleDone: true,
  textDone: true,
  stDone: true,
  /** 当前l2d动画是否播放完成 */
  l2dAnimationDone: true,

  get unitDone(): boolean {
    let result = true
    for (let key of Object.keys(eventEmitter) as Array<keyof typeof eventEmitter>) {
      if (key.endsWith('Done') && key !== 'unitDone') {
        result = result && eventEmitter[key] as boolean
      }
    }
    return result
  },

  /**
   * 注册事件
   */
  init() {
    eventBus.on('next', () => {
      storyHandler.next()
    })
    eventBus.on('select', e => {
      if (this.unitDone) {
        storyHandler.select(e)
        storyHandler.storyPlay()
      }
    })
    eventBus.on('effectDone', () => eventEmitter.effectDone = true)
    eventBus.on('characterDone', () => eventEmitter.characterDone = true)
    eventBus.on('titleDone', () => this.titleDone = true)
    eventBus.on('stDone', () => this.stDone = true)
    eventBus.on('l2dAnimationDone', (e) => { if (e.done) { eventEmitter.l2dAnimationDone = e.done } })
    eventBus.on('textDone', async () => {
      //等待一段时间在textDone, 提升auto的体验
      if (storyHandler.auto) {
        await wait(1000)
      }
      this.textDone = true
    })
    eventBus.on('auto', () => storyHandler.startAuto())
    eventBus.on('stopAuto', () => storyHandler.stopAuto())

    storyHandler.storyPlay()
  },

  /**
   * 根据当前剧情发送事件
   */
  async emitEvents() {
    // TODO: 上线注释, 也可以不注释
    console.log('剧情进度: ' + storyHandler.currentStoryIndex, storyHandler.currentStoryUnit)
    await this.transitionIn()
    this.hide()
    this.showBg()
    this.playEffect()
    this.playL2d()
    this.playAudio()
    this.clearSt()
    await this.transitionOut()
    this.showCharacter()
    this.show()

    let currentStoryUnit = storyHandler.currentStoryUnit
    switch (currentStoryUnit.type) {
      case 'title':
        this.titleDone = false
        if (currentStoryUnit.textAbout.word) {
          eventBus.emit('showTitle', currentStoryUnit.textAbout.word)
        }
        break
      case 'place':
        if (currentStoryUnit.textAbout.word) {
          eventBus.emit('showPlace', currentStoryUnit.textAbout.word)
        }
        break
      case 'text':
        this.textDone = false
        eventBus.emit('showText', currentStoryUnit.textAbout.showText)
        break
      case 'option':
        if (currentStoryUnit.textAbout.options) {
          eventBus.emit('option', currentStoryUnit.textAbout.options)
        }
        break
      case 'st':
        this.stDone = false
        if (currentStoryUnit.textAbout.st) {
          if (currentStoryUnit.textAbout.st.stArgs) {
            let middle = currentStoryUnit.textAbout.st.middle ? true : false
            eventBus.emit('st', {
              text: currentStoryUnit.textAbout.showText.text,
              stArgs: currentStoryUnit.textAbout.st.stArgs,
              middle
            })
          }
        }
        if (this.l2dPlaying && this.playL2dVoice) {
          //to do 后续加入声音对应表
          //判断并播放l2d语音, 根据clearST增加语音的下标
          eventBus.emit('playAudio', {
            voiceJPUrl: `${playerStore.dataUrl}/Audio/VoiceJp/CH0184_MemorialLobby/${this.voiceIndex}.wav`
          })
          this.playL2dVoice = false
        }
        break
      case 'effectOnly':
        break
      //to do
      // case 'continue':
      //   break
      default:
        console.log(`本体中尚未处理${currentStoryUnit.type}类型故事节点`)
    }

    let startTime = Date.now()
    let checkEffectDone = new Promise<void>((resolve, reject) => {
      let interval = setInterval(() => {
        if (this.unitDone) {
          clearInterval(interval)
          resolve()
        }
        else if (Date.now() - startTime >= 50000) {
          reject('特效长时间未完成')
        }
      })
    })
    await checkEffectDone
  },

  clearSt() {
    if (storyHandler.currentStoryUnit.textAbout.st) {
      if (storyHandler.currentStoryUnit.textAbout.st.clearSt) {
        eventBus.emit('clearSt')
        if (this.l2dPlaying) {
          this.voiceIndex++
          this.playL2dVoice = true
        }
      }
    }
  },

  /**
   * 显示背景
   */
  showBg() {
    if (storyHandler.currentStoryUnit.bg) {
      eventBus.emit('showBg', storyHandler.currentStoryUnit.bg?.url)
      if (this.l2dPlaying) {
        eventBus.emit('endL2D')
        this.l2dPlaying = false
      }
    }
    // eventBus.emit('showBg', 'https://yuuka.cdn.diyigemt.com/image/ba-all-data/UIs/03_Scenario/01_Background/BG_CS_PR_16.jpg')
  },

  /**
   * 显示角色
   */
  showCharacter() {
    if (storyHandler.currentStoryUnit.characters.length != 0) {
      this.characterDone = false
      eventBus.emit('showCharacter', {
        characters: storyHandler.currentStoryUnit.characters,
      })
    }
  },

  /**
   * 播放声音
   */
  playAudio() {
    if (storyHandler.currentStoryUnit.audio) {
      eventBus.emit('playAudio', storyHandler.currentStoryUnit.audio)
    }
  },

  playL2d() {
    if (storyHandler.currentStoryUnit.l2d) {
      if (storyHandler.currentStoryUnit.l2d.animationName === 'Idle_01') {
        playerStore.setL2DSpineUrl(storyHandler.currentStoryUnit.l2d.spineUrl)
        eventBus.emit('playL2D')
        this.l2dPlaying = true
      }
      else {
        eventBus.emit('changeAnimation', storyHandler.currentStoryUnit.l2d.animationName)
      }
    }
  },

  /**
   * 控制隐藏事件的发送
   */
  hide() {
    if (storyHandler.currentStoryUnit.hide) {
      if (storyHandler.currentStoryUnit.hide === 'all') {
        eventBus.emit('hide')
      }
      else {
        eventBus.emit('hidemenu')
      }
    }
  },

  show() {
    if (storyHandler.currentStoryUnit.show) {
      if (storyHandler.currentStoryUnit.show === 'menu') {
        eventBus.emit('showmenu')
      }
    }
  },

  /**
   * 播放特效
   */
  playEffect() {
    if (storyHandler.currentStoryUnit.effect.BGEffect || storyHandler.currentStoryUnit.effect.otherEffect.length != 0) {
      this.effectDone = false
      eventBus.emit('playEffect', storyHandler.currentStoryUnit.effect)
    }
    else {
      eventBus.emit('removeEffect')
    }
  },

  async transitionIn() {
    if (storyHandler.currentStoryUnit.transition) {
      eventBus.emit('transitionIn', storyHandler.currentStoryUnit.transition)
      await new Promise<void>(resolve => {
        let resolveFun = () => {
          eventBus.off('transitionInDone', resolveFun)
          resolve()
        }
        eventBus.on('transitionInDone', resolveFun)
      })
    }
  },

  async transitionOut() {
    if (storyHandler.currentStoryUnit.transition) {
      if (storyHandler.currentStoryUnit.transition) {
        eventBus.emit('transitionOut', storyHandler.currentStoryUnit.transition)
        await new Promise<void>(resolve => {
          let resolveFun = () => {
            eventBus.off('transitionOutDone', resolveFun)
            resolve()
          }
          eventBus.on('transitionOutDone', resolveFun)
        })
      }
    }
  },
}


/**
 * 资源加载处理对象
 */
export let resourcesLoader = {
  loader: new Loader(),
  /**
   * 初始化, 预先加载表资源供翻译层使用
   */
  async init(loader: Loader) {
    await this.loadExcels()
    this.loader = loader
  },
  /**
   * 添加所有资源
   */
  addLoadResources() {
    // this.loader.add('https://yuuka.cdn.diyigemt.com/image/ba-all-data/UIs/03_Scenario/01_Background/BG_CS_PR_16.jpg',
    //   'https://yuuka.cdn.diyigemt.com/image/ba-all-data/UIs/03_Scenario/01_Background/BG_CS_PR_16.jpg'
    // )
    this.addEmotionResources()
    this.addFXResources()
    this.addOtherSounds()
    this.addBGEffectImgs()
    for (let unit of playerStore.allStoryUnit) {
      //添加人物spine
      if (unit.characters.length != 0) {
        for (let character of unit.characters) {
          let spineUrl = character.spineUrl
          if (!this.loader.resources[character.CharacterName]) {
            this.loader.add(String(character.CharacterName), spineUrl)
          }
        }
      }
      if (unit.audio) {
        //添加bgm资源
        this.checkAndAdd(unit.audio.bgm?.url)

        //添加sound
        this.checkAndAdd(unit.audio.soundUrl)
        this.checkAndAdd(unit.audio.voiceJPUrl)
      }
      //添加背景图片
      this.checkAndAdd(unit.bg, 'url')

      //添加l2d spine资源
      this.checkAndAdd(unit.l2d, 'spineUrl')
      if (unit.l2d) {
        playerStore.curL2dConfig?.otherSpine.forEach(i => this.checkAndAdd(utils.getResourcesUrl('otherL2dSpine', i)))
      }
    }
  },

  /**
   * 加载资源并在加载完成后执行callback
   * @param callback
   */
  load(callback: () => void) {
    let hasLoad = false
    this.loader.load((loader, res) => {
      playerStore.app.loader.load((loader, res) => {
        //当chrome webgl inspector打开时可能导致callback被执行两次
        if (!hasLoad) {
          console.log(res)
          callback()
        }
      })
    })
  },

  /**
   * 检查资源是否存在或已加载, 没有则添加
   * @param resources 检查是否存在的资源, url可为对象属性或本身
   * @param key 当resoureces为对象时指定的url属性
   */
  checkAndAdd(resources: Object | string | undefined, key?: string) {
    let url = ''
    if (resources) {
      if (typeof resources === 'string') {
        url = resources
      }
      else {
        url = Reflect.get(resources, key!)
      }
      if (!this.loader.resources[url]) {
        this.loader.add(url, url)
      }
    }
  },

  /**
   * 添加人物情绪相关资源(图片和声音)
   */
  async addEmotionResources() {
    for (let emotionResources of playerStore.emotionResourcesTable.values()) {
      for (let emotionResource of emotionResources) {
        if (!this.loader.resources[emotionResource]) {
          this.loader.add(emotionResource, utils.getResourcesUrl('emotionImg', emotionResource))
        }
      }
    }
    for (let emotionName of playerStore.emotionResourcesTable.keys()) {
      let emotionSoundName = `SFX_Emoticon_Motion_${emotionName}`
      if (!this.loader.resources[emotionSoundName]) {
        this.loader.add(emotionSoundName, utils.getResourcesUrl('emotionSound', emotionSoundName))
      }
    }
  },

  /**
   * 添加FX相关资源
   */
  async addFXResources() {
    for (let fxImages of playerStore.fxImageTable.values()) {
      for (let url of fxImages) {
        if (!this.loader.resources[url]) {
          this.loader.add(url, utils.getResourcesUrl('fx', url))
        }
      }
    }
  },

  /**
   * 添加l2d语音
   */
  addL2dVoice(name: string) {
    let voicePath = `${name}_MemorialLobby`
    for (let voiceFileName of l2dVoiceExcelTable[voicePath]) {
      this.loader.add(voiceFileName, `${voicePath}/${voiceFileName}`
      )
    }
  },

  /**
   * 添加其他特效音
   */
  addOtherSounds() {
    let otherSoundUrls = getOtherSoundUrls()
    for (let url of otherSoundUrls) {
      if (!this.loader.resources[url]) {
        this.loader.add(url, url)
      }
    }
  },

  /**
   * 添加bgEffect相关图像资源
   */
  addBGEffectImgs() {
    for (let imgs of playerStore.bgEffectImgMap.values()) {
      for (let img of imgs) {
        if (!this.loader.resources[img]) {
          this.loader.add(img, utils.getResourcesUrl('bgEffectImgs', img))
        }
      }
    }
  },

  /**
   * 加载原始数据资源
   */
  async loadExcels() {
    await axios.get(utils.getResourcesUrl('excel', 'ScenarioBGNameExcelTable.json')).then(res => {
      for (let i of res.data['DataList']) {
        privateState.BGNameExcelTable.set(i['Name'], i)
      }
    })
    await axios.get(utils.getResourcesUrl('excel', 'ScenarioCharacterNameExcelTable.json')).then(res => {
      for (let i of res.data['DataList']) {
        privateState.CharacterNameExcelTable.set(i['CharacterName'], i)
      }
    })
    await axios.get(utils.getResourcesUrl('excel', 'BGMExcelTable.json')).then(res => {
      for (let i of res.data['DataList']) {
        privateState.BGMExcelTable.set(i['Id'], i)
      }
    })
    await axios.get(utils.getResourcesUrl('excel', 'ScenarioTransitionExcelTable.json')).then(res => {
      for (let i of res.data['DataList']) {
        privateState.TransitionExcelTable.set(i['Name'], i)
      }
    })
    await axios.get(utils.getResourcesUrl('excel', 'ScenarioBGEffectExcelTable.json')).then(res => {
      for (let i of res.data['DataList']) {
        privateState.BGEffectExcelTable.set(i['Name'], i)
      }
    })
  }
}
