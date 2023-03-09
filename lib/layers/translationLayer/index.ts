import { usePlayerStore } from '@/stores';
import { StoryRawUnit, StoryUnit, ZmcArgs } from "@/types/common";
import { StArgs } from '@/types/events';
import { getResourcesUrl } from '@/utils';
import { l2dConfig } from '../l2dLayer/l2dConfig';
import * as utils from "./utils";
import {getText} from "./utils";

/**
 * 将原始剧情结构翻译成标准剧情结构
 * @param rawStory: 原始剧情
 */
export function translate(rawStory: StoryRawUnit[]): StoryUnit[] {

  let result: StoryUnit[] = []
  let playerStore = usePlayerStore()
  for (let [rawIndex, rawStoryUnit] of rawStory.entries()) {
    //初始化unit, 将需要的原始属性填入unit, 同时查表填入其他属性
    let { GroupId, SelectionGroup, PopupFileName } = rawStoryUnit
    let unit: StoryUnit = {
      GroupId, SelectionGroup,
      PopupFileName: !PopupFileName ? '' : getResourcesUrl('popupImage', PopupFileName),
      type: 'text',
      characters: [],
      textAbout: {
        showText: {
          text: [],
        },
        st: {}
      },
      effect: {
        otherEffect: []
      },
    }
    let audio = {
      bgm: utils.getBgm(rawStoryUnit.BGMId),
      soundUrl: utils.getSoundUrl(rawStoryUnit.Sound),
      voiceJPUrl: utils.getVoiceJPUrl(rawStoryUnit.VoiceJp)
    }
    for (let key of Object.keys(audio) as Array<keyof typeof audio>) {
      if (audio[key] !== undefined) {
        unit.audio = audio
        break
      }
    }
    if (rawStoryUnit.Transition) {
      unit.transition = playerStore.TransitionExcelTable.get(rawStoryUnit.Transition)
    }
    if (rawStoryUnit.BGName) {
      let BGItem = playerStore.BGNameExcelTable.get(rawStoryUnit.BGName)
      if (BGItem) {
        if (BGItem.BGType === 'Image') {
          unit.bg = {
            url: getResourcesUrl('bg', BGItem.BGFileName),
            overlap: utils.checkBgOverlap(unit)
          }
        }
        else if (BGItem.BGType === 'Spine') {
          // 取第一次出现的 l2d 作为配置
          const l2dInfo = utils.getL2DUrlAndName(BGItem.BGFileName)
          playerStore.setL2DConfig(playerStore.curL2dConfig || l2dConfig[l2dInfo.name])
          unit.l2d = {
            spineUrl: l2dInfo.url,
            animationName: BGItem.AnimationName
          }
        }
      }
    }
    if (rawStoryUnit.BGEffect) {
      unit.effect.BGEffect = playerStore.BGEffectExcelTable.get(rawStoryUnit.BGEffect)
    }

    //当没有文字时初步判断为effectOnly类型
    if (rawStoryUnit.TextJp === '' || rawStoryUnit.TextJp === null) {
      unit.type = 'effectOnly'
    }
    //解析scriptkr
    let ScriptKr = String(rawStoryUnit.ScriptKr)
    let scripts = ScriptKr.split('\n')
    let optionIndex = 0
    for (let script of scripts) {
      //根据';'将script分为更小的单元
      let scriptUnits = script.split(';')
      /**
       * 当前script类型, 小写字母
       */
      let scriptType = scriptUnits[0].toLocaleLowerCase()
      switch (scriptType) {
        case '#title':
          unit.type = 'title'
          unit.textAbout.titleInfo = utils.generateTitleInfo(rawStoryUnit, usePlayerStore().language)
          break;
        case '#nextepisode':
          unit.type = 'nextEpisode'
          unit.textAbout.titleInfo = utils.generateTitleInfo(rawStoryUnit, usePlayerStore().language)
          break
        case '#continued':
          unit.type = 'continue'
          break
        case '#place':
          unit.type = 'place'
          unit.textAbout.word = utils.generateText(rawStoryUnit)[0].content
          break
        case '#na':
          //无立绘时的对话框对话, 可能有名字
          unit.type = 'text'
          unit.textAbout.showText.text = utils.generateText(rawStoryUnit)
          let characterInfo = utils.getCharacterInfo(scriptUnits[1])
          if (scriptUnits.length === 3) {
            unit.textAbout.showText.speaker = characterInfo?.speaker
            unit.textAbout.showText.avatarUrl = characterInfo?.avatarUrl
          }
          break
        case '#st':
          unit.type = 'st'
          unit.textAbout.st = { middle: false }
          unit.textAbout.st.stArgs = [JSON.parse(scriptUnits[1]) as number[], scriptUnits[2] as StArgs[1], Number(scriptUnits[3])]
          if (scriptUnits.length === 3) {
            break
          }
          //当st有文字时
          else {
            unit.textAbout.showText.text = utils.generateText(rawStoryUnit)
          }
          break
        case '#stm':
          //有特效的st
          unit.type = 'st'
          unit.textAbout.st = { middle: true }
          unit.textAbout.st.stArgs = [JSON.parse(scriptUnits[1]) as number[], scriptUnits[2] as StArgs[1], Number(scriptUnits[3])]
          unit.textAbout.showText.text = utils.generateText(rawStoryUnit, true)
          break
        case '#clearst':
          unit.textAbout.st = {}
          unit.textAbout.st.clearSt = true
          break
        case '#wait':
          unit.effect.otherEffect.push({ type: 'wait', args: Number(scriptUnits[1]) })
          break
        case '#fontsize':
          for (let i = 0; i < unit.textAbout.showText.text.length; ++i) {
            unit.textAbout.showText.text[i].effects.push({ name: 'fontsize', value: [scriptUnits[1]] })
          }
          break
        case '#all':
          if (utils.compareCaseInsensive(scriptUnits[1], 'hide')) {
            unit.hide = 'all'
          }
          break
        case '#hidemenu':
          unit.hide = 'menu'
          break
        case '#showmenu':
          unit.show = 'menu'
          break
        case '#zmc':
          let args: ZmcArgs
          if (scriptUnits.length === 5) {
            args = {
              type: scriptUnits[1] as 'move',
              position: scriptUnits[2].split(',').map(Number) as [number, number],
              size: Number(scriptUnits[3]),
              duration: Number(scriptUnits[4])
            }
          }
          else {
            args = {
              type: scriptUnits[1] as 'instant',
              position: scriptUnits[2].split(',').map(Number) as [number, number],
              size: Number(scriptUnits[3]),
            }
          }
          unit.effect.otherEffect.push({ type: 'zmc', args })
          break
        case '#bgshake':
          unit.effect.otherEffect.push({ type: 'bgshake' })
          break
        case '#video':
          //处理情况为 #video;Scenario/Main/22000_MV_Video;Scenario/Main/22000_MV_Sound
          unit.video = {
            videoPath: scriptUnits[1],
            soundPath: scriptUnits[2]
          }
          break
        default:
          if (utils.isCharacter(scriptType)) {
            let CharacterName = utils.getCharacterName(scriptUnits[1])
            let signal = false
            let characterInfo = playerStore.CharacterNameExcelTable.get(CharacterName)
            if (characterInfo) {
              //添加全息人物特效
              if (characterInfo.Shape === 'Signal') {
                signal = true
              }
              //添加人物spineUrl
              let spineUrl = getResourcesUrl('characterSpine', characterInfo.SpinePrefabName)
              let avatarUrl = getResourcesUrl('avatar', characterInfo?.SmallPortrait)
              let speaker = utils.getSpeaker(characterInfo)
              //人物有对话
              if (scriptUnits.length === 4) {
                unit.type = 'text'
                unit.textAbout.showText = {
                  text: utils.generateText(rawStoryUnit),
                  speaker,
                  avatarUrl
                }
              }
              unit.characters.push({
                CharacterName,
                position: Number(scriptType),
                face: scriptUnits[2],
                highlight: scriptUnits.length === 4,
                signal,
                spineUrl,
                effects: []
              })
            }
            else {
              throw new Error(`${CharacterName}在CharacterNameExcelTable中不存在`)
            }
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
              const emotionName = utils.getEmotionName(scriptUnits[2])
              if (!emotionName) {
                console.error(`查询不到${scriptUnits[2]}的emotionName中, 当前rawStoryUnit: `, rawStoryUnit)
              }
              else {
                const characterIndex = utils.getCharacterIndex(unit, Number(scriptType[1]), result, rawIndex)
                unit.characters[characterIndex].effects.push({
                  type: 'emotion',
                  effect: emotionName,
                  async: false
                })
              }
            }
            else if (utils.compareCaseInsensive(scriptUnits[1], 'fx')) {
              let characterIndex = utils.getCharacterIndex(unit, Number(scriptType[1]), result, rawIndex)
              unit.characters[characterIndex].effects.push({
                type: 'fx',
                effect: scriptUnits[2].replace('{', '').replace('}', ''),
                async: false
              })
            }
          }
          else if (utils.isOption(scriptType)) {
            unit.type = 'option'
            const rawText = String(getText(rawStoryUnit, playerStore.language)).split('\n')[optionIndex]
            const parseResult = /\[n?s(\d{0,2})?](.+)/.exec(rawText);
            if (!parseResult) {
              console.error("在处理选项文本时遇到严重错误");
              break;
            }
            const text = utils.splitStScriptAndParseTag(parseResult[2]);
            const selectGroup = Number(parseResult[1] || 0)
            if (unit.textAbout.options) {
              unit.textAbout.options.push({ SelectionGroup: selectGroup, text })
            }
            else {
              unit.textAbout.options = [{ SelectionGroup: selectGroup, text }]
            }
            optionIndex++;
          }
          break;
      }
    }
    //没人highlight则默认所有人highlight
    if (!unit.characters.some(character => character.highlight === true)) {
      unit.characters = unit.characters.map(character => { character.highlight = true; return character; })
    }
    result.push(unit)
  }

  return result
}
