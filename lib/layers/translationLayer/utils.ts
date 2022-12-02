import { StoryRawUnit, StoryUnit ,Text, TextEffect} from "@/types/common"

/**
 * 当只需要一行语句时填充unit, Text数组只有一个成员的情况
 */
export function setOneText(unit: StoryUnit, i: StoryRawUnit,userName:string) {
  unit.text.TextJp = [{ content: String(i.TextJp).replace('[USERNAME]', userName).replace('#n', '\n') }]
  if (i.TextCn) {
    unit.text.TextCn = [{ content: String(i.TextCn).replace('[USERNAME]', userName).replace('#n', '\n') }]
  }

  return unit
}
/**
 * 判断是否是角色
 * @param s 
 */
export function isDigit(s: string) {
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
 * 
 * 选项字符串示例: '[s1] \"我正想着稍微散散步来着。\"\n[s2] \"优香在做什么？\"'
 * , 除此之外还有[ns], [s]等情况
 */
export function isOption(s: string) {
  return /\[ns\]|\[s\d?\]/.test(s)
}

/**
 * 根据原始文字生成Text数组
 * 
 * 原始文字示例: "― （いや[wa:200]いや、[wa:900]いくら[wa:300]そういう[wa:300]状況だからって"
 */
export function generateText(s: string): Text[] {
  let strs = s.split('[')
  let result: Text[] = []
  for (let i of strs) {
    let slices = i.split(']')
    if (slices.length === 1) {
      result.push({ content: slices[0] })
    }
    else {
      let effectSlice = slices[0].split(':')
      if (effectSlice[0] === 'wa') {
        result.push({ content: slices[1], waitTime: Number(effectSlice[1]) })
      }
    }
  }

  return result
}

/**
 * 生成Text和TextEffect
 */
export function generateTextEffect(s: string) {
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
export function compareCaseInsensive(s1: string, s2: string) {
  return s1.localeCompare(s2, undefined, { sensitivity: 'accent' }) === 0;
}

/**
 * 获取角色在unit的characters里的index, 当不存在时会自动往unit的character里加入该角色
 */
export function getCharacterIndex(unit:StoryUnit,initPosition:number,result:StoryUnit[],rawIndex:number) {
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