/**
 * 初始化人物层, 订阅player的剧情信息.
 */
import {CharacterEffectMap, CharacterLayer} from "@/types/characterLayer";
import {ISkeletonData, Spine} from "pixi-spine";
import {ShowCharacter} from "@/types/events";
import {usePlayerStore} from "@/stores";
import {CharacterInstance} from "@/types/common";
import eventBus from "@/eventBus";

export function characterInit(): boolean {
  return CharacterLayerInstance.init();
}

const CharacterLayerInstance: CharacterLayer = {
  init() {
    document.addEventListener("resize", this.onWindowResize);
    eventBus.on("showCharacter", this.showCharacter);
    this.createEffectMap();
    return true;
  },
  dispose(): boolean {
    eventBus.off("showCharacter", this.showCharacter);
    //TODO 销毁各种sprite,spine实体
    return true;
  },
  hasCharacterInstance(characterNumber: number): Boolean {
    const { currentCharacterMap } = usePlayerStore();
    return Boolean(currentCharacterMap.get(characterNumber));
  },
  hasCharacterInstanceCache(characterNumber: number): Boolean {
    return Boolean(this.characterSpineCache.get(characterNumber));
  },
  getCharacterInstance(characterNumber: number): CharacterInstance | undefined {
    const { currentCharacterMap } = usePlayerStore();
    return currentCharacterMap.get(characterNumber) ?? this.characterSpineCache.get(characterNumber);
  },
  getCharacterSpineInstance(characterNumber: number): Spine | undefined {
    return this.getCharacterInstance(characterNumber)?.instance ?? this.characterSpineCache.get(characterNumber)?.instance;
  },
  beforeProcessShowCharacterAction(characterMap: CharacterEffectMap[]): boolean {
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
      this.characterScale = window.innerHeight / (spine.height - window.innerHeight);
    }
    spine.scale.set(this.characterScale);
    spine.alpha = 0
    app.stage.addChild(spine);
    return true;
  },
  showCharacter(data: ShowCharacter): Boolean {
    const mapList = buildCharacterEffectMapping(data);
    if (!this.beforeProcessShowCharacterAction(mapList)) {
      return false;
    }
    mapList.forEach(character => {
      const characterInstance = this.getCharacterInstance(character.CharacterName)!

    })
    return false;
  },
  //TODO 根据角色是否已经缩放(靠近老师)分类更新
  onWindowResize() {
    this.characterScale = undefined;
  },
  //TODO fill mapping function
  createEffectMap() {
    this.actionMap.set("onWindowResize", this.onWindowResize)
  },
  characterScale: undefined,
  characterSpineCache: new Map<number, CharacterInstance>(),
  actionMap: new Map<string, Function>()
}

/**
 * 构建ShowCharacter到CharacterEffectMap的映射
 * @param row 原始播放器数据
 */
function buildCharacterEffectMapping(row: ShowCharacter): CharacterEffectMap[] {
  return row.characters.map(item => {
    return {
      ...item,
      effect: row.characterEffects.filter(effect => effect.target === item.position)
    };
  })
}
