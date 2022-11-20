/**
 * 初始化人物层, 订阅player的剧情信息.
 */
import {CharacterEffectMap, CharacterLayer} from "@/types/characterLayer";
import {ISkeletonData, Spine} from "pixi-spine";
import {ShowCharacter} from "@/types/events";
import {usePlayerStore} from "@/stores";
import {CharacterInstance} from "@/types/common";

export function characterInit(): boolean {
  return CharacterLayerInstance.init();
}

const CharacterLayerInstance: CharacterLayer = {
  init() {
    document.addEventListener("resize", this.onWindowResize);
    return true;
  },
  hasCharacterInstance(characterNumber: number): Boolean {
    const { currentCharacterMap } = usePlayerStore();
    return Boolean(currentCharacterMap.get(characterNumber));
  },
  getCharacterInstance(characterNumber: number): CharacterInstance | undefined {
    const { currentCharacterMap } = usePlayerStore();
    return currentCharacterMap.get(characterNumber);
  },
  hasCharacterSpineInstance(characterNumber: number): Boolean {
    return this.hasCharacterInstance(characterNumber);
  },
  getCharacterSpineInstance(characterNumber: number): Spine | undefined {
    return this.getCharacterInstance(characterNumber)?.instance;
  },
  beforeProcessShowCharacterAction(characterMap: CharacterEffectMap[]): boolean {
    const { characterSpineData } = usePlayerStore();
    for (const item of characterMap) {
      const characterName = item.CharacterName;
      if (!this.hasCharacterInstance(characterName)) {
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
    currentCharacterMap.set(characterNumber, {
      CharacterName: characterNumber,
      instance,
      isOnStage() {
        return Boolean(instance.parent);
      },
      isShow() {
        return this.isOnStage() && instance.alpha != 0;
      }
    })
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
    app.stage.addChild(spine);
    return true;
  },
  showCharacter(data: ShowCharacter): Boolean {
    const mapList = buildCharacterEffectMapping(data);
    if (!this.beforeProcessShowCharacterAction(mapList)) {
      return false;
    }
    const { currentCharacterMap, characterSpineData } = usePlayerStore();
    mapList.forEach(character => {
      characterSpineData(character.CharacterName)
    })
    return false;
  },
  onWindowResize() {
    this.characterScale = undefined;
  },
  characterScale: undefined
}

function buildCharacterEffectMapping(row: ShowCharacter): CharacterEffectMap[] {
  return row.characters.map(item => {
    return {
      ...item,
      effect: row.characterEffects.filter(effect => effect.target === item.position)
    };
  })
}
