import { ShowOption } from '@/types/events'
import { Actions, GetterFunctions, Getters, PrivateStates, PublicStates } from '@/types/store'

let privateState: PrivateStates = {
  language: 'Cn',
  userName: '',
  dataUrl: '',
  app: null,
  loadRes: null,

  allStoryUnit: [],
  currentStoryIndex: 0,

  //文字层
  logText: [],

  //背景层
  bgInstance: null,

  //资源管理
  characterNameTable: {
    '유우카 체육복ND': 4179367264,
    '???': 0,
    '린': 2690570743,
    '유우카': 4283125014,
    '하스미': 3571276574,
    '치나츠': 1867911819,
    '스즈미': 1034441153,
    '통신모모카': 3025942184

  },
  BGNameExcelTable: {},
  CharacterNameExcelTable: {},
  BGMExcelTable: {},
  TransitionExcelTable: {},
  emotionResourcesTable: {
    'Heart': ['Emoticon_Balloon_N.png', 'Emoticon_Heart.png'],
    'Respond': ['Emoticon_Action.png'],
    'Music': ['Emoticon_Note.png'],
    'Twinkle': ['Emoticon_Twinkle.png'],
    'Upset': ['Emoticon_Balloon_N.png', 'Emoticon_Anxiety.png'],
    'Sweat': ['Emoticon_Sweat_1.png', 'Emoticon_Sweat_2.png'],
    'Dot': ['Emoticon_Balloon_N.png', 'Emoticon_Idea.png'],
    'Exclaim': ['Emoticon_ExclamationMark.png'],
    'Surprise': ['Emoticon_Exclamation.png', 'Emoticon_Question.png'],
    'Question': ['Emoticon_QuestionMark.png'],
    'Shy': ['Emoticon_Balloon_N.png', 'Emoticon_Shy.png'],
    'Angry': ['Emoticon_Aggro.png'],
    'Chat': ['Emoticon_Chat.png']
    // TODO: Upset, Music, Think, Bulb, Sigh, Steam, Zzz, Tear
  },
  fxImageTable: {
    "shot": ['shot.png']
  }
}

