import { Character, StoryRawUnit, StoryUnit, Text, TextEffect } from "@/types/common";
import { usePlayerStore } from '@/stores'
import { EmotionWord } from "@/types/characterLayer";
import * as utils from "./utils";


let emotionWordTable: { [index: string]: EmotionWord } = {
  '[하트]': 'Heart',
  'h': 'Heart',
  '[반응]': 'Respond',
  '[음표]': 'Music',
  'm': 'Music',
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
 * @param rawStory: 原始剧情
 */
export function translate(rawStory: StoryRawUnit[]): StoryUnit[] {

  let result: StoryUnit[] = []
  let playStore = usePlayerStore()
  for (let [rawIndex, rawStoryUnit] of rawStory.entries()) {
    //初始化unit, 并将需要的原始属性填入unit
    let { GroupId, BGMId, BGName, BGEffect, SelectionGroup, Sound, Transition, VoiceJp, PopupFileName } = rawStoryUnit
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

    //当没有文字时初步判断为effectOnly类型
    if (rawStoryUnit.TextJp === '' || rawStoryUnit.TextJp === null) {
      unit.type = 'effectOnly'
    }

    let ScriptKr = String(rawStoryUnit.ScriptKr)
    let scripts = ScriptKr.split('\n')
    for (let script of scripts) {
      //根据';'将script分为更小的单元
      let scriptUnits = script.split(';')
      /**
       * 当前script类型, 小写字母
       */
      let scriptType = scriptUnits[0].toLocaleLowerCase()
      let optionIndex = 0

      if (utils.compareCaseInsensive(scriptType, '#title')) {
        unit.type = 'title'
        unit = utils.setOneText(unit, rawStoryUnit, playStore.userName)
        break
      }
      else if (utils.compareCaseInsensive(scriptType, '#place')) {
        unit.type = 'place'
        unit = utils.setOneText(unit, rawStoryUnit, playStore.userName)
        break
      }
      else if (utils.compareCaseInsensive(scriptType, '#na')) {
        //无立绘时的对话框对话, 可能有名字
        unit.type = 'text'
        unit = utils.setOneText(unit, rawStoryUnit, playStore.userName)
        if (scriptUnits.length === 3) {
          unit.naName = scriptUnits[1]
        }
      }
      else if (utils.compareCaseInsensive(scriptType, '#st')) {
        unit.type = 'st'
        unit.stArgs = scriptUnits.slice(1)
        if (scriptUnits.length === 3) {
          break
        }
        //当st有文字时
        else {
          unit.stArgs = scriptUnits.slice(1, scriptUnits.length - 1)
          unit.text.TextJp = utils.generateText(rawStoryUnit.TextJp)
          if (rawStoryUnit.TextCn) {
            unit.text.TextCn = utils.generateText(rawStoryUnit.TextCn)
          }
        }
      }
      else if (utils.compareCaseInsensive(scriptType, '#stm')) {
        //有特效的st
        unit.type = 'st'

        let jp = utils.generateTextEffect(rawStoryUnit.TextJp)
        unit.text.TextJp = jp.text
        unit.textEffect.TextJp = jp.textEffects
        if (rawStoryUnit.TextCn) {
          let cn = utils.generateTextEffect(rawStoryUnit.TextCn)
          unit.text.TextCn = cn.text
          unit.textEffect.TextCn = cn.textEffects
        }
      }
      else if (utils.compareCaseInsensive(scriptType, '#clearST')) {
        unit.clearSt = true
      }
      else if (utils.compareCaseInsensive(scriptType, '#wait')) {
        unit.otherEffect.push({ type: 'wait', args: [scriptUnits[1]] })
      }
      else if (utils.isCharacter(scriptType)) {
        let CharacterName = playStore.characterNameTable[scriptUnits[1]]
        //添加全息人物特效
        let signal = false
        let characterInfo = playStore.CharacterNameExcelTable.get(CharacterName)
        if (characterInfo) {
          if (characterInfo.Shape === 'Signal') {
            signal = true
          }
        }

        //有立绘人物对话
        if (scriptUnits.length === 4) {
          unit.type = 'text'
          utils.setOneText(unit, rawStoryUnit, playStore.userName)
        }
        unit.characters.push({
          CharacterName,
          position: Number(scriptType),
          face: scriptUnits[2],
          highlight: scriptUnits.length === 4,
          signal,
          effects: []
        })

      }
      else if (utils.isCharacterEffect(scriptType)) {
        if (scriptUnits.length === 2) {
          let characterIndex = utils.getCharacterIndex(unit, Number(scriptType[1]), result, rawIndex)
          unit.characters[characterIndex].effects.push({
            type: 'action',
            effect: scriptUnits[1],
            async: false
          })
        }
        else if (utils.compareCaseInsensive(scriptUnits[1], 'em')) {
          let characterIndex = utils.getCharacterIndex(unit, Number(scriptType[1]), result, rawIndex)
          unit.characters[characterIndex].effects.push({
            type: 'emotion',
            effect: emotionWordTable[scriptUnits[2]],
            async: false
          })
        }
        else if (utils.compareCaseInsensive(scriptUnits[1], 'fx')) {
          let characterIndex = utils.getCharacterIndex(unit, Number(scriptType[1]), result, rawIndex)
          unit.characters[characterIndex].effects.push({
            type: 'fx',
            effect: scriptUnits[2],
            async: false
          })
        }
      }
      else if (utils.isOption(scriptType)) {
        unit.type = 'option'
        let TextJp = String(rawStoryUnit.TextJp).split('\n')[optionIndex]
        TextJp = TextJp.slice(4)
        let TextCn
        if (rawStoryUnit.TextCn) {
          TextCn = String(rawStoryUnit.TextCn).split('\n')[optionIndex]
          TextCn = TextCn.slice(4)
        }
        //[ns]或[s]
        if (scriptType[2] === 's' || scriptType[2] === ']') {
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
            unit.options.push({ SelectionGroup: Number(scriptType[2]), text: { TextJp, TextCn } })
          }
          else {
            unit.options = [{ SelectionGroup: Number(scriptType[2]), text: { TextJp, TextCn } }]
          }
        }
        optionIndex++
      }
      else if (utils.compareCaseInsensive(scriptType, '#fontsize')) {
        unit.textEffect.TextJp.push({ textIndex: 0, name: 'fontsize', value: [scriptUnits[1]] })
        if (rawStoryUnit.TextCn) {
          if (unit.textEffect.TextCn) {
            unit.textEffect.TextCn.push({ textIndex: 0, name: 'fontsize', value: [scriptUnits[1]] })
          }
          else {
            unit.textEffect.TextCn = [{ textIndex: 0, name: 'fontsize', value: [scriptUnits[1]] }]
          }
        }
      }
      else if (utils.compareCaseInsensive(scriptType, '#all')) {
        if (utils.compareCaseInsensive(scriptUnits[1], 'hide')) {
          unit.hide = 'all'
        }
      }
      else if (utils.compareCaseInsensive(scriptType, '#hidemenu')) {
        unit.hide = 'menu'
      }
      else if (utils.compareCaseInsensive(scriptType, '#showmenu')) {
        unit.show = 'menu'
      }
      else if (utils.compareCaseInsensive(scriptType, '#zmc')) {
        unit.otherEffect.push({ type: 'zmc', args: scriptUnits.slice(1) })
      }
      else if (utils.compareCaseInsensive(scriptType, '#bgshake')) {
        unit.otherEffect.push({ type: 'bgshake', args: [] })
      }
      else if (scriptType === '#video') {
        //处理情况为 #video;Scenario/Main/22000_MV_Video;Scenario/Main/22000_MV_Sound
        unit.video = {
          videoPath: scriptUnits[1],
          soundPath: scriptUnits[2]
        }
      }
    }
    result.push(unit)
  }

  return result
}

