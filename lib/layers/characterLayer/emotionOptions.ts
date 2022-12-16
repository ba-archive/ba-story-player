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
  Chat: {},
  Exclaim: {},
  Angry: {},
  Surprise: {},
  Question: {},
  Shy: {},
  Upset: {}
}

export default emotionOptions