let getterFunctions: GetterFunctions = {
  app() {
    if (privateState === null) {
      throw new Error('app实例不存在')
    }
    return privateState.app!
  },

  currentStoryUnit() {
    return privateState.allStoryUnit[privateState.currentStoryIndex]
  },

  currentSpeakerCharacterName() {
    if (this.currentStoryUnit().characters.length > 0) {
      for (let i of this.currentStoryUnit().characters) {
        if (i.highlight) {
          return i.CharacterName
        }
      }
      return 0
    }
    else {
      return 0
    }
  },

  speaker() {
    if (this.currentSpeakerCharacterName() === 0) {
      return undefined
    }
    let nameInfo = privateState.CharacterNameExcelTable[this.currentSpeakerCharacterName()]
    if (nameInfo[`Name${privateState.language.toUpperCase() as 'CN' | 'JP'}`]) {
      return {
        name: nameInfo[`Name${privateState.language.toUpperCase() as 'CN' | 'JP'}`]!,
        nickName: nameInfo[`Nickname${privateState.language.toUpperCase() as 'CN' | 'JP'}`]!
      }
    }
    else {
      return { name: nameInfo.NameJP, nickName: nameInfo.NicknameJP }
    }
  },

  text() {
    if (this.currentStoryUnit().text[`Text${privateState.language}`] != undefined) {
      return this.currentStoryUnit().text[`Text${privateState.language}`]!
    }
    else {
      return this.currentStoryUnit().text.TextJp
    }
  },

  textEffect() {
    if (this.currentStoryUnit().text[`Text${privateState.language}`] != undefined) {
      return this.currentStoryUnit().textEffect[`Text${privateState.language}`]!
    }
    else {
      return this.currentStoryUnit().textEffect.TextJp
    }
  },

  option() {
    let option: ShowOption[] = []
    if (this.currentStoryUnit().options) {
      for (let i of this.currentStoryUnit().options!) {
        if (i.text[`Text${privateState.language}`]) {
          option.push({ text: i.text[`Text${privateState.language}`]!, SelectionGroup: i.SelectionGroup })
        }
        else {
          option.push({ text: i.text.TextJp, SelectionGroup: i.SelectionGroup })
        }

      }
    }

    return option
  },

  storySummary() {
    return ''
  },


  CharacterName: () => (name: string) => {
    return privateState.characterNameTable[name]
  },

  characterSpineData: () => (CharacterName: number) => {
    if (privateState.loadRes === null) {
      throw new Error('spine资源未加载')
    }
    let item = privateState.CharacterNameExcelTable[CharacterName]
    let temp = String(item.SpinePrefabName).split('/')
    temp = temp[temp.length - 1].split('_')
    let id = temp[temp.length - 1]
    return privateState.loadRes[`${id}_spr`].spineData
  },

  /**
   * 获取情绪动画的图片url, 按从底部到顶部, 从左到右排列资源.
   */
  emotionResources: () => (emotionName: string) => {
    return privateState.emotionResourcesTable[emotionName]
  },

  /**
     * 获取情绪动画的图片url, 按从底部到顶部, 从左到右排列资源.
     */
  fxImages: () => (fxName: string) => {
    return privateState.fxImageTable[fxName]
  },

  /**
   * 获取emotion的对应声音资源的url, 传入的参数是emotion的名字
   */
  emotionSoundUrl: () => (emotionName) => {
    return `${privateState.dataUrl}/Audio/Sound/SFX_Emoticon_Motion_${emotionName}.wav`
  },

  bgUrl() {
    let item = privateState.BGNameExcelTable[this.currentStoryUnit()!.BGName]
    if (item) {
      if (item.BGType === 'Image') {
        let temp = String(item.BGFileName).split('/')
        // return `${this.dataUrl}/bg/${temp.pop()}.jpg`
        return temp.pop() as string
      }
    }

    return ''
  },


  /**
   * 获取bgm的url
   */
  bgmUrl() {
    let item = privateState.BGMExcelTable[this.currentStoryUnit().BGMId]
    if (item) {
      return `${privateState.dataUrl}/${item.Path}.mp3`
    }

    return ''
  },

  /**
   * 获取bgm的参数
   */
  bgmArgs() {
    let item = privateState.BGMExcelTable[this.currentStoryUnit().BGMId]
    if (item) {
      return item
    }
  },

  /**
   * 获取sound的url
   */
  soundUrl() {
    if (this.currentStoryUnit().Sound != '') {
      return `${privateState.dataUrl}/Audio/Sound/${this.currentStoryUnit().Sound}.mp3`
    }

    return ''
  },

  l2dCharacterName() {
    let item = privateState.BGNameExcelTable[this.currentStoryUnit()!.BGName]
    if (item) {
      if (item.BGType === 'Spine') {
        let temp = String(item.BGFileName).split('/')
        return temp.pop()!.split('_').pop()?.replace('Lobby', '')!
      }
    }

    return ''
  },

  l2dSpineData() {
    if (privateState.loadRes === null) {
      throw new Error('spine资源未加载')
    }
    let item = privateState.BGNameExcelTable[this.currentStoryUnit()!.BGName]
    if (item) {
      if (item.BGType === 'Spine') {
        let temp = String(item.BGFileName).split('/')
        return privateState.loadRes![temp.pop()!.split('_')[1]].spineData

      }
    }
  },

  l2dAnimationName() {
    let item = privateState.BGNameExcelTable[this.currentStoryUnit()!.BGName]
    if (item) {
      if (item.BGType === 'Spine') {
        return item.AnimationName
      }
    }
    return ''
  }
}

let actions: Actions = {
  setBgInstance(instance) {
    privateState.bgInstance = instance
  },
  storyIndexIncrement() {
    if (privateState.currentStoryIndex < privateState.allStoryUnit.length) {
      privateState.currentStoryIndex++
      return true
    }

    return false
  },
  select(option) {
    while (getterFunctions.currentStoryUnit().SelectionGroup != option) {
      if (!this.storyIndexIncrement()) {
        return false
      }
    }

    return true
  },
  setLogText(logText) {
    privateState.logText = logText
  }
}

let store = {
  currentCharacterMap: new Map(),
  ...actions,
}

for (let getter of Object.keys(getterFunctions) as Array<keyof GetterFunctions>) {
  Reflect.defineProperty(store, getter, {
    get: () => getterFunctions[getter]()
  })
}

for (let state of Object.keys(privateState) as Array<keyof PrivateStates>) {
  if (!['app'].includes(state)) {
    Reflect.defineProperty(store, state, {
      get: () => privateState[state]
    })
  }
}

export let usePlayerStore = () => {
  return store as unknown as PublicStates & Getters & Readonly<PrivateStates> & Actions
}

/**
 * 返回可修改的privateState, 仅本体在初始化时可调用
 */
export let initPrivateState = () => privateState