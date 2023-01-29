export type ResourcesTypes = 'emotionImg' | 'emotionSound' | 'fx' | 'l2dSpine' | 'l2dVoice' | 'excel' | 'bgm' | 'sound' | 'voiceJp' | 'characterSpine' | 'bg' | 'otherSound'
export type OtherSounds = 'select'
export type OtherSoundsUrls = {
  [key in OtherSounds]: string
}