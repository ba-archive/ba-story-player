import { FXOptions, OptionDescriptions } from "@/types/characterLayer";

export let fxOptionsDescriptions: OptionDescriptions['fx'] = {
  shot: {
    scale: "图片缩放大小",
    shotDuration: "每次射击显示效果的时长",
    shotDelay: "每次射击的间隔",
    shotPos: "每次集中的人物位置"
  }
}

let fxOptions: FXOptions = {
  shot: {
    "scale": 0.4,
    "shotDuration": 0.1,
    "shotDelay": 0.15,
    "shotPos": [
      {
        "x": 0.3,
        "y": 0.3
      },
      {
        "x": 0.2,
        "y": 0.7
      },
      {
        "x": 0.4,
        "y": 0.5
      }
    ]
  }
}

export default fxOptions