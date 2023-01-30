import { usePlayerStore } from "@/stores";
import { BGEffectHandlers } from "@/types/effectLayer";

/**
 * app和bgInstance请从此处调用
 */
let playerStore=usePlayerStore()

let bgeffectHandlers:BGEffectHandlers={
  "": async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  "BG_ScrollT_0.5": async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Filter_Red: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Wave_F: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Flash: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_UnderFire_R: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Love_L: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  "BG_ScrollB_0.5": async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Rain_L: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_UnderFire: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_WaveShort_F: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_SandStorm_L: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  "BG_ScrollT_1.5": async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Shining_L: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  "BG_ScrollB_1.0": async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Love_L_BGOff: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Dust_L: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  "BG_ScrollL_0.5": async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  "BG_ScrollL_1.0": async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Ash_Black: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Mist_L: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Flash_Sound: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  "BG_ScrollL_1.5": async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_FocusLine: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  "BG_ScrollR_1.5": async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Shining_L_BGOff: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  "BG_ScrollT_1.0": async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  "BG_ScrollB_1.5": async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Filter_Red_BG: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Ash_Red: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Fireworks_L_BGOff_02: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  "BG_ScrollR_0.5": async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Snow_L: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  BG_Fireworks_L_BGOff_01: async function (resources, setting, options){
    throw new Error("async function not implemented.");
  },
  "BG_ScrollR_1.0": async function (resources, setting, options){
    throw new Error("async function not implemented.");
  }
}