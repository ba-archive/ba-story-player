import { Speaker, StoryRawUnit, StoryUnit, Text, TextEffect, TextEffectName } from "@/types/common"
import { usePlayerStore } from '@/stores/index'
import { Language } from "@/types/store"
import { PlayAudio, ShowTitleOption } from "@/types/events"
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
    return result;
  }
  return splitStScriptAndParseTag(rawText);
}

/**
 * 将ScriptKr文本结构解析成Text[]
 * @param rawText
 */
export function splitStScriptAndParseTag(rawText: string): Text[] {
  return splitStScript(rawText).map(it => parseCustomTag(it));
}

/**
 * 将嵌套tag结构分割
 *
 * [FF6666]……我々は望む、七つの[-][ruby=なげ][FF6666]嘆[-][/ruby][FF6666]きを。[-]
 *
 * [FF6666]……我々は望む、七つの[-],[ruby=なげ][FF6666]嘆[-][/ruby],[FF6666]きを。[-]
 * @param rawText 原始结构
 */
export function splitStScript(rawText: string): string[] {
  const res: string[] = [];
  let leftCount = 0;
  let closeTag = false;
  let tagCount = 0;
  let startIndex = 0;
  let tagActive = rawText[0] === "[";
  rawText.split("").forEach((ch, index) => {
    if (ch === "[") {
      leftCount++;
      if (!tagActive) {
        res.push(rawText.substring(startIndex, index));
        startIndex = index;
      }
    } else if (ch === "]") {
      leftCount--;
    } else if (ch === "/" || ch === "-") {
      closeTag = true;
    } else {
      return;
    }
    if (leftCount === 0) {
      tagCount += closeTag ? -1 : 1;
      closeTag = false;
      tagActive = true;
      if (tagCount === 0) {
        res.push(rawText.substring(startIndex, index + 1));
        startIndex = index + 1;
        tagActive = false;
      }
    }
  });
  // 处理尾巴情况
  if (startIndex !== rawText.length) {
    res.push(rawText.substring(startIndex, rawText.length + 1))
  }
  return res;
}

/**
 * 解析tag
 *
 * [ruby=なげ][FF6666]嘆[-][/ruby]
 *
 * [{ name: "ruby", values: ["なげ"] }, { name: "color", values: ["#FF6666"] }]
 * @param rawText 原初文本
 */
export function parseCustomTag(rawText: string): Text {
  let raw = rawText;
  const effects = Object.keys(ICustomTagParserMap).map(key => {
    const fn = Reflect.get(ICustomTagParserMap, key) as CustomTagParserFn;
    const res = fn(raw);
    if (res) {
      raw = res.remain;
    }
    return res?.effect;
  }).filter(it => it) as TextEffect[];
  return {
    content: raw,
    effects: effects
  }
}

type CustomTagParserFn = (rawText: string) => { effect: TextEffect, remain: string } | undefined;

type CustomTagParserMap = {
  [key in TextEffectName]: CustomTagParserFn;
}

const ICustomTagParserMap: CustomTagParserMap = {
  ruby(rawText) {
    const exec = /\[ruby=(.+?)](.+)\[\/ruby]/.exec(rawText);
    if (!exec) {
      return undefined;
    }
    const effect: TextEffect = {
      name: "ruby",
      value: [exec[1]]
    }
    return {
      effect: effect,
      remain: rawText.replace(`[ruby=${exec[1]}]`, "").replace("[/ruby]", ""),
    };
  },
  color(rawText) {
    const exec = /\[([A-Fa-f0-9]{6})](.+?)\[-]/.exec(rawText);
    if (!exec) {
      return undefined;
    }
    const effect: TextEffect = {
      name: "color",
      value: [`#${exec[1]}`]
    }
    return {
      effect: effect,
      remain: rawText.replace(`[${exec[1]}]`, "").replace("[-]", ""),
    };
  },
  fontsize() {
    return undefined;
  }
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
  return String(Reflect.get(rawStoryUnit, textProperty)) || String(rawStoryUnit.TextJp)
}

export function generateTitleInfo(rawStoryUnit: StoryRawUnit, language: Language): ShowTitleOption {
  const text = getText(rawStoryUnit, language)
  // 第114话;这是514个主标题
  // [这是514个主标题, 第114话]
  const spiltText = text.split(';').reverse();
  const rawTitle = spiltText[0];
  const title = parseRubyText(rawTitle);
  return {
    title: title,
    subtitle: spiltText[1]
  }
}

function parseRubyText(raw: string): Text[] {
  // etc.
  // [ruby=Hod]ホド[/ruby]……その[ruby=Path]パス[/ruby]は名誉を通じた完成。
  // [ruby=Hod]ホド ……その[ruby=Path]パス は名誉を通じた完成。
  const a = raw
    .split("[/ruby]")
    .filter(s => s);
  return a.map(it => {
    const rubyIndex = it.indexOf("[ruby=");
    // は名誉を通じた完成。
    if (rubyIndex === -1) {
      return {
        content: it,
        effects: []
      };
    }
    // Hod]ホド
    // ……その Path]パス
    const b = it
      .split("[ruby=")
      .filter(s => s);
    return b.map(item => {
      // ……その
      // パス Path
      const split = item.split("]").reverse();
      const content = split[0];
      const ruby = split[1];
      const effects: TextEffect[] = [];
      if (ruby) {
        effects.push({
          name: "ruby", value: [ruby]
        })
      }
      return {
        content: content,
        effects: effects
      }
    });
  }).flat(1);
}

export function getEmotionName(rawName: string): string | undefined {
  const name = xxhash.h32(rawName, 0).toNumber()
  return usePlayerStore().EmotionExcelTable.get(name)
}
