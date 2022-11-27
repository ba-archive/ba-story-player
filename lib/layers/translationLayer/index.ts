import { Character, StoryRawUnit, StoryUnit, Text, TextEffect } from "@/types/common";
import { usePlayerStore } from '@/stores'
import { EmotionWord } from "@/types/characterLayer";


let emotionWordTable: { [index: string]: EmotionWord } = {
  '[하트]': 'Heart',
  'h': 'Heart',
  '[반응]': 'Respond',
  '[음표]': 'Note',
  'm': 'Note',
  '[반짝]': 'Twinkle',
  'k': 'Twinkle',
  '[속상함]': 'Sad',
  'u': 'Sad',
  '[땀]': 'Sweat',
  'w': 'Sweat',
  '[...]': 'Dot',
  '…': 'Dot',
  'c': 'Chat',
  '[!]': 'Exclaim',
  '[빠직]': 'Angry',
  '[?!]': 'Surprise',
  '?!': 'Surprise',
  '[?]': 'Question',
  '[///]': 'Shy'
  // TODO: Upset, Music, Think, Bulb, Sigh, Steam, Zzz, Tear
}

/**
 * 将原始剧情结构翻译成标准剧情结构
 */
export function translate(rawStory: StoryRawUnit[]): StoryUnit[] {

  let result: StoryUnit[] = []
  let playStore = usePlayerStore()
  for (let [rawIndex, i] of rawStory.entries()) {
    let { GroupId, BGMId, BGName, BGEffect, SelectionGroup, Sound, Transition, VoiceJp, PopupFileName } = i
    let unit: StoryUnit = {
      GroupId, BGMId, BGName, BGEffect, SelectionGroup, Sound, Transition, VoiceJp, PopupFileName,
      type: 'text',
      characters: [],
      otherEffect: [],
      text: { TextJp: [] },
      textEffect: {
        TextJp: []
      }
    }
    if (i.TextJp == '' || i.TextJp == null) {
      unit.type = 'effectOnly'
    }

    let ScriptKr = String(i.ScriptKr)
    let strs = ScriptKr.split('\n')
    for (let [index, j] of strs.entries()) {
      let smallJ = j.split(';')
      let optionIndex = 0
      if (compareCaseInsensive(smallJ[0], '#title')) {
        unit.type = 'title'
        unit = setOneText(unit, i)
        break
      }
      else if (compareCaseInsensive(smallJ[0], '#place')) {
        unit.type = 'place'
        unit = setOneText(unit, i)
        break
      }
      else if (compareCaseInsensive(smallJ[0], '#na')) {
        unit.type = 'text'
        unit = setOneText(unit, i)
        if (smallJ.length == 3) {
          unit.naName = smallJ[1]
        }
      }
      else if (compareCaseInsensive(smallJ[0], '#st')) {
        unit.type = 'st'
        unit.stArgs = smallJ.slice(1)
        if (smallJ.length == 3) {
          break
        }
        //当st有文字时
        else {
          unit.stArgs = smallJ.slice(1, smallJ.length - 1)
          unit.text.TextJp = generateText(i.TextJp)
          if (i.TextCn) {
            unit.text.TextCn = generateText(i.TextCn)
          }
        }
      }
      else if (compareCaseInsensive(smallJ[0], '#stm')) {
        unit.type = 'st'

        let jp = generateTextEffect(i.TextJp)
        unit.text.TextJp = jp.text
        unit.textEffect.TextJp = jp.textEffects
        if (i.TextCn) {
          let cn = generateTextEffect(i.TextCn)
          unit.text.TextCn = cn.text
          unit.textEffect.TextCn = cn.textEffects
        }
      }
      else if (compareCaseInsensive(smallJ[0], '#clearST')) {
        unit.clearSt = true
      }
      else if (compareCaseInsensive(smallJ[0], '#wait')) {
        unit.otherEffect.push({ type: 'wait', args: [smallJ[1]] })
      }
      else if (isDigit(smallJ[0])) {
        let CharacterName = playStore.characterNameTable[smallJ[1]]
        unit.characters.push({
          CharacterName,
          position: Number(smallJ[0]),
          face: smallJ[2],
          highlight: smallJ.length == 4,
          effects: []
        })
        //添加全息人物特效
        if ('Shape' in playStore.CharacterNameExcelTable[CharacterName]
          &&
          playStore.CharacterNameExcelTable[CharacterName].Shape == 'Signal') {
          for (let [index, character] of unit.characters.entries()) {
            if (character.position === Number(smallJ[0])) {
              unit.characters[index].effects.push({
                type: 'signal',
                effect: '',
                async: false,
              })
            }
          }
        }
        if (smallJ.length == 4) {
          setOneText(unit, i)
        }
      }
      else if (isCharacterEffect(smallJ[0])) {
        if (smallJ.length == 2) {
          let characterIndex = getCharacterIndex(unit,Number(smallJ[0][1]),result,rawIndex)
          unit.characters[characterIndex].effects.push({
            type: 'action',
            effect: smallJ[1],
            async: false
          })
        }
        else if (compareCaseInsensive(smallJ[1], 'em')) {
          let characterIndex = getCharacterIndex(unit,Number(smallJ[0][1]),result,rawIndex)
          unit.characters[characterIndex].effects.push({
            type: 'emotion',
            effect: emotionWordTable[smallJ[2]],
            async: false
          })
        }
        else if (compareCaseInsensive(smallJ[1], 'fx')) {
          let characterIndex = getCharacterIndex(unit,Number(smallJ[0][1]),result,rawIndex)
          unit.characters[characterIndex].effects.push({
            type: 'fx',
            effect: smallJ[2],
            async: false
          })
        }
      }
      else if (isOption(smallJ[0])) {
        unit.type = 'option'
        let TextJp = String(i.TextJp).split('\n')[optionIndex]
        TextJp = TextJp.slice(4)
        let TextCn
        if (i.TextCn) {
          TextCn = String(i.TextCn).split('\n')[optionIndex]
          TextCn = TextCn.slice(4)
        }
        //[ns]或[s]
        if (smallJ[0][2] == 's' || smallJ[0][2] == ']') {
          if (unit.options) {
            unit.options.push({ SelectionGroup: 0, text: { TextJp, TextCn } })
          }
          else {
            unit.options = [{ SelectionGroup: 0, text: { TextJp, TextCn } }]
          }
        }
        else {
          //[s1]
          if (unit.options) {
            unit.options.push({ SelectionGroup: Number(smallJ[0][2]), text: { TextJp, TextCn } })
          }
          else {
            unit.options = [{ SelectionGroup: Number(smallJ[0][2]), text: { TextJp, TextCn } }]
          }
        }
        optionIndex++
      }
      else if (compareCaseInsensive(smallJ[0], '#fontsize')) {
        unit.textEffect.TextJp.push({ textIndex: 0, name: 'fontsize', value: [smallJ[1]] })
        if (i.TextCn) {
          if (unit.textEffect.TextCn) {
            unit.textEffect.TextCn.push({ textIndex: 0, name: 'fontsize', value: [smallJ[1]] })
          }
          else {
            unit.textEffect.TextCn = [{ textIndex: 0, name: 'fontsize', value: [smallJ[1]] }]
          }
        }
      }
      else if (compareCaseInsensive(smallJ[0], '#all')) {
        if (compareCaseInsensive(smallJ[1], 'hide')) {
          unit.hide = 'all'
        }
      }
      else if (compareCaseInsensive(smallJ[0], '#hidemenu')) {
        unit.hide = 'menu'
      }
      else if (compareCaseInsensive(smallJ[0], '#showmenu')) {
        unit.show = 'menu'
      }
      else if (compareCaseInsensive(smallJ[0], '#zmc')) {
        unit.otherEffect.push({ type: 'zmc', args: smallJ.slice(1) })
      }
      else if (compareCaseInsensive(smallJ[0], '#bgshake')) {
        unit.otherEffect.push({ type: 'bgshake', args: [] })
      }
    }
    result.push(unit)
  }

  return result
}

