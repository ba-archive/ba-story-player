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
import CharacterEffectPlayerInstance, { getStageSize } from "./actionPlayer";
import CharacterEmotionPlayerInstance from './emotionPlayer';
import characterFXPlayer from "./fxPlayer";
import { ColorOverlayFilter } from '@pixi/filter-color-overlay'
import { CRTFilter } from '@pixi/filter-crt'
import { AdjustmentFilter } from '@pixi/filter-adjustment'
import { MotionBlurFilter } from '@pixi/filter-motion-blur'

const AnimationIdleTrack = 0; // 光环动画track index
const AnimationFaceTrack = 1; // 差分切换
const AnimationEyeCloseTrack = 2; // TODO 眨眼动画

PixiPlugin.registerPIXI(PIXI)
gsap.registerPlugin(PixiPlugin)

export function characterInit(): boolean {
  return CharacterLayerInstance.init();
}

function showCharacter(data: ShowCharacter) {
  CharacterLayerInstance.showCharacter(data);
}

const CharacterLayerInstance: CharacterLayer = {
  init() {
    const { app } = usePlayerStore();
    // 将stage的sort设置为true,此时sprite将按照zIndex属性进行显示的排序,而是不按照children array的顺序
    app.stage.sortableChildren = true;
    document.addEventListener("resize", this.onWindowResize);
    eventBus.on("showCharacter", showCharacter);
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
        this.createSpineFromSpineData(characterName, spineData);
        this.putCharacterOnStage(characterName);
      }
    }
    return true;
  },
  createSpineFromSpineData(characterNumber: number, spineData: ISkeletonData): Spine {
    const instance = new Spine(spineData);
    const { currentCharacterMap } = usePlayerStore();
    const characterInstance: CharacterInstance = {
      CharacterName: characterNumber,
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
    currentCharacterMap.set(characterNumber, characterInstance)
    this.characterSpineCache.set(characterNumber, characterInstance)
    return instance;
  },
  putCharacterOnStage(characterNumber: number): boolean {
    const { app } = usePlayerStore()
    const spine = this.getCharacterSpineInstance(characterNumber);
    if (!spine) {
      return false;
    }
    if (!this.characterScale) {
      const { screenHeight } = getStageSize();
      this.characterScale = screenHeight / (spine.height - screenHeight);
    }
    // 设置锚点到左上角
    spine.pivot.set(-spine.width / 2, -spine.height / 2,);
    // 设置缩放比列
    spine.scale.set(this.characterScale);
    // 不显示
    spine.alpha = 0
    spine.visible = false;
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
  showCharacter(data: ShowCharacter): boolean {
    if (!this.beforeProcessShowCharacterAction(data.characters)) {
      return false;
    }
    const mapList = this.buildCharacterEffectInstance(data);
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
    //处理人物高光
    if (!data.highlight) {
      data.instance.filters.push(new ColorOverlayFilter([0, 0, 0], 0.3))
    }
    else {
      data.instance.filters.push(new ColorOverlayFilter([0, 0, 0], 0))
    }

    return new Promise<void>(async (resolve, reject) => {
      let count = 0;
      const effectListLength = data.effects.length;
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