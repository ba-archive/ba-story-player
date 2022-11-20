import { Character, StoryRawUnit, StoryUnit, Text, TextEffect } from "@/types/common";
import { usePlayerStore } from '@/stores'


let emotionWordTable:{[index:string]:string}={
  '[하트]':'Heart',
  'h':'Heart',
  '[반응]':'Respond',
  '[음표]':'Note',
  'm':'Note',
  '[반짝]':'Twinkle',
  'k':'Twinkle',
  '[속상함]':'Sad',
  'u':'Sad',
  '[땀]':'Sweat',
  'w':'Sweat',
  '[...]':'Dot',
  '…':'Dot',
  'c':'Chat',
  '[!]':'Exclaim',
  '[빠직]':'Angry',
  '[?!]':'Surprise',
  '?!':'Surprise',
  '[?]':'Question',
  '[///]':'Shy'
  // TODO: Upset, Music, Think, Bulb, Sigh, Steam, Zzz, Tear
}

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
      otherEffect:[],
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
        if(smallJ.length==3){
          unit.naName=smallJ[1]
        }
      }
      else if (smallJ[0] == '#st') {
        unit.type = 'st'
        unit.stArgs = smallJ.slice(1)
        if (smallJ.length == 3) {
          break
        }
        //当st有文字时
        else {
          unit.stArgs=smallJ.slice(1,smallJ.length-1)
          unit.text.TextJp = generateText(i.TextJp)
          if (i.TextCn) {
            unit.text.TextCn = generateText(i.TextCn)
          }
        }
      }
      else if (smallJ[0] == '#stm') {
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
      else if (smallJ[0] == '#clearST') {
        unit.clearSt = true
      }
      else if (smallJ[0] == '#wait') {
        unit.otherEffect.push({ type: 'wait', args: [smallJ[1]] })
      }
      else if (isDigit(smallJ[0])) {
        let CharacterName=playStore.characterNameTable[smallJ[1]]
        unit.characters.push({
          CharacterName,
          position: Number(smallJ[0]),
          face: smallJ[2],
          highlight: smallJ.length == 4
        })
        if('Shape' in playStore.CharacterNameExcelTable[CharacterName]
          && 
          playStore.CharacterNameExcelTable[CharacterName].Shape=='Signal'){
          unit.characterEffect.push({
            type:'signal',
            target:Number(smallJ[0]),
            effect:'',
            async:false
          })
        }
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
        else if(smallJ[1]=='em'){
          unit.characterEffect.push({
            type: 'emotion',
            target: Number(smallJ[0][1]),
            effect: emotionWordTable[smallJ[2]],
            async: false
          })
        }
        else if(smallJ[1]=='fx'){
          unit.characterEffect.push({
            type:'fx',
            target: Number(smallJ[0][1]),
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
      else if (smallJ[0] == '#fontsize') {
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
      else if (smallJ[0] == '#all') {
        if (smallJ[1] == 'hide' || smallJ[1]=='HIDE') {
          unit.hide = 'all'
        }
      }
      else if (smallJ[0] == '#hidemenu') {
        unit.hide = 'menu'
      }
      else if (smallJ[0] == '#showmenu') {
        unit.show='menu'
      }
      else if(smallJ[0]=='#zmc'){
        unit.otherEffect.push({type:'zmc',args:smallJ.slice(1)})
      }
      else if(smallJ[0]=='#bgshake'){
        unit.otherEffect.push({type:'bgshake',args:[]})
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
  unit.text.TextJp = [{ content: String(i.TextJp).replace('[USERNAME]', playStore.userName).replace('#n','\n') }]
  if (i.TextCn) {
    unit.text.TextCn = [{ content: String(i.TextCn).replace('[USERNAME]', playStore.userName).replace('#n','\n') }]
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