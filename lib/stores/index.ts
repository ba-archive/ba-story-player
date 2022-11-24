import { defineStore } from 'pinia'
import { Sprite, Application  } from 'pixi.js'
import {  ShowOption } from '@/types/events'
import { Actions, Getters, State } from '@/types/store'
import {CharacterInstance} from "@/types/common";
import {getLoadRes} from '@/stores/spineLoader'

export const usePlayerStore = defineStore<'PlayerStore', State, Getters, Actions>('PlayerStore', {
  state: () => {
    return {
      //通用
      _app: null,
      language: 'Cn',
      userName: '',
      dataUrl: '',

      allStoryUnit: [],
      currentStoryIndex: 0,
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

      //人物层
      currentCharacterMap: new Map<number, CharacterInstance>(),
      loadRes:null,

      //背景层
      _bgInstance: null,

      //文字层
      _logText: [],

      //保证特效播放完成
      effectDone: true,
      characterDone: true,

      //资源管理
      BGNameExcelTable: {},
      CharacterNameExcelTable: {},
      BGMExcelTable: {},
      TransitionExcelTable: {},
      emotionResourecesTable:{
        'Heart':['Emoticon_Balloon_N.png','Emoticon_Heart.png'],
        'Respond':['Emoticon_Action.png'],
        'Note':['Emoticon_Note.png'],
        'Twinkle':['Emoticon_Twinkle.png'],
        'Anxiety':['Emoticon_Balloon_N.png','Emoticon_Anxiety.png'],
        'Sweat':['Emoticon_Sweat_1.png','Emoticon_Sweat_2.png'],
        'Dot':['Emoticon_Balloon_N.png','Emoticon_Idea.png'],
        'Exclaim':['Emoticon_ExclamationMark.png'],
        'Surprise':['Emoticon_Exclamation.png','Emoticon_Question.png'],
        'Question':['Emoticon_QuestionMark.png'],
        'Shy':['Emoticon_Balloon_N.png','Emoticon_Shy.png'],
        'Angry':['Emoticon_Aggro.png'],
        'Chat':['Emoticon_Chat.png']
        // TODO: Upset, Music, Think, Bulb, Sigh, Steam, Zzz, Tear
      },

      //
      l2dCharacterName:''
    }
  },
  getters: {
    app: ({ _app }) => _app as Application,
    currentStoryUnit: ({ currentStoryIndex, allStoryUnit }) => allStoryUnit[currentStoryIndex],

    bgInstance: ({ _bgInstance }) => _bgInstance as Sprite,

    currentSpeakerCharacterName() {
      if (this.currentStoryUnit.characters.length > 0) {
        for (let i of this.currentStoryUnit.characters) {
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
    speaker({ CharacterNameExcelTable }) {
      if (this.currentSpeakerCharacterName == 0) {
        return undefined
      }
      let nameInfo = CharacterNameExcelTable[this.currentSpeakerCharacterName]
      if (nameInfo[`Name${this.language.toUpperCase() as 'CN' | 'JP'}`]) {
        return {
          name: nameInfo[`Name${this.language.toUpperCase() as 'CN' | 'JP'}`]!,
          nickName: nameInfo[`Nickname${this.language.toUpperCase() as 'CN' | 'JP'}`]!
        }
      }
      else {
        return { name: nameInfo.NameJP, nickName: nameInfo.NicknameJP }
      }
    },

    text() {
      if (this.currentStoryUnit.text[`Text${this.language}`] != undefined) {
        return this.currentStoryUnit.text[`Text${this.language}`]!
      }
      else {
        return this.currentStoryUnit.text.TextJp
      }
    },
    textEffect() {
      if (this.currentStoryUnit.text[`Text${this.language}`] != undefined) {
        return this.currentStoryUnit.textEffect[`Text${this.language}`]!
      }
      else {
        return this.currentStoryUnit.textEffect.TextJp
      }
    },
    option() {
      let option: ShowOption[] = []
      if (this.currentStoryUnit.options) {
        for (let i of this.currentStoryUnit.options) {
          if (i.text[`Text${this.language}`]) {
            option.push({ text: i.text[`Text${this.language}`]!, SelectionGroup: i.SelectionGroup })
          }
          else {
            option.push({ text: i.text.TextJp, SelectionGroup: i.SelectionGroup })
          }

        }
      }

      return option
    },

    storySummary: () => '',
    logText: ({ _logText }) => _logText,

    CharacterName: ({ characterNameTable }) => (name: string) => {
      return characterNameTable[name]
    },

    characterSpineData: ({ CharacterNameExcelTable }) => (CharacterName: number) => {
      let item = CharacterNameExcelTable[CharacterName]
      let temp = String(item.SpinePrefabName).split('/')
      temp = temp[temp.length - 1].split('_')
      let id = temp[temp.length - 1]
      return getLoadRes()[`${id}_spr`].spineData
    },

    /**
     * 获取情绪动画的图片url, 按从底部到顶部, 从左到右排列资源.
     */
    emotionResources(){
      return (emotionName)=>this.emotionResourecesTable[emotionName]
    },

    /**
     * 获取背景图片的url, 如果对应的BGName不是背景图片则返回空字符串
     */
    bgUrl({ BGNameExcelTable }) {
      let item = BGNameExcelTable[this.currentStoryUnit!.BGName]
      if (item) {
        if (item.BGType == 'Image') {
          let temp = String(item.BGFileName).split('/')
          return `${this.dataUrl}/bg/${temp.pop()}.jpg`
        }
      }

      return ''
    },


    /**
     * 获取bgm的url
     */
    bgmUrl({ BGMExcelTable }) {
      let item = BGMExcelTable[this.currentStoryUnit.BGMId]
      if (item) {
        return `${this.dataUrl}/${item.Path}.mp3`
      }

      return ''
    },

    /**
         * 获取sound的url
         */
    soundUrl() {
      if (this.currentStoryUnit.Sound != '') {
        return `${this.dataUrl}/Audio/Sound/${this.currentStoryUnit.Sound}.mp3`
      }

      return ''
    },


    isL2d(){
      let item = this.BGNameExcelTable[this.currentStoryUnit!.BGName]
      if (item) {
        if (item.BGType == 'Spine') {
          let temp = String(item.BGFileName).split('/')
          this.l2dCharacterName=temp.pop()!.split('_').pop()?.replace('Lobby','')!
          return true
        }
      }
      return false
    },
    /**
     * 获取L2D资源
     */
    l2dSpineData({ BGNameExcelTable  }) {
      let item = BGNameExcelTable[this.currentStoryUnit!.BGName]
      if (item) {
        if (item.BGType == 'Spine') {
          let temp = String(item.BGFileName).split('/')
          return getLoadRes()![temp.pop()!.split('_')[1]].spineData

        }
      }
    },

    /**
     * 获取L2D动作名
     */
    l2dAnimationName({ BGNameExcelTable }) {
      let item = BGNameExcelTable[this.currentStoryUnit!.BGName]
      if (item) {
        if (item.BGType == 'Spine') {
          return item.AnimationName
        }
      }
      return ''
    }
  },
  actions: {
    nextInit() {
      this.effectDone = this.characterDone = false
    },


  }
})

