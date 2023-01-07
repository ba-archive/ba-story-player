import { EmotionOptions, GlobalEmotionOptions } from "@/types/characterLayer"

let globalDescription: Record<keyof GlobalEmotionOptions, string> = {
  startPositionOffset: '图片开始时相对于角色的位置',
  scale: '图片缩放比例, 多个图片时为基准图片缩放比例',
  fadeOutDuration: '淡出动画的时间'
}

let emotionOptions: EmotionOptions = {
  Heart: {
    "startPositionOffset": {
      "value": {
        "x": 10,
        "y": -10
      },
      "description": "图片开始时相对于角色的位置"
    },
    "scale": {
      "value": 0.3,
      "description": "图片缩放比例, 多个图片时为基准图片缩放比例"
    },
    "heartPosition": {
      "value": {
        "x": 17,
        "y": 10
      },
      "description": "心相对于对话框的位置"
    },
    "jumpAnimation": {
      "value": {
        "firstScale": {
          "x": 1.2,
          "y": 1.3
        },
        "secondScale": {
          "x": 1.1,
          "y": 1.2
        },
        "duration": 0.25
      },
      "description": "心跳动动画参数"
    },
    "fadeOutDuration": {
      "value": 0.2,
      "description": globalDescription['fadeOutDuration']
    }
  },
  Respond: {
    "startPositionOffset": {
      "value": {
        "x": 50,
        "y": 0
      },
      "description": globalDescription['startPositionOffset']
    },
    "scale": {
      value: 0.3,
      "description": globalDescription['scale']
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": globalDescription['fadeOutDuration']
    }
  },
  Music: {
    "startPositionOffset": {
      "value": {
        "x": 50,
        "y": 0
      },
      "description": "音符图片开始时相对于角色的位置"
    },
    "scale": {
      value: 0.3,
      "description": globalDescription['scale']
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
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": globalDescription['fadeOutDuration']
    }
  },
  Twinkle: {
    "startPositionOffset": {
      "value": {
        "x": 50,
        "y": 0
      },
      "description": globalDescription['startPositionOffset']
    },
    "scale": {
      value: 0.3,
      "description": globalDescription['scale']
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": globalDescription['fadeOutDuration']
    }
  },
  Sad: {
    "startPositionOffset": {
      "value": {
        "x": 50,
        "y": 0
      },
      "description": globalDescription['startPositionOffset']
    },
    "scale": {
      value: 0.3,
      "description": globalDescription['scale']
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": globalDescription['fadeOutDuration']
    }
  },
  Sweat: {
    "startPositionOffset": {
      "value": {
        "x": 90,
        "y": 0
      },
      "description": "图片开始时相对于角色的位置"
    },
    "scale": {
      value: 0.3,
      "description": globalDescription['scale']
    },
    "smallImg": {
      "value": {
        "scale": 0.6,
        "offset": {
          "x": 80,
          "y": -70
        },
        "dropAnimationOffset": -25
      },
      "description": "较小的图片相较于较大图片的设置, 包括缩放和相对位置"
    },
    "dropAnimation": {
      "value": {
        "yOffset": -10,
        "duration": 0.3
      },
      "description": "下落动画的参数"
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": globalDescription['fadeOutDuration']
    }
  },
  Dot: {
    "startPositionOffset": {
      "value": {
        "x": 50,
        "y": 0
      },
      "description": globalDescription['startPositionOffset']
    },
    "scale": {
      value: 0.3,
      "description": globalDescription['scale']
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": globalDescription['fadeOutDuration']
    }
  },
  Chat: {
    "startPositionOffset": {
      "value": {
        "x": 70,
        "y": 20
      },
      "description": "相对于人物的位置"
    },
    "scale": {
      value: 0.3,
      "description": globalDescription['scale']
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
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": globalDescription['fadeOutDuration']
    }
  },
  Exclaim: {
    "startPositionOffset": {
      "value": {
        "x": 50,
        "y": 0
      },
      "description": globalDescription['startPositionOffset']
    },
    "scale": {
      value: 0.3,
      "description": globalDescription['scale']
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": globalDescription['fadeOutDuration']
    }
  },
  Angry: {
    "startPositionOffset": {
      "value": {
        "x": 100,
        "y": 25
      },
      "description": "图片开始时相对于角色的位置"
    },
    "scale": {
      value: 0.3,
      "description": globalDescription['scale']
    },
    "pivotPosition": {
      "value": {
        "x": 13,
        "y": 0
      },
      "description": "旋转的原点"
    },
    "animationScale": {
      "value": {
        "scale": 0.28,
        "duration": 0.2
      },
      "description": "angry图像的动画效果, 通过scaleX实现"
    },
    "endScale": {
      "value": {
        "scale": 0.2,
        "duration": 0.1
      },
      "description": "结束时的缩小动画"
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": globalDescription['fadeOutDuration']
    }
  },
  Surprise: {
    "startPositionOffset": {
      "value": {
        "x": 50,
        "y": 0
      },
      "description": globalDescription['startPositionOffset']
    },
    "scale": {
      value: 0.3,
      "description": globalDescription['scale']
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": globalDescription['fadeOutDuration']
    }
  },
  Question: {
    "startPositionOffset": {
      "value": {
        "x": 50,
        "y": 0
      },
      "description": globalDescription['startPositionOffset']
    },
    "scale": {
      value: 0.3,
      "description": globalDescription['scale']
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": globalDescription['fadeOutDuration']
    }
  },
  Shy: {
    "startPositionOffset": {
      "value": {
        "x": 50,
        "y": 0
      },
      "description": globalDescription['startPositionOffset']
    },
    "scale": {
      value: 0.3,
      "description": globalDescription['scale']
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": globalDescription['fadeOutDuration']
    }
  },
  Upset: {
    "startPositionOffset": {
      "value": {
        "x": 50,
        "y": 0
      },
      "description": globalDescription['startPositionOffset']
    },
    "scale": {
      value: 0.3,
      "description": globalDescription['scale']
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": globalDescription['fadeOutDuration']
    }
  }
}

export default emotionOptions