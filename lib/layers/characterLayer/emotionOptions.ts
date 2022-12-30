import { EmotionOptions } from "@/types/characterLayer"

let emotionOptions: EmotionOptions = {
  Heart: {},
  Respond: {},
  Music: {
    "startPositionOffset": {
      "value": {
        "x": 50,
        "y": 0
      },
      "description": "音符图片开始时相对于角色的位置"
    },
    "rotateAngle": {
      "value": -8,
      "description": "来回旋转的角度"
    },
    "animationXOffset": {
      "value": -50,
      "description": "动画在x轴的向左运动的范围"
    },
    "animationYOffset": {
      "value": 5,
      "description": "动画在y轴上下运动的范围"
    }
  },
  Twinkle: {},
  Sad: {},
  Sweat: {},
  Dot: {},
  Chat: {
    "position": {
      "value": {
        "x": 70,
        "y": 20
      },
      "description": "相对于人物的位置"
    },
    "rotateAngle": {
      "value": -25,
      "description": "旋转的角度"
    },
    "rotateTime": {
      "value": 0.6,
      "description": "一次旋转来回的时间, 单位为秒"
    },
    "rotatePivot": {
      "value": {
        "x": 60,
        "y": 30
      },
      "description": "旋转原点位置, 以设置初始值, 修改的是相对于初始值的值"
    }
  },
  Exclaim: {},
  Angry: {},
  Surprise: {},
  Question: {},
  Shy: {},
  Upset: {}
}

export default emotionOptions