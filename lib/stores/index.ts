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
        }
    }
})

