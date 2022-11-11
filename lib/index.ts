import { storeToRefs } from "pinia";
import { Application } from "pixi.js";
import { usePlayerStore } from "./stores";

/**
 * 调用各层的初始化函数
 */
export async function init(elementID:string,height:number,width:number){
    let playerStore=usePlayerStore()
    let {app}=storeToRefs(playerStore)
    app.value=new Application({height,width})

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
export async function select(){

}

/**
 * 调用各层的清屏完成清屏
 */
export async function clear() {
    
}