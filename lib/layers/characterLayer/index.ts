import eventBus from "@/eventBus";
import { usePlayerStore } from "@/stores";
import {
  CharacterEffectInstance, CharacterEffectPlayerInterface,
  CharacterEffectWord, CharacterLayer,
  EmotionWord, FXEffectWord, EffectsWord
} from "@/types/characterLayer";
import { Character, CharacterEffectType, CharacterInstance } from "@/types/common";
import { ShowCharacter } from "@/types/events";
import gsap, { Power0 } from "gsap";
import { PixiPlugin } from 'gsap/PixiPlugin';
import { ISkeletonData, Spine } from "pixi-spine";
import * as PIXI from 'pixi.js';
import CharacterEffectPlayerInstance, { calcSpineStagePosition, getStageSize, POS_INDEX_MAP } from "./actionPlayer";
import CharacterEmotionPlayerInstance from './emotionPlayer';
import characterFXPlayer from "./fxPlayer";
import { ColorOverlayFilter } from '@pixi/filter-color-overlay'
import { CRTFilter } from '@pixi/filter-crt'
import { AdjustmentFilter } from '@pixi/filter-adjustment'
import { MotionBlurFilter } from '@pixi/filter-motion-blur'

const AnimationIdleTrack = 0; // 光环动画track index
const AnimationFaceTrack = 1; // 差分切换
const AnimationEyeCloseTrack = 2; // TODO 眨眼动画
/**
 * 角色初始的pivot相对与长宽的比例, 当前值代表左上角
 */
export const Character_Initial_Pivot_Proportion = { x: -1 / 2, y: -1 / 2 }

PixiPlugin.registerPIXI(PIXI)
gsap.registerPlugin(PixiPlugin)

export function characterInit(): boolean {
  return CharacterLayerInstance.init();
}

function showCharacter(data: ShowCharacter) {
  CharacterLayerInstance.showCharacter(data);
}

