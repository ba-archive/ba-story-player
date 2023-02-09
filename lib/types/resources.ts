export type ResourcesTypes = 'emotionImg' | 'emotionSound' | 'fx' | 'l2dSpine'
  | 'l2dVoice' | 'excel' | 'bgm' | 'sound' | 'voiceJp' | 'characterSpine' | 'bg' | 'otherSound'
  | 'otherL2dSpine' | 'bgEffectImgs' | 'avatar'
export type OtherSounds = 'select' | 'bg_underfire'
export type OtherSoundsUrls = {
  [key in OtherSounds]: string
}