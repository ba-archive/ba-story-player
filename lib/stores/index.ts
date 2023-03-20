import { BGEffectImgTable } from "@/types/effectLayer";
import {
  Actions,
  GetterFunctions,
  Getters,
  LogText,
  PrivateStates,
  PublicStates,
} from "@/types/store";
import { getResourcesUrl } from "@/utils";
import { ref } from "vue";
import { storyHandler } from "..";

// let characterNameTable = {
//   '유우카 체육복ND': 3715128518,
//   '???': 0,
//   '린': 2690570743,
//   '유우카': 4283125014,
//   '하스미': 3571276574,
//   '치나츠': 1867911819,
//   '스즈미': 1034441153,
//   '통신모모카': 3025942184
// }

let emotionResourcesTable = {
  Heart: ["Emoticon_Balloon_N.png", "Emoticon_Heart.png"],
  Respond: ["Emoticon_Action.png"],
  Music: ["Emoticon_Note.png"],
  Twinkle: ["Emoticon_Twinkle.png"],
  Upset: ["Emoticon_Balloon_N.png", "Emoticon_Anxiety.png"],
  Sweat: ["Emoticon_Sweat_1.png", "Emoticon_Sweat_2.png"],
  Dot: ["Emoticon_Balloon_N.png", "Emoticon_Idea.png"],
  Exclaim: ["Emoticon_ExclamationMark.png"],
  Surprise: ["Emoticon_Exclamation.png", "Emoticon_Question.png"],
  Question: ["Emoticon_QuestionMark.png"],
  Shy: ["Emoticon_Balloon_N.png", "Emoticon_Shy.png"],
  Angry: ["Emoticon_Aggro.png"],
  Chat: ["Emoticon_Chat.png"],
  Sad: ["Emoji_Sad.png"],
  Steam: ["Emoji_Steam.png"],
  Sigh: ["Emoji_Sigh.png"],
  Bulb: ["Emoticon_Balloon_N.png", "Emoji_Bulb_1.png", "Emoji_Bulb_2.png"],
  Tear: ["Emoji_Tear_1.png", "Emoji_Tear_2.png"],
  // TODO: Upset, Music, Think, Bulb, Sigh, Steam, Zzz, Tear
};

let fxImageTable = {
  shot: ["fire1.png", "fire2.png", "fire3.png"],
};

/**
 * 请在此处填入需要的图片资源的名称
 */
let bgEffectImgTable: BGEffectImgTable = {
  "": [],
  "BG_ScrollT_0.5": [],
  BG_Filter_Red: [],
  BG_Wave_F: [],
  BG_Flash: [],
  BG_UnderFire_R: [],
  BG_Love_L: [
    "FX_TEX_Img_Heart_01.png",
    "FX_TEX_SCN_Ring_02.png",
    "Gacha/FX_TEX_GT_Circle_Blur_inv.png",
  ],
  "BG_ScrollB_0.5": [],
  BG_Rain_L: ["HardRain.png"],
  BG_UnderFire: [
    "FX_TEX_Smoke_17.png",
    "fire1.png",
    "fire2.png",
    "fire3.png",
    "HardRain.png",
  ],
  BG_WaveShort_F: [],
  BG_SandStorm_L: ["FX_TEX_Smoke_10a.png"],
  "BG_ScrollT_1.5": [],
  BG_Shining_L: [],
  "BG_ScrollB_1.0": [],
  BG_Love_L_BGOff: [
    "FX_TEX_Img_Heart_01.png",
    "FX_TEX_SCN_Ring_02.png",
    "FX_TEX_SCN_Circle_Love.png",
  ],
  BG_Dust_L: ["FX_TEX_Smoke_Scroll_23.png", "dust_spark.png"],
  "BG_ScrollL_0.5": [],
  "BG_ScrollL_1.0": [],
  BG_Ash_Black: [],
  BG_Mist_L: [],
  BG_Flash_Sound: [],
  "BG_ScrollL_1.5": [],
  BG_FocusLine: ["FX_TEX_SCN_FocusLine5.png"],
  "BG_ScrollR_1.5": [],
  BG_Shining_L_BGOff: ["FX_TEX_SCN_Ring_02.png"],
  "BG_ScrollT_1.0": [],
  "BG_ScrollB_1.5": [],
  BG_Filter_Red_BG: [],
  BG_Ash_Red: [],
  BG_Fireworks_L_BGOff_02: [],
  "BG_ScrollR_0.5": [],
  BG_Snow_L: [],
  BG_Fireworks_L_BGOff_01: [],
  "BG_ScrollR_1.0": [],
};

