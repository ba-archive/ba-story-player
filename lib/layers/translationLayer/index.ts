import { Character, StoryRawUnit, StoryUnit, Text } from "@/types/common";
import { usePlayerStore } from '@/stores'

/**
 * 将原始剧情结构翻译成标准剧情结构
 */
export function translate(rawStory: StoryRawUnit[]): StoryUnit[] {

  let result: StoryUnit[] = []
  let playStore = usePlayerStore()
  for (let i of rawStory) {
    let { GroupId, BGMId, BGName, BGEffect, SelectionGroup, Sound, Transition, VoiceJp, PopupFileName } = i
    let unit: StoryUnit = {
      GroupId, BGMId, BGName, BGEffect, SelectionGroup, Sound, Transition, VoiceJp, PopupFileName,
      type: 'text',
      characters: [],
      characterEffect: [],
      text: { TextJp: [] },
      textEffect: []
    }
    if (i.TextJp == '') {
      unit.type = 'effectOnly'
    }

    let ScriptKr = String(i.ScriptKr)
    let strs = ScriptKr.split('\n')
    for (let [index, j] of strs.entries()) {
      let smallJ = j.split(';')
      if (smallJ[0] == '#title') {
        unit.type = 'title'
        unit = setOneText(unit, i)
        break
      }
      else if (smallJ[0] == '#place') {
        unit.type = 'place'
        unit = setOneText(unit, i)
        break
      }
      else if (smallJ[0] == '#na') {
        unit.type = 'text'
        unit = setOneText(unit, i)
        break
      }
      else if (smallJ[0] == '#st') {
        unit.type='st'
        if (smallJ.length == 3) {
          break
        }
        //当st有文字时
        else {
          unit.text.TextJp=generateText(i.TextJp)
          if(i.TextCn){
            unit.text.TextCn=generateText(i.TextCn)
          }
        }
      }
      else if (smallJ[0] == '#clearST') {
        unit.clearSt=true
      }
      else if (smallJ[0] == '#wait') {
        unit.otherEffect = [{ type: 'wait', args: [smallJ[1]] }]
      }
      else if (isDigit(smallJ[0])) {
        unit.characters.push({
          CharacterName: playStore.characterNameTable[smallJ[1]],
          position: Number(smallJ[0]),
          face: smallJ[2],
          highlight: smallJ.length == 4
        })
        if (smallJ.length == 4) {
          setOneText(unit, i)
        }
      }
      else if (isCharacterEffect(smallJ[0])) {
        if (smallJ.length == 2) {
          unit.characterEffect.push({
            type: 'action',
            target: Number(smallJ[0][1]),
            effect: smallJ[1],
            async: false
          })
        }
        else {
          unit.characterEffect.push({
            type: 'emotion',
            target: Number(smallJ[0][1]),
            effect: smallJ[2],
            async: false
          })

        }
      }
      else if (isOption(smallJ[0])) {
        unit.type = 'option'
        let TextJp = String(i.TextJp).split('\n')[index]
        TextJp = TextJp.slice(4)
        let TextCn
        if (i.TextCn) {
          TextCn = String(i.TextCn).split('\n')[index]
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
      }
      else if (smallJ[0] == '#fontsize') {
        unit.textEffect.push({ textIndex: 0, name: 'fontsize', value: [smallJ[1]] })
      }
      else if (smallJ[0] == '#all') {
        if (smallJ[1] == 'hide') {
          unit.hide='all'
        }
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
  unit.text.TextJp = [{ content: i.TextJp }]
  if (i.TextCn) {
    unit.text.TextCn = [{ content: i.TextCn }]
  }

  return unit
}

function isDigit(s: string) {
  return /^\d+$/.test(s)
}

function isCharacterEffect(s: string) {
  return /#\d/.test(s)
}

function findCharacterNameByPosition(characters: Character[], position: number) {
  return characters.filter(value => value.position == position)[0].CharacterName
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