/**
 * 当只需要一行语句时填充unit
 */
function setOneText(unit: StoryUnit, i: StoryRawUnit) {
  let playStore = usePlayerStore()
  unit.text.TextJp = [{ content: String(i.TextJp).replace('[USERNAME]', playStore.userName).replace('#n', '\n') }]
  if (i.TextCn) {
    unit.text.TextCn = [{ content: String(i.TextCn).replace('[USERNAME]', playStore.userName).replace('#n', '\n') }]
  }

  return unit
}

function isDigit(s: string) {
  return /^\d+$/.test(s)
}

function isCharacterEffect(s: string) {
  return /#\d/.test(s)
}

function isOption(s: string) {
  return /\[ns\]|\[s\d?\]/.test(s)
}

/**
 * 根据原始文字生成Text数组
 */
function generateText(s: string): Text[] {
  let strs = s.split('[')
  let result: Text[] = []
  for (let i of strs) {
    let slices = i.split(']')
    if (slices.length == 1) {
      result.push({ content: slices[0] })
    }
    else {
      let effectSlice = slices[0].split(':')
      if (effectSlice[0] == 'wa') {
        result.push({ content: slices[1], waitTime: Number(effectSlice[1]) })
      }
    }
  }

  return result
}

/**
 * 生成Text和TextEffect
 */
function generateTextEffect(s: string) {
  s = String(s)
  s = s.replace('[/ruby]', '')
  let texts = s.split('[-]')
  let text: Text[] = []
  let textEffects: TextEffect[] = []
  for (let [index, i] of texts.entries()) {
    if (i.startsWith('[FF')) {
      let temp = i.split(']')
      text.push({ content: temp[1] })
      textEffects.push({ name: 'color', value: [temp[0].slice(1)], textIndex: index })
    }
    else if (i.startsWith('[ruby')) {
      let temp = i.split(']')
      text.push({ content: temp[2] })
      textEffects.push({ name: 'color', value: [temp[1].slice(1)], textIndex: index })
      textEffects.push({ name: 'ruby', value: [temp[0].slice(6)], textIndex: index })
    }
  }

  return { text, textEffects }
}

/**
 * 在大小写不敏感的情况下比较字符串
 */
function compareCaseInsensive(s1: string, s2: string) {
  return s1.localeCompare(s2, undefined, { sensitivity: 'accent' }) == 0;
}

/**
 * 获取角色的character index, 当不存在时会自动往unit加入该角色
 */
function getCharacterIndex(unit:StoryUnit,initPosition:number,result:StoryUnit[],rawIndex:number) {
  let characterIndex = unit.characters.findIndex(value => value.position === initPosition)
  let tempIndex = rawIndex
  while (characterIndex == -1) {
    tempIndex--
    characterIndex = result[tempIndex].characters.findIndex(value => value.position === initPosition)
    if (characterIndex != -1) {
      let preCharacter = { ...result[tempIndex].characters[characterIndex] }
      preCharacter.effects = []
      unit.characters.push(preCharacter)
      characterIndex = unit.characters.length - 1
    }
  }

  return characterIndex
}