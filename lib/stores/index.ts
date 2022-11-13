import { CharacterInstance, Dict, StoryUnit } from '@/types/common'
import { defineStore } from 'pinia'
import { Sprite, Application, LoaderResource } from 'pixi.js'
import mitt, { Emitter } from 'mitt'
import { Events } from '@/types/events'
import { BGNameExcelTableItem, CharacterNameExcelTableItem } from '@/types/excels'
import { Actions, Getters, State } from '@/types/store'

export const usePlayerStore = defineStore<'PlayerStore', State, Getters, Actions>('PlayerStore', {
    state: () => {
        return {
            //通用
            app: null,
            currentStoryUnit: null,
            allStoryUnit: [],
            eventBus: mitt<Events>(),
            characterNameTable: {
                '유우카 체육복ND': 4179367264
            },
            loadRes: null,

            //人物层
            currentCharacterList: [],

            //背景层
            bgInstance: null,

            //文字层
            logText: [],

            //保证特效播放完成
            effectDone: false,
            characterDone: false,

            //资源管理
            BGNameExcelTable: {
                527011333: {
                    "Name": 527011333,
                    "ProductionStep": "Release",
                    "BGFileName": "UIs/03_Scenario/01_Background/BG_Park_Night",
                    "BGType": "Image",
                    "AnimationRoot": "",
                    "AnimationName": "",
                    "SpineScale": -0,
                    "SpineLocalPosX": 0,
                    "SpineLocalPosY": 0
                }
            },
            CharacterNameExcelTable: {
                4179367264: {
                    "CharacterName": 4179367264,
                    "ProductionStep": "Release",
                    "NameKR": "유우카",
                    "NicknameKR": "세미나",
                    "NameJP": "ユウカ",
                    "NicknameJP": "セミナー",
                    "Shape": "None",
                    "SpinePrefabName": "UIs/03_Scenario/02_Character/CharacterSpine_CH0184",
                    "SmallPortrait": "UIs/01_Common/01_Character/Student_Portrait_CH0184"
                }
            },
        }
    },
    getters: {
        
        CharacterName:({ characterNameTable }) => (name: string) => {
            return characterNameTable[name]
        },


        characterSpineData: ({ CharacterNameExcelTable, loadRes }) => (CharacterName: number) => {
            let item = CharacterNameExcelTable[CharacterName]
            let temp = String(item.SpinePrefabName).split('/')
            temp = temp[temp.length - 1].split('_')
            let id = temp[temp.length - 1]
            return loadRes![`${id}_spr`].spineData
        },

        /**
         * 获取背景图片的url, 如果对应的BGName不是背景图片则返回空字符串 
         */
        bgUrl: ({ BGNameExcelTable, currentStoryUnit }) => {
            let item = BGNameExcelTable[currentStoryUnit!.BGName]
            if (item.BGType == 'Image') {
                let temp = String(item.BGFileName).split('/')
                return `bg/${temp.pop()}.jpg`
            }
            else {
                return ''
            }
        },

        /**
         * 获取L2D资源
         */
        l2dSpineData: ({ BGNameExcelTable, currentStoryUnit, loadRes }) => {
            let item = BGNameExcelTable[currentStoryUnit!.BGName]
            if (item.BGType == 'Spine') {
                let temp = String(item.BGFileName).split('/')
                return loadRes![temp.pop()!.split('_')[1]].spineData

            }
        },

        /**
         * 获取L2D动作名 
         */
        l2dAnimationName: ({ BGNameExcelTable, currentStoryUnit }) => {
            let item = BGNameExcelTable[currentStoryUnit!.BGName]
            if (item.BGType == 'Spine') {
                return item.AnimationName
            }
            else {
                return ''
            }
        }
    },
    actions: {
        nextInit() {
            this.effectDone = this.characterDone = false
        },


    }
})

