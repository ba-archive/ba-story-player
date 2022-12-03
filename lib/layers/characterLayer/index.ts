/**
 * 初始化人物层, 订阅player的剧情信息.
 */
import {
  CharacterEffectInstance, CharacterEffectPlayer, CharacterEffectPlayerBase,
  CharacterEffectWord,
  CharacterEmotionPlayer,
  CharacterLayer,
  EmotionWord, FXEffectWord, SignalEffectWord
} from "@/types/characterLayer";
import {ISkeletonData, Spine} from "pixi-spine";
import {ShowCharacter} from "@/types/events";
import {usePlayerStore} from "@/stores";
import {Character, CharacterEffect, CharacterEffectType, CharacterInstance} from "@/types/common";
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
  hasCharacterInstance(characterNumber: number): boolean {
    const {currentCharacterMap} = usePlayerStore();
    return Boolean(currentCharacterMap.get(characterNumber));
  },
  hasCharacterInstanceCache(characterNumber: number): boolean {
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
    let count = 0;
    const effectListLength = data.effects.length;
    const reason: any[] = [];
    const resolveHandler = (
      resolve: (value: (void | PromiseLike<void>)) => void,
      reject: (reason?: any) => void
    ) => {
      if (count !== effectListLength) {
        return;
      }
      if (reason.length !== 0) {
        reject(reason);
      } else {
        resolve();
      }
    }
    return new Promise<void>(async (resolve, reject) => {
      for (const index in data.effects) {
        const effect = data.effects[index];
        const effectPlayer = this.effectPlayerMap.get(effect.type);
        if (!effectPlayer) {
          // TODO error handle
          reject(`获取特效类型{${effect.type}}时失败`);
          return;
        }
        count++;
        if (effect.async) {
          await effectPlayer.processEffect(effect.effect, data)
            .then(() => {
              resolveHandler(resolve, reject);
            })
            .catch((err) => {
              reason.push(err);
            })
        } else {
          setTimeout(() => {
            effectPlayer.processEffect(effect.effect, data)
              .then(() => {
                resolveHandler(resolve, reject);
              })
              .catch((err) => {
                reason.push(err);
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
  effectPlayerMap: new Map<CharacterEffectType, CharacterEffectPlayerBase<EmotionWord | CharacterEffectWord | FXEffectWord | SignalEffectWord>>(),
}

const CharacterEmotionPlayerInstance: CharacterEmotionPlayer = {
  init() {
    return;
  },
  dispose(): void {
  },
  getHandlerFunction(type: EmotionWord): (instance: CharacterEffectInstance) => Promise<void> | undefined {
    return Reflect.get(this, type)
  },
  processEffect(type: EmotionWord, instance: CharacterEffectInstance): Promise<void> {
    const fn = this.getHandlerFunction(type);
    if (!fn) {
      return new Promise((resolve, reject) => {
        reject();
      });
    }
    return fn(instance) as Promise<void>;
  },
  Angry(): Promise<void> {
    return Promise.resolve();
  }, Chat(): Promise<void> {
    return Promise.resolve();
  }, Dot(): Promise<void> {
    return Promise.resolve();
  }, Exclaim(): Promise<void> {
    return Promise.resolve();
  }, Heart(): Promise<void> {
    return Promise.resolve();
  }, Note(): Promise<void> {
    return Promise.resolve();
  }, Question(): Promise<void> {
    return Promise.resolve();
  }, Respond(): Promise<void> {
    return Promise.resolve();
  }, Sad(): Promise<void> {
    return Promise.resolve();
  }, Shy(): Promise<void> {
    return Promise.resolve();
  }, Surprise(): Promise<void> {
    return Promise.resolve();
  }, Sweat(): Promise<void> {
    return Promise.resolve();
  }, Twinkle(): Promise<void> {
    return Promise.resolve();
  }
}