export const CharacterLayerInstance: CharacterLayer = {
  init() {
    const { app } = usePlayerStore();
    // 将stage的sort设置为true,此时sprite将按照zIndex属性进行显示的排序,而是不按照children array的顺序
    app.stage.sortableChildren = true;
    document.addEventListener("resize", this.onWindowResize);
    eventBus.on("showCharacter", showCharacter);
    eventBus.on("hide", () => Reflect.apply(this.hideCharacter, this, []))
    this.effectPlayerMap.set("emotion", CharacterEmotionPlayerInstance);
    this.effectPlayerMap.set("action", CharacterEffectPlayerInstance);
    this.effectPlayerMap.set("fx", characterFXPlayer);
    this.effectPlayerMap.forEach((value) => {
      value.init();
    })
    return true;
  },
  dispose(): boolean {
    document.removeEventListener("resize", this.onWindowResize);
    eventBus.off("showCharacter", showCharacter);
    //TODO 销毁各种sprite,spine实体
    return true;
  },
  hasCharacterInstance(characterNumber: number): boolean {
    const { currentCharacterMap } = usePlayerStore();
    return Boolean(currentCharacterMap.get(characterNumber));
  },
  hasCharacterInstanceCache(characterNumber: number): boolean {
    return Boolean(this.characterSpineCache.get(characterNumber));
  },
  getCharacterInstance(characterNumber: number): CharacterInstance | undefined {
    const { currentCharacterMap } = usePlayerStore();
    return currentCharacterMap.get(characterNumber) ?? this.characterSpineCache.get(characterNumber);
  },
  getCharacterSpineInstance(characterNumber: number): Spine | undefined {
    return this.getCharacterInstance(characterNumber)?.instance ?? this.characterSpineCache.get(characterNumber)?.instance;
  },
  beforeProcessShowCharacterAction(characterMap: Character[]): boolean {
    const { characterSpineData } = usePlayerStore();
    for (const item of characterMap) {
      const characterName = item.CharacterName;
      if (!this.hasCharacterInstanceCache(characterName)) {
        const spineData = characterSpineData(characterName);
        if (!spineData) {
          return false;
        }
        this.createSpineFromSpineData(item, spineData);
      }
      this.putCharacterOnStage(item);
    }
    return true;
  },
  createSpineFromSpineData(character: Character, spineData: ISkeletonData): Spine {
    const instance = new Spine(spineData);
    instance.sortableChildren = true;
    const { currentCharacterMap } = usePlayerStore();
    const characterInstance: CharacterInstance = {
      CharacterName: character.CharacterName,
      position: character.position,
      instance,
      isOnStage() {
        return Boolean(instance.parent);
      },
      isShow() {
        return this.isOnStage() && instance.alpha != 0;
      },
      isHeightLight() {
        return this.isOnStage() && instance.alpha != 0;
      }
    }
    currentCharacterMap.set(character.CharacterName, characterInstance)
    this.characterSpineCache.set(character.CharacterName, characterInstance)
    return instance;
  },
  putCharacterOnStage(character: Character): boolean {
    const { app } = usePlayerStore()
    const instance = this.getCharacterInstance(character.CharacterName)!;
    instance.position = character.position;
    const spine = instance.instance
    if (!spine) {
      return false;
    }
    // spine如果是新建的, 初始化数据
    if (spine.position.y === 0) {
      // 供特效使用
      const { scale, y } = calcCharacterYAndScale(spine);
      // 设置缩放比列
      this.characterScale = scale;

      // 设置锚点到左上角
      spine.pivot = {
        x: Character_Initial_Pivot_Proportion.x * spine.width,
        y: Character_Initial_Pivot_Proportion.y * spine.height,
      };
      spine.scale.set(scale);
      // 设置spine在播放器的y轴坐标
      spine.position.set(spine.position.x, y);
    }
    // 不显示
    spine.alpha = 0
    //这样会导致基于visible的判断失效
    // spine.visible = false;
    app.stage.addChild(spine);
    return true;
  },
  buildCharacterEffectInstance(row: ShowCharacter): CharacterEffectInstance[] {
    return row.characters.map(item => {
      return {
        ...item,
        instance: this.getCharacterSpineInstance(item.CharacterName)!
      };
    })
  },
  hideCharacter() {
    const { currentCharacterMap } = usePlayerStore()
    currentCharacterMap.forEach(character => {
      character.instance.visible = false
      character.instance.scale.set(1)
      // 设置锚点到左上角
      character.instance.pivot = {
        x: Character_Initial_Pivot_Proportion.x * character.instance.width,
        y: Character_Initial_Pivot_Proportion.y * character.instance.height,
      };
      // 设置缩放比列
      character.instance.scale.set(this.characterScale);
    })
  },
  showCharacter(data: ShowCharacter): boolean {
    if (!this.beforeProcessShowCharacterAction(data.characters)) {
      return false;
    }
    const mapList = this.buildCharacterEffectInstance(data);
    //将data没有但显示着的角色取消highlight
    this.characterSpineCache.forEach(character => {
      if (character.instance.visible === true
        && !data.characters.some(value => value.CharacterName === character.CharacterName)) {
        let colorFilter = character.instance.filters![character.instance.filters!.length - 1] as ColorOverlayFilter
        colorFilter.alpha = 0.3
      }
    })

    // 当目前显示的角色没有新的表情动作且和现有角色的position冲突时隐藏
    const filterEmotion = data.characters
      .filter(it => it.effects.some(ef => ef.type === "emotion"));
    const filterNotEmotion = data.characters
      .filter(it => !it.effects.some(ef => ef.type === "emotion"))
      .map(it => it.CharacterName);
    const showName = filterEmotion.map(it => it.CharacterName);
    const showPosition = data.characters.map(it => it.position);
    const filterHide = [...this.characterSpineCache.values()]
      .filter(it => {
        return it.isOnStage() &&
          it.isShow() &&
          (
            !showName.includes(it.CharacterName) && showPosition.includes(it.position)
          )
      }
      )
    filterHide.forEach(chara => {
      chara.instance.visible = false;
      chara.instance.alpha = 0;
    });

    // 处理sync情况
    Promise
      .allSettled(
        mapList.map(character => this.showOneCharacter(character))
      )
      .then(this.characterDone)
      .catch(this.characterDone);
    return true;
  },
  showOneCharacter(data: CharacterEffectInstance): Promise<void> {
    // 表情
    data.instance.state.setAnimation(AnimationFaceTrack, data.face, true);
    data.instance.filters = []

    //处理全息状态
    if (data.signal) {
      let crtFilter = new CRTFilter({
        lineWidth: data.instance.width * 0.005,
        time: 0
      })
      let adjustmentFilter = new AdjustmentFilter({
        gamma: 1.3,
        red: 1,
        green: 1.1,
        blue: 1.15,
      })
      let motionBlurFilter = new MotionBlurFilter()
      data.instance.filters.push(
        crtFilter,
        adjustmentFilter,
        motionBlurFilter
      )
      loopCRtAnimation(crtFilter)
      let tl = gsap.timeline()
      tl.to(motionBlurFilter.velocity, { x: 5, duration: 0.1, repeat: 1, yoyo: true })
        .to(motionBlurFilter.velocity, { x: -5, duration: 0.1, repeat: 1, yoyo: true })
      tl.repeat(-1)
      tl.repeatDelay(3)
    }

    const colorFilter = new ColorOverlayFilter([0, 0, 0], 0)
    // TODO highlight
    //处理人物高光
    if (!data.highlight) {
      colorFilter.alpha = 0.3
    }
    if (data.effects.some(it => it.type === "action" && it.effect === "a")) {
      // 有淡入效果, 交给特效控制器
      //不要改变color filter的alpha, 会导致a最后的alpha出错
    } else {
      // 没有淡入效果, 直接显示
      const chara = data.instance;
      //当人物被移出画面时重设为初始位置
      if (chara.visible === false) {
        const { x } = calcSpineStagePosition(chara, data.position);
        chara.x = x;
        chara.zIndex = Reflect.get(POS_INDEX_MAP, data.position);
        chara.state.setAnimation(AnimationIdleTrack, 'Idle_01', true);
      }
      chara.alpha = 1
      chara.visible = true;
    }
    data.instance.filters.push(colorFilter);

    return new Promise<void>(async (resolve, reject) => {
      let count = 0;
      const effectListLength = data.effects.length;
      if (effectListLength === 0) {
        resolve()
      }
      const reason: any[] = [];
      const resolveHandler = () => {
        if (count !== effectListLength) {
          return;
        }
        if (reason.length !== 0) {
          reject(reason);
        } else {
          resolve();
        }
      }
      for (const index in data.effects) {
        const effect = data.effects[index];
        const effectPlayer = this.effectPlayerMap.get(effect.type);
        if (!effectPlayer) {
          // TODO error handle
          reject(`获取特效类型{${effect.type}}对应的播放器时失败`);
          return;
        }
        count++;
        if (effect.async) {
          await effectPlayer.processEffect(effect.effect as EffectsWord, data)
            .then(resolveHandler)
            .catch((err) => {
              reason.push(err);
              resolveHandler();
            })
        } else {
          setTimeout(() => {
            effectPlayer.processEffect(effect.effect as EffectsWord, data)
              .then(resolveHandler)
              .catch((err) => {
                reason.push(err);
                resolveHandler();
              })
          })
        }
      }
    })
  },
  characterDone() {
    eventBus.emit("characterDone");
  },
  //TODO 根据角色是否已经缩放(靠近老师)分类更新
  onWindowResize() {
    this.characterScale = undefined;
  },
  characterScale: undefined,
  characterSpineCache: new Map<number, CharacterInstance>(),
  effectPlayerMap: new Map<CharacterEffectType, CharacterEffectPlayerInterface<EmotionWord | CharacterEffectWord | FXEffectWord>>(),
}

function loopCRtAnimation(crtFilter: CRTFilter) {
  gsap.to(crtFilter, { time: "+=10", duration: 1, ease: Power0.easeNone }).then(() => loopCRtAnimation(crtFilter))
}

// 当播放器高度为PlayerHeight时角色的CharacterScale
const PlayerHeight = 550;
const CharacterScale = 0.29;
// spine在播放器之下的部分;
const spineHideRate = 0.4;
export function calcCharacterYAndScale(spine: Spine) {
  const { screenHeight } = getStageSize();
  const scale = screenHeight / PlayerHeight * CharacterScale;
  const spineHeight = spine.height / spine.scale.y * scale;
  return {
    scale,
    y: screenHeight - spineHeight * (1 - spineHideRate)
  }
}