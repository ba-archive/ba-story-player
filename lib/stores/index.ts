import { CharacterInstance, StoryUnit } from '@/types/common'
import { defineStore } from 'pinia'
import  type { Sprite ,Application} from 'pixi.js'

export const usePlayerStore = defineStore('PlayerStore', {
    state: () => {
        return {
            //通用
            app: null as Application | null,
            currentStoryUnit: null as StoryUnit | null,

            //人物层
            currentCharacterList:[] as CharacterInstance[],

            //背景层
            bgInstance:null as Sprite | null,

            //文字层
            logText:[] as string[],
            SelectionGroup:0
        }
    }
})

