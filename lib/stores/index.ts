import { BGEffectImgTable } from '@/types/effectLayer'
import { Actions, GetterFunctions, Getters, PrivateStates, PublicStates } from '@/types/store'
import { getResourcesUrl } from '@/utils'

let characterNameTable = {
  '유우카 체육복ND': 4179367264,
  '???': 0,
  '린': 2690570743,
  '유우카': 4283125014,
  '하스미': 3571276574,
  '치나츠': 1867911819,
  '스즈미': 1034441153,
  '통신모모카': 3025942184
}

let emotionResourcesTable = {
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
}

let fxImageTable = {
  "shot": ['shot.png']
}

/**
 * 请在此处填入需要的图片资源的名称
 */
let bgEffectImgTable: BGEffectImgTable = {
  '': [],
  'BG_ScrollT_0.5': [],
  BG_Filter_Red: [],
  BG_Wave_F: [],
  BG_Flash: [],
  BG_UnderFire_R: [],
  BG_Love_L: [],
  'BG_ScrollB_0.5': [],
  BG_Rain_L: ['HardRain.png'],
  BG_UnderFire: [],
  BG_WaveShort_F: [],
  BG_SandStorm_L: [],
  'BG_ScrollT_1.5': [],
  BG_Shining_L: [],
  'BG_ScrollB_1.0': [],
  BG_Love_L_BGOff: [],
  BG_Dust_L: [],
  'BG_ScrollL_0.5': [],
  'BG_ScrollL_1.0': [],
  BG_Ash_Black: [],
  BG_Mist_L: [],
  BG_Flash_Sound: [],
  'BG_ScrollL_1.5': [],
  BG_FocusLine: [],
  'BG_ScrollR_1.5': [],
  BG_Shining_L_BGOff: [],
  'BG_ScrollT_1.0': [],
  'BG_ScrollB_1.5': [],
  BG_Filter_Red_BG: [],
  BG_Ash_Red: [],
  BG_Fireworks_L_BGOff_02: [],
  'BG_ScrollR_0.5': [],
  BG_Snow_L: [],
  BG_Fireworks_L_BGOff_01: [],
  'BG_ScrollR_1.0': []
}

let privateState: PrivateStates = {
  language: 'Cn',
  userName: '',
  dataUrl: '',
  app: null,
  l2dSpineUrl: '',
  curL2dConfig: null,
  storySummary: {
    chapterName: '',
    summary: ''
  },

  allStoryUnit: [],

  //文字层
  logText: [
    { type: 'user', text: '用户对话', name: '用户名' },
    { type: 'character', text: '人物对话', name: '用户名', avatarUrl: '/avatar.webp' },
    { type: 'none', text: '无特定人物剧情语句' }
  ],

  //背景层
  bgInstance: null,

  //资源管理
  characterNameTable: new Map(Object.entries(characterNameTable)),
  BGNameExcelTable: new Map(),
  CharacterNameExcelTable: new Map(),
  BGMExcelTable: new Map(),
  BGEffectExcelTable: new Map(),
  TransitionExcelTable: new Map(),
  emotionResourcesTable: new Map(Object.entries(emotionResourcesTable)),
  fxImageTable: new Map(Object.entries(fxImageTable)),
  bgEffectImgMap: new Map(Object.entries(bgEffectImgTable))
}

let getterFunctions: GetterFunctions = {
  app() {
    if (privateState === null) {
      throw new Error('app实例不存在')
    }
    return privateState.app!
  },

  CharacterName: () => (name: string) => {
    return privateState.characterNameTable.get(name)!
  },

  characterSpineData: () => (CharacterName: number) => {
    return privateState.app?.loader.resources[String(CharacterName)].spineData
  },

  /**
   * 获取情绪动画的图片url, 按从底部到顶部, 从左到右排列资源.
   */
  emotionResources: () => (emotionName: string) => {
    return privateState.emotionResourcesTable.get(emotionName)
  },

  /**
     * 获取情绪动画的图片url, 按从底部到顶部, 从左到右排列资源.
     */
  fxImages: () => (fxName: string) => {
    return privateState.fxImageTable.get(fxName)
  },

  /**
   * 获取emotion的对应声音资源的url, 传入的参数是emotion的名字
   */
  emotionSoundUrl: () => (emotionName) => {
    return getResourcesUrl('emotionSound', `SFX_Emoticon_Motion_${emotionName}`)
  },

  otherSoundUrl: () => (sound) => {
    return getResourcesUrl('otherSound', sound)
  },

  l2dSpineData() {
    return privateState.app?.loader.resources[privateState.l2dSpineUrl].spineData
  },

}

let actions: Actions = {
  setBgInstance(instance) {
    privateState.bgInstance = instance
  },
  setLogText(logText) {
    //to do
  },
  setL2DSpineUrl(url) {
    privateState.l2dSpineUrl = url
  },
  setL2DConfig(val){
    privateState.curL2dConfig = val
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

/**
 * 资源调用接口
 * @returns 资源调用工具对象
 */
export let usePlayerStore = () => {
  return store as unknown as PublicStates & Getters & Readonly<PrivateStates> & Actions
}

/**
 * 返回可修改的privateState, 仅本体在初始化时可调用
 */
export let initPrivateState = () => privateState;

window.baStore = store // 存一个随时可以查看值