/**
 * 初始化人物层, 订阅player的剧情信息.
 */
import {
  CharacterEffectInstance, CharacterEffectPlayer,
  CharacterEffectWord,
  CharacterEmotionPlayer,
  CharacterLayer,
  EmotionWord, FXEffectWord, SignalEffectWord
} from "@/types/characterLayer";
import {ISkeletonData, Spine} from "pixi-spine";
import {ShowCharacter} from "@/types/events";
import {usePlayerStore} from "@/stores";
import {Character, CharacterEffectType, CharacterInstance} from "@/types/common";
import eventBus from "@/eventBus";

export function characterInit(): boolean {
  return CharacterLayerInstance.init();
}

const CharacterLayerInstance: CharacterLayer = {
  init() {
    document.addEventListener("resize", this.onWindowResize);
    eventBus.on("showCharacter", this.showCharacter);
    this.effectPlayerMap.set("emotion", CharacterEmotionPlayerInstance);
    CharacterEmotionPlayerInstance.init();
    return true;
  },
  dispose(): boolean {
    document.removeEventListener("resize", this.onWindowResize);
    eventBus.off("showCharacter", this.showCharacter);
    //TODO 销毁各种sprite,spine实体
    return true;
  },
  hasCharacterInstance(characterNumber: number): Boolean {
    const {currentCharacterMap} = usePlayerStore();
    return Boolean(currentCharacterMap.get(characterNumber));
  },
  hasCharacterInstanceCache(characterNumber: number): Boolean {
    return Boolean(this.characterSpineCache.get(characterNumber));
  },
  getCharacterInstance(characterNumber: number): CharacterInstance | undefined {
    const {currentCharacterMap} = usePlayerStore();
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
      }
    }
    return true;
  },
  createSpineFromSpineData(characterNumber: number, spineData: ISkeletonData): Spine {
    const instance = Object.seal(new Spine(spineData));
    const {currentCharacterMap} = usePlayerStore();
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
    const {app} = usePlayerStore()
    const spine = this.getCharacterSpineInstance(characterNumber);
    if (!spine) {
      return false;
    }
    if (!this.characterScale) {
      this.characterScale = window.innerHeight / (spine.height - window.innerHeight);
    }
    spine.scale.set(this.characterScale);
    spine.alpha = 0
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
  showCharacter(data: ShowCharacter): Boolean {
    if (!this.beforeProcessShowCharacterAction(data.characters)) {
      return false;
    }
    const mapList = this.buildCharacterEffectInstance(data);
    // 处理sync情况
    mapList.forEach(character => {
      character.effects.forEach((effect) => {
        const effectPlayer = this.effectPlayerMap.get(effect.type);
        if (!effectPlayer) {
          // TODO error handle
          return;
        }
        effectPlayer.processEffect(effect.effect as EmotionWord, character);
      })
    })
    return false;
  },
  //TODO 根据角色是否已经缩放(靠近老师)分类更新
  onWindowResize() {
    this.characterScale = undefined;
  },
  characterScale: undefined,
  characterSpineCache: new Map<number, CharacterInstance>(),
  effectPlayerMap: new Map<CharacterEffectType, CharacterEffectPlayer>(),
}

const CharacterEmotionPlayerInstance: CharacterEmotionPlayer = {
  init() {
    return;
  },
  getHandlerFunction(type: EmotionWord): (instance: CharacterEffectInstance) => void | undefined {
    return Reflect.get(this, type)
  },
  processEffect(type: EmotionWord, instance: CharacterEffectInstance) {
    const fn = this.getHandlerFunction(type);
    if (!fn) {
      return;
    }
    fn(instance);
  },
  Angry(): Promise<void> {
    return Promise.resolve(undefined);
  }, Chat(): Promise<void> {
    return Promise.resolve(undefined);
  }, Dot(): Promise<void> {
    return Promise.resolve(undefined);
  }, Exclaim(): Promise<void> {
    return Promise.resolve(undefined);
  }, Heart(): Promise<void> {
    return Promise.resolve(undefined);
  }, Note(): Promise<void> {
    return Promise.resolve(undefined);
  }, Question(): Promise<void> {
    return Promise.resolve(undefined);
  }, Respond(): Promise<void> {
    return Promise.resolve(undefined);
  }, Sad(): Promise<void> {
    return Promise.resolve(undefined);
  }, Shy(): Promise<void> {
    return Promise.resolve(undefined);
  }, Surprise(): Promise<void> {
    return Promise.resolve(undefined);
  }, Sweat(): Promise<void> {
    return Promise.resolve(undefined);
  }, Twinkle(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

