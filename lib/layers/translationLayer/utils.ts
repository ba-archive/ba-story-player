import { Speaker, StoryRawUnit, StoryUnit, Text, TextEffect } from "@/types/common"
import { usePlayerStore } from '@/stores/index'
import { Language } from "@/types/store"
import { PlayAudio } from "@/types/events"
import { getResourcesUrl } from '@/utils'
import xxhash from 'xxhashjs'
import { CharacterNameExcelTableItem } from "@/types/excels"

let playerStore = usePlayerStore()

/**
 * 判断是否是角色
 * @param s
 */
export function isCharacter(s: string) {
  //类似#3
  return /^\d+$/.test(s)
}

/**
 * 判断是否角色特效
 * @param s
 */
export function isCharacterEffect(s: string) {
  return /#\d/.test(s)
}

/**
 * 判断当前字符串是否是选项
 * @param s 判断的字符串
 */
export function isOption(s: string) {
  // 选项字符串示例: '[s1] \"我正想着稍微散散步来着。\"\n[s2] \"优香在做什么？\"'
  //除此之外还有[ns], [s]等情况
  return /\[ns\]|\[s\d?\]/.test(s)
}


/**
 * 从原始文字生成Text[], 即带特效参数字符串
 * @param rawStoryUnit
 * @param stm 是否为stm类型文字
 * @returns
 */
export function generateText(rawStoryUnit: StoryRawUnit, stm?: boolean) {
  let rawText = getText(rawStoryUnit, playerStore.language)
  rawText = rawText.replace('[USERNAME]', playerStore.userName)
  rawText = rawText.replace('#n', '\n')
  let result: Text[] = []
  if (rawText.includes('[wa')) {
    //原始文字示例: "― （いや[wa:200]いや、[wa:900]いくら[wa:300]そういう[wa:300]状況だからって"
    //根据[wa分开
    let strs = rawText.split('[wa:')
    for (let str of strs) {
      let spiltIndex = str.indexOf(']')
      let waitTime = Number(str.slice(0, spiltIndex))
      let textUnit = str.slice(spiltIndex + 1)
      result.push({ content: textUnit, waitTime, effects: [] })
    }
  }
  else if (stm) {
    //例子[FF6666]……我々は望む、七つの[-][ruby=なげ][FF6666]嘆[-][/ruby][FF6666]きを。[-]
    rawText = rawText.replace('[/ruby]', '')
    let textUnits = rawText.split('[-]')
    for (let [index, textUnit] of textUnits.entries()) {
      let temp = textUnit.split(']')
      if (/^[\[A-F0-9]{6}/.test(textUnit)) {
        result.push({
          content: temp[1],
          effects: [
            { name: 'color', value: ['#' + temp[0].slice(1)] }
          ]
        })
      }
      else if (textUnit.startsWith('[ruby')) {
        result.push({
          content: temp[2],
          effects: [
            { name: 'color', value: ['#' + temp[1].slice(1)] },
            { name: 'ruby', value: [temp[0].slice(6)] }
          ]
        })
      }
    }
  }
  else {
    result.push({ content: rawText, effects: [] })
  }

  return result
}

/**
 * 在大小写不敏感的情况下比较字符串
 */
export function compareCaseInsensive(s1: string, s2: string) {
  return s1.localeCompare(s2, undefined, { sensitivity: 'accent' }) === 0;
}

/**
 * 获取角色在unit的characters里的index, 当不存在时会自动往unit的character里加入该角色
 */
export function getCharacterIndex(unit: StoryUnit, initPosition: number, result: StoryUnit[], rawIndex: number) {
  let characterIndex = unit.characters.findIndex(value => value.position === initPosition)
  let tempIndex = rawIndex
  while (characterIndex === -1) {
    tempIndex--
    characterIndex = result[tempIndex].characters.findIndex(value => value.position === initPosition)
    if (characterIndex !== -1) {
      let preCharacter = { ...result[tempIndex].characters[characterIndex] }
      preCharacter.effects = []
      unit.characters.push(preCharacter)
      characterIndex = unit.characters.length - 1
    }
  }

  return characterIndex
}

export function getBgm(BGMId: number): PlayAudio['bgm'] | undefined {
  let item = playerStore.BGMExcelTable.get(BGMId)
  if (item) {
    return { url: getResourcesUrl('bgm', item.Path), bgmArgs: item }
  }
}

export function getSoundUrl(Sound: string) {
  if (Sound) {
    return getResourcesUrl('sound', Sound)
  }
}

export function getVoiceJPUrl(VoiceJp: string) {
  if (VoiceJp) {
    return getResourcesUrl('voiceJp', VoiceJp)
  }
}

/**
 * 检查当前单元是否有背景覆盖变换, 有则删除该变换并返回变换的参数
 * @param unit
 */
export function checkBgOverlap(unit: StoryUnit) {
  if (unit.transition) {
    if (unit.transition.TransitionOut === 'bgoverlap') {
      let duration = unit.transition.TransitionOutDuration
      unit.transition = undefined
      return duration
    }
  }
}

export function getL2DUrlAndName(BGFileName: string) {
  let filename = String(BGFileName).split('/').pop()?.replace('SpineBG_Lobby', '')
  filename = `${filename}_home`
  return { url: getResourcesUrl('l2dSpine', filename), name: filename }
}

/**
 * 根据韩文名获取名字和头像
 * @param krName
 * @returns 包含speaker,avatar的对象
 */
export function getCharacterInfo(krName: string) {
  let CharacterName = getCharacterName(krName)
  let characterInfo = playerStore.CharacterNameExcelTable.get(CharacterName)
  if (characterInfo) {
    let avatarUrl = getResourcesUrl('avatar', characterInfo.SmallPortrait)
    let speaker = getSpeaker(characterInfo)
    return {
      speaker,
      avatarUrl
    }
  }
}

/**
 * 在CharacterNameExcelTableItem中获取到speaker信息
 */
export function getSpeaker(characterInfo: CharacterNameExcelTableItem): Speaker {
  let language = playerStore.language.toUpperCase() as 'CN' | 'JP'
  if (characterInfo[`Name${language}`]) {
    return {
      name: characterInfo[`Name${language}`]!,
      nickName: characterInfo[`Nickname${language}`]!
    }
  }
  else {
    return {
      name: characterInfo.NameJP,
      nickName: characterInfo.NicknameJP
    }
  }
}

/**
 * 根据角色韩文名获取CharacterName
 * @param krName 
 */
export function getCharacterName(krName: string) {
  return xxhash.h32(krName, 0).toNumber()
}

/**
 * 选择文字, 当没有当前语言文字时返回日文
 */
export function getText(rawStoryUnit: StoryRawUnit, language: Language): string {
  let textProperty = `Text${language}` as const
  if (textProperty in rawStoryUnit) {
    return String(Reflect.get(rawStoryUnit, textProperty))
  }
  else {
    return String(rawStoryUnit.TextJp)
  }
}