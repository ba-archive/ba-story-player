<template>

</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import * as PIXI from 'pixi.js';
import {SpineReadInfo, SpineSetting} from "@/layers/l2dLayer/L2DInfo";
import {Spine} from "pixi-spine";
import EasyTyper from "easy-typer-js";
import eventBus from "@/eventBus";


// pixi对象
let pixiApp: PIXI.Application;
// 要加载的spine列表
let spineList : SpineReadInfo[] = [];
// 当前顶层的spine index
let currentIndex: number = ref(100).value;
// 外部传入的初始化设置
const setting = withDefaults(defineProps<{
  // spine信息数组 注意:渲染顺序是前面先渲染, 所以背景层要放到第一个
  loadInfo: SpineReadInfo[]
  // canvas长宽 如果没有特殊要求,填0 组件内自动对齐到中心
  canvasWidth: number;
  canvasHeight: number;
  // 画面移动坐标
  positionX: number;
  positionY: number;
  // 画面缩放系数
  scale: number;
  // spine中talk的名称 比如 Dev_Talk_0
  talkName: string;
  // spine中talk的名称尾缀 比如 _A
  talkNameEnd: string;
  // 混合方式 0:普通方式 1:混合背景(背景与人物分离)
  mixType: number;
  // 片头动画顺序
  animationIndex: {
    // 图层名称(必须与SpineReadInfo中的name一致)
    name: string,
    // 动画名称(spine中找,一般是一样的)
    animationName: string;
  }[];
}>(),{
  canvasWidth: window.innerWidth,
  canvasHeight: window.innerHeight,
  positionX: 0,
  positionY: 0,
  scale: 1,
  talkName: "",
  talkNameEnd: "",
})

onMounted(()=>{
  // 初始化要加载的spine列表
  setting.loadInfo.forEach((item, index)=> {
    spineList.push({name: item.name, url: item.url})
  });

  // 初始化Pixi Canvas
  pixiApp = new PIXI.Application({
    width: setting.canvasWidth,
    height: setting.canvasHeight,
  });
  document.body.appendChild(pixiApp.view);

  // 加载资源
  spineList.forEach((item) => {
    pixiApp.loader.add(item.name, item.url);
  });

  //对容器设置该属性后 zIndex才生效
  pixiApp.stage.sortableChildren = true;

  // 开始加载
  pixiApp.loader.load(OnAssetsLoaded);

  // 加载完成后的回调
  function OnAssetsLoaded(loader : any, res : any) {
    // 加载了多张spine 所以需要遍历
    spineList.forEach((item, index) => {
      // 获取加载后的实例
      item.spine = new Spine(res[item.name].spineData);
      // 设置加载后的位置
      item.spine.x = setting.positionX == 0 ?pixiApp.screen.width / 2 : setting.positionX;
      item.spine.y = setting.positionY == 0 ? pixiApp.screen.height : setting.positionY;

      // 设置缩放
      item.spine.scale.set(setting.scale);

      // 添加到spine
      pixiApp.stage.addChild(item.spine);

      // 0轨道播放待机 部分没有做待机的动画,用try兜底避免throw
      try {
        item.spine?.state.setAnimation(0, "Idle_01", true);
      }catch{

      }
    });

    // 设置回调
    spineList.forEach((item) => {
      item.spine?.state.addListener({
        // spine中事件回调
        event: function(entry : any, event : any){},
        complete: function(entry : any){
          // 0轨道, 空动画, 待机动画跳过
          if(entry.trackIndex == 0 || entry.animation.name == '<empty>' || entry.animation.name == 'Idle_01'){
            return;
          }

          // 如果片头未完 继续播放
          if(setting.animationIndex.length > 0){
            StartAnimation();
            return;
          }

          if(entry.animation.name.indexOf('_Talk_') >= 0){
            // 说话动作结束后设为待机
            let e = item.spine?.state.setAnimation(entry.trackIndex, 'Idle_01', true);
            e!.mixDuration = 0.8;
          }else{
            // 结束后动作置空
            item.spine?.state.setEmptyAnimation(entry.trackIndex, 0.8);
          }
        },
      })
    });

    // 播放片头动画
    StartAnimation();
  }
});


// 播放片头动画
function StartAnimation(){
  spineList.some((item) => {
    // 按层级播放,如果是混合层则直接进入
    if(item.name == setting.animationIndex[0].name || setting.mixType == 1){
      console.log(setting.animationIndex)
      // 提到顶层
      item.spine!.zIndex = currentIndex;
      currentIndex += 1;
      // 播放片头
      item.spine?.state.setAnimation(1, setting.animationIndex[0].animationName, false);
      // 设置后弹出动画
      setting.animationIndex.shift();
      return true;
    }
  });
}
// 接收动画消息
// 监听text事件
eventBus.on('changeAnimation',
(e) => {
  spineList[0].spine!.state.setAnimation(1, "", false);
});


</script>

<style scoped>
html, body{
  padding: 0;
  margin: 0;
}
</style>