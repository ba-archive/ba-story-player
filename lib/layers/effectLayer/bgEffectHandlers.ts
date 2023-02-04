import { usePlayerStore } from "@/stores";
import { BGEffectHandlerOptions, BGEffectHandlers, CurrentBGEffect, EffectRemoveFunction } from "@/types/effectLayer";
import { BGEffectExcelTableItem } from "@/types/excels";
import { Emitter, EmitterConfigV2, EmitterConfigV3, upgradeConfig } from '@pixi/particle-emitter';
import { Container, Sprite, Spritesheet, Texture } from "pixi.js";

/**
 * app和bgInstance请从此处调用
 */
let playerStore = usePlayerStore()

/**
 * 给emitter用的container
 */
export let emitterContainer = new Container()
emitterContainer.zIndex = 15
emitterContainer.sortableChildren = true

let emitterConfigsRaw = import.meta.glob<EmitterConfigV2 | EmitterConfigV3>('./emitterConfigs/*.json', { eager: true })
/**
 * 获取emitter config
 * @param filename 文件名, 不需要加.json后缀
 * @returns 
 */
function emitterConfigs(filename: string) {
  let config = Reflect.get(emitterConfigsRaw, `./emitterConfigs/${filename}.json`)
  if (!config) {
    throw new Error('emitter参数获取失败, 文件名错误或文件不存在')
  }
  return config
}
/**
 * 当前播放的BGEffect
 */
let currentBGEffect: CurrentBGEffect

/**
 * 播放对应的BGEffect
 * @param bgEffectItem 
 * @returns 
 */
export async function playBGEffect(bgEffectItem: BGEffectExcelTableItem) {
  let effect = bgEffectItem.Effect
  //此特效正在播放, 无需处理, 先移除保证开发便利
  // if (effect === currentBGEffect?.effect) {
  //   return
  // }
  await removeBGEffect()
  let resources = playerStore.bgEffectImgMap.get(effect)
  if (resources) {
    let imgs: Sprite[] = []
    for (let resource of resources) {
      imgs.push(Sprite.from(resource))
    }
    let handler = bgEffectHandlers[effect]
    let removeFunction = await Reflect.apply(handler, undefined, [imgs, bgEffectItem, bgEffectHandlerOptions[effect]])
    currentBGEffect = {
      effect,
      removeFunction,
      resources: imgs
    }
  }
}

/**
 * 移除当前的BGEffect
 */
export async function removeBGEffect() {
  if (currentBGEffect) {
    await currentBGEffect.removeFunction()
    for (let resource of currentBGEffect.resources) {
      resource.destroy()
    }
    currentBGEffect = undefined
  }
}

export let bgEffectHandlers: BGEffectHandlers = {
  "": async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  "BG_ScrollT_0.5": async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Filter_Red: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Wave_F: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Flash: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_UnderFire_R: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Love_L: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  "BG_ScrollB_0.5": async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Rain_L: async function (resources, setting, options) {
    let newRainConfig: EmitterConfigV2 = { ...emitterConfigs('rain') }
    newRainConfig.spawnRect!.w = playerStore.app.view.width
    newRainConfig.spawnRect!.h = playerStore.app.view.height
    newRainConfig.frequency = options.frequency
    let emitter = new Emitter(emitterContainer, upgradeConfig(newRainConfig, [resources[0].texture]))
    return emitterHelper(emitter)
  },
  BG_UnderFire: async function (resources, setting, options) {
    let ininX = playerStore.app.screen.width * 7 / 8
    let ininY = playerStore.app.screen.height * 7 / 8

    //烟雾效果, 通过spreetsheet实现烟雾散开
    let smokeContainer = new Container()
    emitterContainer.addChild(smokeContainer)
    smokeContainer.zIndex = 1
    let smokeConifg: EmitterConfigV3 = { ...emitterConfigs('smoke') as EmitterConfigV3 }
    smokeConifg.pos = {
      x: ininX,
      y: ininY
    }
    let smokeAnimationsName = 'smoke'
    let smokeSpritesheet = await loadSpriteSheet(resources[0], { x: 3, y: 3 }, smokeAnimationsName)
    smokeConifg.behaviors[3].config.anim.textures = Reflect.get(smokeSpritesheet.animations, smokeAnimationsName)
    let smokeEmitter = new Emitter(smokeContainer, smokeConifg)
    let smokeRemover = emitterHelper(smokeEmitter)

    //火焰效果, emitter随机从三个素材中选一个发出
    let fireContainer = new Container()
    emitterContainer.addChild(fireContainer)
    fireContainer.zIndex = 2
    let fireConfig: EmitterConfigV3 = { ...emitterConfigs('fire') as EmitterConfigV3 }
    fireConfig.pos = {
      x: ininX,
      y: ininY
    }
    let fireImgs = resources.slice(1, 4)
    for (let i = 0; i < 3; ++i) {
      //textureRandom behaviors
      fireConfig.behaviors[2].config.textures.push(fireImgs[i].texture)
    }
    let fireEmitter = new Emitter(fireContainer, fireConfig)
    let fireRemover = emitterHelper(fireEmitter)

    let firelineContainer = new Container()
    emitterContainer.addChild(firelineContainer)
    firelineContainer.zIndex = 0
    let firelineConfig: EmitterConfigV3 = { ...emitterConfigs('fireline') as EmitterConfigV3 }
    firelineConfig.behaviors[0].config.texture = resources[4].texture
    firelineConfig.pos = {
      x: ininX,
      y: ininY
    }
    let fireLineEmitter = new Emitter(firelineContainer, firelineConfig)
    let firelineRemover = emitterHelper(fireLineEmitter)

    let posX = smokeEmitter.spawnPos.x
    let posY = smokeEmitter.spawnPos.y

    //原点向左移动, 移出屏幕后停止
    await new Promise<void>(resolve => {
      let underfirePlay = setInterval(async () => {
        if (posX <= -ininX) {
          clearInterval(underfirePlay)
          await smokeRemover()
          await fireRemover()
          await firelineRemover()
          resolve()
          return
        }
        posX -= playerStore.app.screen.width / 5
        smokeEmitter.updateSpawnPos(posX, posY)
        fireEmitter.updateSpawnPos(posX, posY)
        fireLineEmitter.updateSpawnPos(posX, posY)
      }, 140)
    })

    return () => Promise.resolve()
  },
  BG_WaveShort_F: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_SandStorm_L: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  "BG_ScrollT_1.5": async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Shining_L: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  "BG_ScrollB_1.0": async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Love_L_BGOff: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Dust_L: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  "BG_ScrollL_0.5": async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  "BG_ScrollL_1.0": async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Ash_Black: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Mist_L: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Flash_Sound: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  "BG_ScrollL_1.5": async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_FocusLine: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  "BG_ScrollR_1.5": async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Shining_L_BGOff: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  "BG_ScrollT_1.0": async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  "BG_ScrollB_1.5": async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Filter_Red_BG: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Ash_Red: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Fireworks_L_BGOff_02: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  "BG_ScrollR_0.5": async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Snow_L: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  BG_Fireworks_L_BGOff_01: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  },
  "BG_ScrollR_1.0": async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
  }
}

