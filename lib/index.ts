import { storeToRefs } from "pinia";
import { Application } from "pixi.js";
import { textInit } from "./layers/textLayer";
import { usePlayerStore } from "./stores";
import {bgInit} from "@/layers/bgLayer"
import { characterInit } from "./layers/characterLayer";
import { soundInit } from "./layers/soundLayer";
import mitt from 'mitt'
import { Events } from "./types/events";

/**
 * 调用各层的初始化函数
 */
export async function init(elementID:string,height:number,width:number){
    let playerStore=usePlayerStore()
    let {app,eventBus,currentStoryUnit,allStoryUnit,effectDone,characterDone}=storeToRefs(playerStore)
    app.value=new Application({height,width})
    eventBus.value.on('next',()=>{
        if(characterDone.value && effectDone.value){
            next()
            playerStore.nextInit()
        }
    })
    eventBus.value.on('select',e=>select(e))
    eventBus.value.on('effectDone',()=>effectDone.value=true)
    eventBus.value.on('characterDone',()=>characterDone.value=true)

    //翻译层没有完成时可手动改设置播饭哪个剧情语句
    currentStoryUnit.value=allStoryUnit.value[0]

    textInit()
    bgInit()
    characterInit()
    soundInit()

    document.querySelector(`#${elementID}`)?.appendChild(app.value.view)
}

/**
 * 下一剧情语句
 */
export async function next(){

}

/**
 * 根据选择支加入下一语句
 */
export async function select(option:number){

}

/**
 * 调用各层的清屏完成清屏
 */
export async function clear() {
    
}