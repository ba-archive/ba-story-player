/**
 * 初始化人物层, 订阅player的剧情信息.
 */
import {
  CharacterEffectInstance, BaseCharacterEffectPlayer, CharacterEffectPlayerInterface,
  CharacterEffectWord,
  CharacterEmotionPlayer,
  CharacterLayer,
  EmotionWord, FXEffectWord, SignalEffectWord, CharacterEffectPlayer, Position
} from "@/types/characterLayer";
import { ISkeletonData, Spine } from "pixi-spine";
import { ShowCharacter } from "@/types/events";
import { usePlayerStore } from "@/stores";
import { Character, CharacterEffect, CharacterEffectType, CharacterInstance } from "@/types/common";
import eventBus from "@/eventBus";
import gsap from "gsap";

const AnimationIdleTrack = 0; // 光环动画track index
const AnimationFaceTrack = 1; // 差分切换
const AnimationEyeCloseTrack = 2; // TODO 眨眼动画

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
          await effectPlayer.processEffect(effect.effect, data)
            .then(resolveHandler)
            .catch((err) => {
              reason.push(err);
              resolveHandler();
            })
        } else {
          setTimeout(() => {
            effectPlayer.processEffect(effect.effect, data)
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
  effectPlayerMap: new Map<CharacterEffectType, CharacterEffectPlayerInterface<EmotionWord | CharacterEffectWord | FXEffectWord | SignalEffectWord>>(),
}

const CharacterEffectPlayerInstance: CharacterEffectPlayer = {
  init() {
    return;
  },
  dispose(): void {
  },
  getHandlerFunction(type: CharacterEffectWord): (instance: CharacterEffectInstance) => Promise<void> | undefined {
    return Reflect.get(this, type)
  },
  processEffect(type: CharacterEffectWord, instance: CharacterEffectInstance): Promise<void> {
    const fn = this.getHandlerFunction(type);
    if (!fn) {
      return new Promise((resolve, reject) => {
        reject();
      });
    }
    return fn(instance) as Promise<void>;
  },
  a(instance: CharacterEffectInstance): Promise<void> {
    const characterInstance = instance.instance;
    const { x, y } = calcSpineStagePosition(characterInstance, instance.position);
    characterInstance.x = x;
    characterInstance.y = y;
    characterInstance.zIndex = Reflect.get(POS_INDEX_MAP, instance.position);
    characterInstance.state.setAnimation(AnimationIdleTrack, 'Idle_01', true);
    return new Promise((resolve) => {
      characterInstance.alpha = 0;
      characterInstance.visible = true;
      const timeLine = gsap.timeline();
      timeLine.to(characterInstance, {
        alpha: 1,
        duration: 1,
        onComplete: resolve
      });
    })
  }, al(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, ar(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, closeup(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, d(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, dl(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, dr(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, falldownR(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, greeting(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, hide(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, hophop(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, jump(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, m1(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, m2(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, m3(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, m4(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, m5(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, shake(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, stiff(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }
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
  Angry(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, Chat(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, Dot(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, Exclaim(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, Heart(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, Music(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, Question(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, Respond(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, Sad(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, Shy(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, Surprise(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, Sweat(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, Twinkle(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }, Upset(instance: CharacterEffectInstance): Promise<void> {
    return Promise.resolve(undefined);
  }
}

/**
 * 角色position对应的覆盖关系
 */
const POS_INDEX_MAP = {
  "1": 2,
  "2": 3,
  "3": 4,
  "4": 3,
  "5": 2,
};

/**
 * 根据position: 0~5 计算出角色的原点位置
 * @param character 要显示的角色
 * @param position 角色所在位置
 */
function calcSpineStagePosition(character: Spine, position: number): Position {
  const { screenWidth, screenHeight } = getStageSize();
  return {
    x: screenWidth / 5 * (position - 1) - (character.width * character.scale.x / 2),
    y: screenHeight * 0.3
  };
}

/**
 * 获取显示区域的大小
 * @return screenWidth 容器的宽 screenHeight 容器的高
 */
function getStageSize() {
  const { app } = usePlayerStore();
  const screen = app.screen;
  const screenWidth = screen.width;
  const screenHeight = screen.height;
  return {
    screenWidth,
    screenHeight
  };
}
