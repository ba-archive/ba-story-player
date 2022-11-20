import type {ISkeletonData, Spine} from 'pixi-spine'
import {ShowCharacter} from "@/types/events";
import {Character, CharacterEffect, CharacterInstance} from "@/types/common";

export interface CharacterLayer {
  init(): boolean;
  hasCharacterInstance(characterNumber: number): Boolean;
  hasCharacterInstanceCache(characterNumber: number): Boolean;
  hasAnyCharacterInstance(characterNumber: number): Boolean;
  getCharacterInstance(characterNumber: number): CharacterInstance | undefined;
  getCharacterSpineInstance(characterNumber: number): Spine | undefined;
  showCharacter(data: ShowCharacter): Boolean;
  createSpineFromSpineData(characterNumber: number, spineData: ISkeletonData): Spine;
  beforeProcessShowCharacterAction(characterMap: CharacterEffectMap[]): boolean;
  putCharacterOnStage(characterNumber: number): boolean;
  onWindowResize(): void;
  characterScale: number | undefined;
  characterSpineCache: Map<number, CharacterInstance>
}

export interface CharacterEffectMap extends Character {
  effect: CharacterEffect[];
}