let privateState: PrivateStates = {
  language: "Cn",
  userName: "",
  dataUrl: "",
  app: null,
  l2dSpineUrl: "",
  curL2dConfig: null,
  storySummary: {
    chapterName: "",
    summary: "",
  },

  allStoryUnit: [],

  //文字层
  logText: ref([]),

  //背景层
  bgInstance: null,

  //资源管理
  BGNameExcelTable: new Map(),
  CharacterNameExcelTable: new Map(),
  BGMExcelTable: new Map(),
  BGEffectExcelTable: new Map(),
  TransitionExcelTable: new Map(),
  EmotionExcelTable: new Map(),
  emotionResourcesTable: new Map(Object.entries(emotionResourcesTable)),
  fxImageTable: new Map(Object.entries(fxImageTable)),
  bgEffectImgMap: new Map(Object.entries(bgEffectImgTable)),
};

let getterFunctions: GetterFunctions = {
  app() {
    if (privateState === null) {
      throw new Error("app实例不存在");
    }
    return privateState.app!;
  },

  characterSpineData: () => (CharacterName: number) => {
    return privateState.app?.loader.resources[String(CharacterName)].spineData;
  },

  /**
   * 获取情绪动画的图片url, 按从底部到顶部, 从左到右排列资源.
   */
  emotionResources: () => (emotionName: string) => {
    return privateState.emotionResourcesTable.get(emotionName);
  },

  /**
   * 获取情绪动画的图片url, 按从底部到顶部, 从左到右排列资源.
   */
  fxImages: () => (fxName: string) => {
    return privateState.fxImageTable.get(fxName);
  },

  /**
   * 获取emotion的对应声音资源的url, 传入的参数是emotion的名字
   */
  emotionSoundUrl: () => emotionName => {
    return getResourcesUrl(
      "emotionSound",
      `SFX_Emoticon_Motion_${emotionName}`
    );
  },

  otherSoundUrl: () => sound => {
    return getResourcesUrl("otherSound", sound);
  },

  l2dSpineData() {
    const resource =
      privateState.app?.loader.resources[privateState.l2dSpineUrl];
    if (resource) return resource.spineData;
  },
};

let actions: Actions = {
  setBgInstance(instance) {
    privateState.bgInstance = instance;
  },
  updateLogText(newLog) {
    if ("SelectionGroup" in newLog) {
      privateState.logText.value.push({
        type: "user",
        text: newLog.text.map(it => it.content).join(""),
        index: newLog.index,
        name: privateState.userName,
      });
    } else {
      let text = "";
      for (let textPart of newLog.text) {
        text += textPart.content;
      }
      if (newLog.speaker) {
        privateState.logText.value.push({
          type: "character",
          text,
          avatarUrl: newLog.avatarUrl,
          name: newLog.speaker.name,
          index: newLog.index,
        });
      } else {
        privateState.logText.value.push({
          type: "none",
          text,
          index: newLog.index,
        });
      }
    }
    // 日志不会超过当前的故事进度, 并且不重复
    privateState.logText.value = privateState.logText.value.reduce(
      (acc, cur) => {
        if (cur.index && cur.index <= storyHandler.currentStoryIndex) {
          const find = acc.find(i => i.index === cur.index);
          if (!find) {
            acc.push(cur);
          }
        }
        return acc;
      },
      [] as LogText[]
    );
  },
  setL2DSpineUrl(url) {
    privateState.l2dSpineUrl = url;
  },
  setL2DConfig(val) {
    privateState.curL2dConfig = val;
  },
};

let store = {
  currentCharacterMap: new Map(),
  ...actions,
};

for (let getter of Object.keys(getterFunctions) as Array<
  keyof GetterFunctions
>) {
  Reflect.defineProperty(store, getter, {
    get: () => getterFunctions[getter](),
  });
}

for (let state of Object.keys(privateState) as Array<keyof PrivateStates>) {
  if (!["app"].includes(state)) {
    Reflect.defineProperty(store, state, {
      get: () => privateState[state],
    });
  }
}

/**
 * 资源调用接口
 * @returns 资源调用工具对象
 */
export let usePlayerStore = () => {
  return store as unknown as PublicStates &
    Getters &
    Readonly<PrivateStates> &
    Actions;
};

/**
 * 返回可修改的privateState, 仅本体在初始化时可调用
 */
export let initPrivateState = () => privateState;
