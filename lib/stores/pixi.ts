import { Application } from "pixi.js"
let app:Application

/**
 * 根据给定height, width初始化app 
 */
export function initApp(height:number,width:number){
  app=new Application({height,width})
}

export function getApp(){
  return app
}