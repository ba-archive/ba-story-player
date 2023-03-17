import { OtherSoundsUrls, ResourcesTypes } from "@/types/resources";

let dataUrl = "";
let otherSoundMap: OtherSoundsUrls;
/**
 * ogg类型的音频是否用其他音频类型代替
 */
let oggAudioType = "ogg";

/**
 * 设置数据站点
 * @param url
 */
export function setDataUrl(url: string): void {
  dataUrl = url;
  otherSoundMap = {
    select: `${dataUrl}/Audio/Sound/UI_Button_Touch.wav`,
    bg_underfire: `${dataUrl}/Audio/Sound/UI_FX_BG_UnderFire.wav`,
    back: `${dataUrl}/Audio/Sound/UI_Button_Back.wav`,
  };
}

/**
 * 设置ogg类型音频的替代音频类型
 */
export function setOggAudioType(audioType: "mp3") {
  oggAudioType = audioType;
}

/**
 * 获取其他特效音资源, 用于本体资源加载
 * @returns
 */
export function getOtherSoundUrls(): string[] {
  return Object.values(otherSoundMap);
}

/**
 * 根据资源类型和参数获取资源地址, 可根据服务器实际情况修改
 * @param type
 * @param arg
 * @returns
 */
export function getResourcesUrl(type: ResourcesTypes, arg: string): string {
  switch (type) {
    case "emotionImg":
      return `${dataUrl}/emotions/${arg}`;
    case "emotionSound":
      return `${dataUrl}/Audio/Sound/${arg}.wav`;
    case "fx":
      return `${dataUrl}/effectTexture/${arg}`;
    case "l2dVoice":
      //arg "sound/CH0184_MemorialLobby_1_1"
      const voiceDirectory = arg.replace(
        /sound\/([A-Z0-9]*)_MemorialLobby.*/,
        "JP_$1"
      );
      const voiceFilename = arg.split("/").pop();
      return `${dataUrl}/Audio/VoiceJp/Character_voice/${voiceDirectory}/${voiceFilename}.${oggAudioType}`;
    case "l2dSpine":
      return `${dataUrl}/spine/${arg}/${arg}.skel`;
    case "otherL2dSpine":
      return `${dataUrl}/spine/${arg}.skel`;
    case "excel":
      return `${dataUrl}/data/${arg}`;
    case "bgm":
      return `${dataUrl}/${arg}.${oggAudioType}`;
    case "sound":
      return `${dataUrl}/Audio/Sound/${arg}.wav`;
    case "voiceJp":
      return `${dataUrl}/Audio/VoiceJp/${arg}.${oggAudioType}`;
    case "characterSpine":
      //arg UIs/03_Scenario/02_Character/CharacterSpine_hasumi
      let temp = String(arg).split("/");
      let id = temp.pop();
      id = id?.replace("CharacterSpine_", "");
      let filename = `${id}_spr`; //hasumi_spr
      return `${dataUrl}/spine/${filename}/${filename}.skel`;
    case "bg":
      return `${dataUrl}/${arg}.jpg`;
    case "otherSound":
      return Reflect.get(otherSoundMap, arg) || "";
    case "bgEffectImgs":
      return `${dataUrl}/effectTexture/${arg}`;
    case "avatar":
      //arg: UIs/01_Common/01_Character/Student_Portrait_Hasumi
      return `${dataUrl}/${arg}.png`;
    case "popupImage":
      return `${dataUrl}/UIs/03_Scenario/04_ScenarioImage/${arg}.png`;
    default:
      return "";
  }
}

/**
 * 字面意思, 深拷贝json
 */
export function deepCopyObject<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}

/*
 * wait in promise
 */
export function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
