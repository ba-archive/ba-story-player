import type {ISkeletonData, Spine} from 'pixi-spine'
import {ShowCharacter} from "@/types/events";
import {Character, CharacterEffect, CharacterInstance} from "@/types/common";

export interface CharacterLayer {
  init(): boolean;
  hasCharacterInstance(characterNumber: number): Boolean;
  getCharacterInstance(characterNumber: number): CharacterInstance | undefined;
  // 检查player store中是否存在已创建的角色名的spine对象
  hasCharacterSpineInstance(characterNumber: number): Boolean;
  getCharacterSpineInstance(characterNumber: number): Spine | undefined;
  showCharacter(data: ShowCharacter): Boolean;
  createSpineFromSpineData(characterNumber: number, spineData: ISkeletonData): Spine;
  beforeProcessShowCharacterAction(characterMap: CharacterEffectMap[]): boolean;
  putCharacterOnStage(characterNumber: number): boolean;
  onWindowResize(): void;
  characterScale: number | undefined;
}

export interface CharacterEffectMap extends Character {
  effect: CharacterEffect[];
}