/**
 * 处理函数的对应参数
 */
export let bgEffectHandlerOptions: BGEffectHandlerOptions = {
  BG_FocusLine: {},
  "": {},
  "BG_ScrollT_0.5": {},
  BG_Filter_Red: {},
  BG_Wave_F: {},
  BG_Flash: {},
  BG_UnderFire_R: {},
  BG_Love_L: {},
  "BG_ScrollB_0.5": {},
  BG_Rain_L: {
    'frequency': 0.05
  },
  BG_UnderFire: {},
  BG_WaveShort_F: {},
  BG_SandStorm_L: {},
  "BG_ScrollT_1.5": {},
  BG_Shining_L: {},
  "BG_ScrollB_1.0": {},
  BG_Love_L_BGOff: {},
  BG_Dust_L: {},
  "BG_ScrollL_0.5": {},
  "BG_ScrollL_1.0": {},
  BG_Ash_Black: {},
  BG_Mist_L: {},
  BG_Flash_Sound: {},
  "BG_ScrollL_1.5": {},
  "BG_ScrollR_1.5": {},
  BG_Shining_L_BGOff: {},
  "BG_ScrollT_1.0": {},
  "BG_ScrollB_1.5": {},
  BG_Filter_Red_BG: {},
  BG_Ash_Red: {},
  BG_Fireworks_L_BGOff_02: {},
  "BG_ScrollR_0.5": {},
  BG_Snow_L: {},
  BG_Fireworks_L_BGOff_01: {},
  "BG_ScrollR_1.0": {}
}

/**
 * emitter工具函数, 会自动启动emitter并返回一个终止函数
 * @param emitter 
 * @param stopCallback 终止函数中调用的函数 
 * @returns 终止函数, 功能是停止当前emitter并回收
 */
function emitterHelper(emitter: Emitter, stopCallback?: () => void): EffectRemoveFunction {
  let elapsed = Date.now();
  let stopFlag = false
  // Update function every frame
  let update = function () {
    if (stopFlag) {
      return
    }
    // Update the next frame
    requestAnimationFrame(update);

    var now = Date.now();
    // The emitter requires the elapsed
    // number of seconds since the last update
    emitter.update((now - elapsed) * 0.001);
    elapsed = now;
  };

  let stop = async function () {
    stopFlag = true
    emitter.emit = false
    emitter.destroy()
    if (stopCallback) {
      stopCallback()
    }
  }

  // Start emitting
  emitter.emit = true;

  // Start the update
  update();

  return stop
}


/**
 * 根据给定的信息, 加载spriteSheet
 * @param img spriteSheet原图片Sprite
 * @param quantity x, y方向上小图片的个数
 * @param animationsName 该图片组成的动画的名字, 用于访问资源
 */
async function loadSpriteSheet(img: Sprite, quantity: { x: number, y: number }, animationsName: string): Promise<Spritesheet> {
  // Create object to store sprite sheet data
  let atlasData = {
    frames: {
    },
    meta: {
      scale: '1'
    },
    animations: {
    } as Record<string, string[]>
  }
  Reflect.set(atlasData.animations, animationsName, [])

  img.scale.set(1)
  let xNum = quantity.x
  let yNum = quantity.y
  let width = img.width / xNum
  let height = img.height / yNum
  for (let i = 0; i < xNum * yNum; ++i) {
    Reflect.set(atlasData.frames, `smoke${i}`, {
      frame: { x: width * (i % xNum), y: height * (Math.trunc(i / xNum)), w: width, h: height },
      sourceSize: { w: width, h: height },
      spriteSourceSize: { x: 0, y: 0, w: width, h: height }
    })
    atlasData.animations[animationsName].push(`${animationsName}${i}`)
  }

  // Create the SpriteSheet from data and image
  const spritesheet = new Spritesheet(
    img.texture,
    atlasData
  );

  // Generate all the Textures asynchronously
  await spritesheet.parse();

  return spritesheet
}