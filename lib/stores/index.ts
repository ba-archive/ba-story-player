import { CharacterInstance, Dict, StoryUnit } from '@/types/common'
import { defineStore } from 'pinia'
import type { Sprite, Application, LoaderResource } from 'pixi.js'
import mitt from 'mitt'
import { Events } from '@/types/events'
import { BGNameExcelTableItem, CharacterNameExcelTableItem } from '@/types/excels'

export const usePlayerStore = defineStore('PlayerStore', {
    state: () => {
        return {
            //通用
            app: null as Application | null,
            currentStoryUnit: null as StoryUnit | null,
            allStoryUnit: [] as StoryUnit[],
            eventBus: mitt<Events>(),
            characterNameTable: {
                '유우카 체육복ND': 4179367264
            } as { [index: string]: number },
            loadRes: null as null | Dict<LoaderResource>,

            //人物层
            currentCharacterList: [] as CharacterInstance[],

            //背景层
            bgInstance: null as Sprite | null,

            //文字层
            logText: [] as string[],

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
            } as { [index: number]: BGNameExcelTableItem },
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
            } as { [index: number]: CharacterNameExcelTableItem }
        }
    },
    actions: {
        nextInit() {
            this.effectDone = this.characterDone = false
        },

        /**
         * 获取学生CharacterName 
         * @param name scriptKr原文名字
         */
        getCharacterName(name: string) {
            return this.characterNameTable[name]
        },


        /**
         *  获取学生立绘spienData 
         * @param CharacterName 
         */
        getCharacterSpineData(CharacterName: number) {
            let item = this.CharacterNameExcelTable[CharacterName]
            let temp = String(item.SpinePrefabName).split('/')
            temp = temp[temp.length - 1].split('_')
            let id = temp[temp.length - 1]
            return this.loadRes![`${id}_spr`].spineData
        },

        /**
         * 获取背景图片的url, 如果对应的BGName不是背景图片则返回空字符串 
         */
        getBGUrl() {
            let item = this.BGNameExcelTable[this.currentStoryUnit!.BGName]
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
        getL2DSpineData() {
            let item = this.BGNameExcelTable[this.currentStoryUnit!.BGName]
            if (item.BGType == 'Spine') {
                let temp = String(item.BGFileName).split('/')
                return this.loadRes![temp.pop()!.split('_')[1]].spineData

            }
        },

        /**
         * 获取L2D动作名 
         */
        getL2DAnimation() {
            let item = this.BGNameExcelTable[this.currentStoryUnit!.BGName]
            if (item.BGType == 'Spine') {
                return item.AnimationName
            }
            else {
                return ''
            }
        }
    }
})

