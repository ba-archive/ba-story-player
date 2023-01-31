import { usePlayerStore } from "@/stores";
import { BGEffectHandlerOptions, BGEffectHandlers, CurrentBGEffect as CurrentBGEffect, EffectRemoveFunction } from "@/types/effectLayer";
import { Container, Sprite } from "pixi.js";
import { Emitter, EmitterConfigV2, upgradeConfig } from '@pixi/particle-emitter'
import { BGEffectExcelTableItem } from "@/types/excels";

/**
 * app和bgInstance请从此处调用
 */
let playerStore = usePlayerStore()

/**
 * 给emitter用的container
 */
export let emitterContainer = new Container()
emitterContainer.zIndex = 15

let emitterConfigsRaw = import.meta.glob<EmitterConfigV2>('./emitterConfigs/*.json', { eager: true })
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
  //此特效正在播放, 无需处理
  if (effect === currentBGEffect?.effect) {
    return
  }
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
    let newRainConfig = { ...emitterConfigs('rain') }
    newRainConfig.spawnRect!.w = playerStore.app.view.width
    newRainConfig.spawnRect!.h = playerStore.app.view.height
    let emitter = new Emitter(emitterContainer, upgradeConfig(newRainConfig, [resources[0].texture]))
    return emitterHelper(emitter)
  },
  BG_UnderFire: async function (resources, setting, options) {
    throw new Error("该BGEffect处理函数未实现");
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
    'frequency': 0.3
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