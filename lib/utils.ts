import { OtherSoundsUrls, ResourcesTypes } from "@/types/resources"

let dataUrl = ''
let otherSoundMap: OtherSoundsUrls

/**
 * 设置数据站点
 * @param url 
 */
export function setDataUrl(url: string): void {
  dataUrl = url
  otherSoundMap = {
    select: `${dataUrl}/Audio/Sound/UI_Button_Touch.wav`
  }
}

/**
 * 获取其他特效音资源, 用于本体资源加载
 * @returns 
 */
export function getOtherSoundUrls(): string[] {
  return Object.values(otherSoundMap)
}


/**
 * 根据资源类型和参数获取资源地址, 可根据服务器实际情况修改
 * @param type 
 * @param arg 
 * @returns 
 */
export function getResourcesUrl(type: ResourcesTypes, arg: string): string {
  switch (type) {
    case 'emotionImg':
      return `${dataUrl}/emotions/${arg}`
    case 'emotionSound':
      return `${dataUrl}/Audio/Sound/${arg}.wav`
    case 'fx':
      return `${dataUrl}/fx/${arg}`
    case 'l2dVoice':
      return `${dataUrl}/Audio/VoiceJp/${arg}.wav`
    case 'l2dSpine':
      return `${dataUrl}/spine/${arg}/${arg}.skel`
    case 'excel':
      return `${dataUrl}/data/${arg}`
    case 'bgm':
      return `${dataUrl}/${arg}.ogg`
    case 'sound':
      return `${dataUrl}/Audio/Sound/${arg}.wav`
    case 'voiceJp':
      return `${dataUrl}/Audio/VoiceJp/${arg}.wav`
    case 'characterSpine':
      return `${dataUrl}/spine/${arg}/${arg}.skel`
    case 'bg':
      return `${dataUrl}/${arg}.jpg`
    case 'otherSound':
      return Reflect.get(otherSoundMap, arg) || ''
    default:
      return ''
  }
}