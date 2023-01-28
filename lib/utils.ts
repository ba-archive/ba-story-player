let dataUrl = ''

/**
 * 设置数据站点
 * @param url 
 */
export function setDataUrl(url: string): void {
  dataUrl = url
}

type ResourcesTypes = 'emotionImg' | 'emotionSound' | 'fx' | 'l2dSpine' | 'l2dVoice' | 'excel' | 'bgm' | 'sound' | 'voiceJp' | 'characterSpine' | 'bg'

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
    default:
      return ''
  }
}