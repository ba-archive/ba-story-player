import { EmotionOptions, GlobalEmotionOptions } from "@/types/characterLayer"

let globalDescription: Record<keyof GlobalEmotionOptions, string> = {
  startPositionOffset: '图片开始时相对于角色的位置, 相对值, 值为偏移量与角色宽度比例',
  scale: '图片缩放比例, 多个图片时为基准图片缩放比例',
  fadeOutPreDuration: '淡出动画亲爱的时间, 可选',
  fadeOutDuration: '淡出动画的时间',
}

let emotionOptions: EmotionOptions = {
  Heart: {
    "startPositionOffset": {
      "value": {
        "x": 0.1,
        "y": -0.1
      },
      "description": "图片开始时相对于角色的位置"
    },
    "scale": {
      "value": 0.25,
      "description": "图片缩放比例, 多个图片时为基准图片缩放比例"
    },
    "heartImg": {
      "value": {
        "scale": 0.35,
        "position": {
          "x": 0.3,
          "y": 0.2
        }
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
      "description": "淡出动画的时间"
    }
  },
  Respond: {
    "startPositionOffset": {
      "value": {
        "x": 0.4,
        "y": 0.1
      },
      "description": "图片开始时相对于角色的位置, 相对值, 值为偏移量与角色宽度比例"
    },
    "scale": {
      "value": 0.15,
      "description": "图片缩放比例, 多个图片时为基准图片缩放比例"
    },
    "fadeOutPreDuration": {
      "value": 0.3,
      "description": "淡出动画亲爱的时间, 可选"
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": "淡出动画的时间"
    },
    "flashAnimation": {
      "value": {
        "duration": 0.3,
        "alpha": 0.2
      },
      "description": "闪烁动画参数"
    },
    "perImgSetting": {
      "value": [
        {
          "scale": 0.7,
          "anchor": {
            "x": 1.8,
            "y": 0
          },
          "angle": -10
        },
        {
          "scale": 1,
          "anchor": {
            "x": 1.5,
            "y": 0
          },
          "angle": 23
        },
        {
          "scale": 0.7,
          "anchor": {
            "x": 1.8,
            "y": 0
          },
          "angle": 50
        }
      ],
      "description": "每个图片的缩放, 旋转原点, 旋转角度"
    }
  },
  Music: {
    "startPositionOffset": {
      "value": {
        "x": 0.2,
        "y": 0
      },
      "description": "音符图片开始时相对于角色的位置"
    },
    "scale": {
      "value": 0.13,
      "description": "图片缩放比例, 多个图片时为基准图片缩放比例"
    },
    "rotateAngle": {
      "value": -8,
      "description": "来回旋转的角度"
    },
    "animation": {
      "value": {
        "offset": {
          "x": -1,
          "y": 0.1
        },
        "duration": 0.8
      },
      "description": "动画参数"
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": "淡出动画的时间"
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
        "x": 0.3,
        "y": -0.1
      },
      "description": "图片开始时相对于角色的位置"
    },
    "scale": {
      "value": 0.08,
      "description": "图片缩放比例, 多个图片时为基准图片缩放比例"
    },
    "smallImg": {
      "value": {
        "scale": 1,
        "offset": {
          "x": 1,
          "y": -0.5
        },
        "dropAnimationOffset": -2.3
      },
      "description": "较小的图片相较于较大图片的设置, 包括缩放和相对位置"
    },
    "dropAnimation": {
      "value": {
        "yOffset": -1,
        "duration": 0.4
      },
      "description": "下落动画的参数"
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": "淡出动画的时间"
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
        "x": 0.25,
        "y": 0.1
      },
      "description": "相对于人物的位置"
    },
    "scale": {
      "value": 0.15,
      "description": "图片缩放比例, 多个图片时为基准图片缩放比例"
    },
    "rotateAngle": {
      "value": -25,
      "description": "旋转的角度"
    },
    "rotateTime": {
      "value": 0.5,
      "description": "一次旋转来回的时间, 单位为秒"
    },
    "rotatePivot": {
      "value": {
        "x": 1,
        "y": 1
      },
      "description": "旋转原点位置, 以设置初始值, 修改的是相对于初始值的值"
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": "淡出动画的时间"
    }
  },
  Exclaim: {
    "startPositionOffset": {
      "value": {
        "x": 0.32,
        "y": -0.1
      },
      "description": "图片开始时相对于角色的位置, 相对值, 值为偏移量与角色宽度比例"
    },
    "scale": {
      "value": 0.08,
      "description": "图片缩放比例, 多个图片时为基准图片缩放比例"
    },
    "fadeOutDuration": {
      "value": 0.1,
      "description": "淡出动画的时间"
    },
    "scaleAnimation": {
      "value": {
        "scale": 1.4,
        "scaleDuration": 0.2,
        "recoverScale": 1.2,
        "recoverDuration": 0.1
      },
      "description": "动画过程为先放大然后恢复回原来大小"
    },
    "fadeOutWaitTime": {
      "value": 0.3,
      "description": "消失动画前的等待时间"
    }
  },
  Angry: {
    "startPositionOffset": {
      "value": {
        "x": 0.4,
        "y": 0.05
      },
      "description": globalDescription['startPositionOffset']
    },
    "scale": {
      "value": 0.1,
      "description": "图片缩放比例, 多个图片时为基准图片缩放比例"
    },
    "pivotPosition": {
      "value": {
        "x": 0.6,
        "y": 0
      },
      "description": "旋转的原点"
    },
    "animationScale": {
      "value": {
        "scale": 0.9,
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
      "description": "淡出动画的时间"
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