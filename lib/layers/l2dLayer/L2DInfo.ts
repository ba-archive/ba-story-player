// 读取ba spine数据的结构
import { Spine } from "pixi-spine";

/**
 * spine 设置
 */
export interface SpineSetting {
  // spine信息数组 注意:渲染是按顺序渲染,靠后的覆盖靠前的
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
  mixType: number
  // 片头动画顺序
  animationIndex: {
    // 图层名称(必须与SpineReadInfo中的name一致)
    name: string,
    // 动画名称(spine中找,一般是一样的)
    animationName: string
  }[]
}

export interface SpineReadInfo {
  // loader中的唯一名称,注意不能重复,作为唯一key
  name: string;
  // 资源地址(skel或json) 其他相关文件需要放在同一文件夹下(图集,atlas等),pixi-spine会自动查找
  url: string;
  // 存储Spine相关信息
  spine?: Spine;
}