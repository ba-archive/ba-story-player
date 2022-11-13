import { CharacterInstance, StoryUnit } from '@/types/common'
import { defineStore } from 'pinia'
import type { Sprite, Application } from 'pixi.js'
import mitt from 'mitt'
import { Events } from '@/types/events'

export const usePlayerStore = defineStore('PlayerStore', {
    state: () => {
        return {
            //通用
            app: null as Application | null,
            currentStoryUnit: null as StoryUnit | null,
            allStoryUnit: [] as StoryUnit[],
            eventBus: mitt<Events>(),
            characterNameTable:{
                '유우카 체육복ND':4179367264
            } as {[index:string]:number},

            //人物层
            currentCharacterList: [] as CharacterInstance[],

            //背景层
            bgInstance: null as Sprite | null,

            //文字层
            logText: [] as string[],

            //保证特效播放完成
            effectDone: false,
            characterDone: false
        }
    },
    actions:{
        nextInit(){
            this.effectDone=this.characterDone=false
        },
        /**
         * 获取学生CharacterName 
         * @param name 剧情原文名字
         */
        getCharacterName(name:string){
            return this.characterNameTable[name] 
        }
    }
})

