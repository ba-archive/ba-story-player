import { usePlayerStore } from "@/stores";
import { BGEffectHandlerOptions, BGEffectHandlers } from "@/types/effectLayer";
import { Container } from "pixi.js";
import { Emitter, upgradeConfig } from '@pixi/particle-emitter'
import rainConfig from './emitterConfigs/rain.json'

/**
 * app和bgInstance请从此处调用
 */
let playerStore = usePlayerStore()
/**
 * 给emitter用的container
 */
export let emitterContainer = new Container()
emitterContainer.zIndex = 15

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
    let editRainConfig = { ...rainConfig }
    editRainConfig.spawnRect.w = playerStore.app.view.width
    editRainConfig.spawnRect.h = playerStore.app.view.height
    let emitter = new Emitter(emitterContainer, upgradeConfig(editRainConfig, [resources[0].texture]))
    // Calculate the current time
    let elapsed = Date.now();

    // Update function every frame
    let update = function () {

      // Update the next frame
      requestAnimationFrame(update);

      var now = Date.now();
      // The emitter requires the elapsed
      // number of seconds since the last update
      emitter.update((now - elapsed) * 0.001);
      elapsed = now;
    };

    // Start emitting
    emitter.emit = true;

    // Start the update
    update();
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