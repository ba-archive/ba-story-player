/**
 * 初始化人物层, 订阅player的剧情信息.
 */
import {
  CharacterEffectInstance, CharacterEffectPlayerInterface,
  CharacterEffectWord,
  CharacterEmotionPlayer,
  CharacterLayer,
  EmotionWord, FXEffectWord, SignalEffectWord, CharacterEffectPlayer, PositionOffset, EmotionOptions, Scale, GlobalEmotionOptions,
} from "@/types/characterLayer";
import { ISkeletonData, Spine } from "pixi-spine";
import { ShowCharacter } from "@/types/events";
import { usePlayerStore } from "@/stores";
import { Character, CharacterEffectType, CharacterInstance } from "@/types/common";
import eventBus from "@/eventBus";
import gsap from "gsap";
import { PixiPlugin } from 'gsap/PixiPlugin'
import { Container, DisplayObject, Sprite } from "pixi.js";
import * as PIXI from 'pixi.js'
import emotionOptions from "./emotionOptions";
import actionOptions from "./actionOptions";

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
  getHandlerFunction(type: CharacterEffectWord) {
    return Reflect.get(this, type)
  },
  processEffect(type: CharacterEffectWord, instance: CharacterEffectInstance): Promise<void> {
    const fn = this.getHandlerFunction(type);
    if (!fn) {
      return new Promise((resolve, reject) => {
        reject();
      });
    }
    return fn(instance, actionOptions[type], []) as Promise<void>;
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
  getHandlerFunction(type: EmotionWord) {
    return Reflect.get(this, type)
  },
  processEffect(type: EmotionWord, instance: CharacterEffectInstance): Promise<void> {
    const fn = this.getHandlerFunction(type);
    const { emotionResources, app } = usePlayerStore()
    let emotionImageSprites: Sprite[] = []
    for (let imageResource of emotionResources(type)) {
      let tempSprite = Sprite.from(imageResource)
      tempSprite.visible = false
      app.stage.addChild(tempSprite)
      emotionImageSprites.push(tempSprite)
    }
    if (!fn) {
      return new Promise((resolve, reject) => {
        reject();
      });
    }
    eventBus.emit('playEmotionAudio', type)
    return fn(instance, emotionOptions[type], emotionImageSprites) as Promise<void>;
  },
  Angry(instance: CharacterEffectInstance, options: EmotionOptions['Angry'], sprites: Sprite[]): Promise<void> {
    let angryImgUnit = sprites[0]
    const { app } = usePlayerStore()
    let scale = instance.instance.width * options.scale.value / angryImgUnit.width

    for (let i = 0; i < 3; ++i) {
      let uImgUnit = Sprite.from(angryImgUnit.texture)
      uImgUnit.x = instance.instance.x + instance.instance.width * options.startPositionOffset.value.x
      uImgUnit.y = instance.instance.y + instance.instance.width * options.startPositionOffset.value.y
      uImgUnit.scale.set(scale)
      uImgUnit.pivot.set(uImgUnit.width * options.pivotPosition.value.x, uImgUnit.width * options.pivotPosition.value.y)
      uImgUnit.angle += i * 120
      uImgUnit.zIndex = 10
      app.stage.addChild(uImgUnit)
      let tl = gsap.timeline()
      tl.to(uImgUnit.scale, { x: scale * options.animationScale.value.scale, duration: options.animationScale.value.duration })
        .to(uImgUnit.scale, { x: scale, duration: options.animationScale.value.duration })
        .to(uImgUnit.scale, { x: scale * options.endScale.value.scale, y: scale * options.endScale.value.scale, duration: options.endScale.value.duration })
        .then(() => { uImgUnit.destroy() })
    }

    return Promise.resolve(undefined);
  }, Chat(instance: CharacterEffectInstance, options: EmotionOptions['Chat'], sprites: Sprite[]): Promise<void> {
    let chatImage = sprites[0]
    let globalOptions = calcGlobalEmotionOptions(instance, chatImage, options)
    chatImage.scale.set(globalOptions.scale)
    chatImage.x = globalOptions.startPositionOffset.x
    chatImage.y = globalOptions.startPositionOffset.y
    chatImage.visible = true
    chatImage.pivot.x = chatImage.width * (1 + options.rotatePivot.value.x)
    chatImage.pivot.y = chatImage.height * (1 + options.rotatePivot.value.y)
    chatImage.zIndex = 10

    let tl = gsap.timeline()
    return new Promise((resolve, reject) => {
      tl.to(chatImage, { angle: options.rotateAngle.value, duration: options.rotateTime.value / 2 })
        .to(chatImage, { angle: 0, duration: options.rotateTime.value / 2 })
        .to(chatImage, { alpha: 0, duration: options.fadeOutDuration.value })
        .then(() => { chatImage.destroy(); resolve() })
        .catch(reason => reject(reason))
    })
  }, Dot(instance: CharacterEffectInstance, options: EmotionOptions['Dot'], sprites: Sprite[]): Promise<void> {
    let dialogImg = sprites[0]
    let globalOptions = setInitValue(instance, dialogImg, options)
    dialogImg.visible = true

    let dotContainer = new Container()
    let showTl = gsap.timeline()
    for (let i = 0; i < 3; ++i) {
      let dotImg = Sprite.from(sprites[1].texture)
      dotImg.alpha = 0
      dotImg.position = calcRelativePosition(dotImg, { x: options.dotPos.value[i], y: 0 })
      showTl.to(dotImg, { alpha: 1, duration: options.showAnimation.value.alpahaDuration, delay: options.showAnimation.value.showDelay })
      dotContainer.addChild(dotImg)
    }
    dialogImg.addChild(dotContainer)
    dotContainer.position = { x: options.dotContainerPos.value.x * dialogImg.width, y: options.dotContainerPos.value.y * dialogImg.height }

    return timelinePromise(
      showTl.to(dialogImg, { alpha: 0, duration: options.fadeOutDuration.value, delay: options.fadeOutPreDuration?.value })
      , [...sprites, ...dotContainer.children as Sprite[]])
  }, Exclaim(instance: CharacterEffectInstance, options: EmotionOptions['Exclaim'], sprites: Sprite[]): Promise<void> {
    let surpriseImg = sprites[0]
    let globalOptions = setInitValue(instance, surpriseImg, options)
    surpriseImg.visible = true

    let tl = gsap.timeline()
    let animationScale = globalOptions.scale * options.scaleAnimation.value.scale
    let recoverScale = globalOptions.scale * options.scaleAnimation.value.recoverScale
    return timelinePromise(
      tl.to(surpriseImg.scale, { x: animationScale, y: animationScale, duration: options.scaleAnimation.value.scaleDuration })
        .to(surpriseImg.scale, { x: recoverScale, y: recoverScale, duration: options.scaleAnimation.value.recoverDuration })
        .to(surpriseImg, { duration: options.fadeOutWaitTime.value })
        .to(surpriseImg, { alpha: 0, duration: options.fadeOutDuration.value })
      , [surpriseImg])
  }, Heart(instance: CharacterEffectInstance, options: EmotionOptions['Heart'], sprites: Sprite[]): Promise<void> {
    let dialogImg = sprites[0]
    let heartImg = sprites[1]

    dialogImg.x = instance.instance.x + instance.instance.width * options.startPositionOffset.value.x
    dialogImg.y = instance.instance.y + instance.instance.width * options.startPositionOffset.value.y
    let dialogScale = options.scale.value * instance.instance.width / dialogImg.width
    dialogImg.scale.set(dialogScale)
    heartImg.x = dialogImg.x + dialogImg.width * options.heartImg.value.position.x
    heartImg.y = dialogImg.y + dialogImg.width * options.heartImg.value.position.y
    let heartScale = options.heartImg.value.scale * dialogImg.width / heartImg.width
    heartImg.scale.set(heartScale)
    dialogImg.zIndex = 10
    heartImg.zIndex = 11

    dialogImg.visible = heartImg.visible = true

    let tl = gsap.timeline()
    let firstScale: Scale = {
      x: options.jumpAnimation.value.firstScale.x * heartScale,
      y: options.jumpAnimation.value.firstScale.y * heartScale
    }
    let secondScale: Scale = {
      x: options.jumpAnimation.value.secondScale.x * heartScale,
      y: options.jumpAnimation.value.secondScale.y * heartScale
    }
    tl.to(heartImg.scale, { x: firstScale.x, y: firstScale.y, duration: options.jumpAnimation.value.duration })
      .to(heartImg.scale, { x: heartScale, y: heartScale, duration: options.jumpAnimation.value.duration })
      .to(heartImg.scale, { x: secondScale.x, y: secondScale.y, duration: options.jumpAnimation.value.duration })
      .to(heartImg, { alpha: 0, duration: options.fadeOutDuration.value })
      .add('fadeOut', "<")
      .to(dialogImg, { alpha: 0, duration: options.fadeOutDuration.value }, 'fadeOut')
      .then(() => { dialogImg.destroy(); heartImg.destroy() })

    return Promise.resolve(undefined);
  }, Music(instance: CharacterEffectInstance, options: EmotionOptions['Music'], sprites: Sprite[]) {
    let note = sprites[0]
    let scale = options.scale.value * instance.instance.width / note.width
    note.scale.set(scale * 0.7)
    note.x = instance.instance.x + instance.instance.width * options.startPositionOffset.value.x
    note.y = instance.instance.y + instance.instance.width * options.startPositionOffset.value.y
    note.visible = true

    let tl = gsap.timeline()
    let x = note.x
    let y = note.y

    return new Promise((resolve, reject) => {
      tl.to(note.scale, { x: scale, y: scale, duration: 0.1 })
        .to(note, { x: x + note.width * options.animation.value.offset.x, duration: options.animation.value.duration })
        .add('start', '<')
        .to(note, { y: y + note.width * options.animation.value.offset.y, angle: options.rotateAngle.value, duration: options.animation.value.duration * 0.3 }, 'start')
        .to(note, { y: y, angle: 0, duration: options.animation.value.duration * 0.3 }, '>')
        .to(note, { y: y + note.width * options.animation.value.offset.y, angle: options.rotateAngle.value, duration: options.animation.value.duration * 0.4 }, '>')
        .to(note, { y: y, angle: 0, duration: options.animation.value.duration * 0.4 }, '>')
        .to(note, { alpha: 0, duration: options.fadeOutDuration.value }, '>')
        .then(() => {
          note.destroy();
          resolve()
        })
        .catch(reason => {
          reject(reason)
        })

    })
  }, Question(instance: CharacterEffectInstance, options: EmotionOptions['Question'], sprites: Sprite[]): Promise<void> {
    let questionImg = sprites[0]
    let globalOptions = setInitValue(instance, questionImg, options)
    questionImg.visible = true
    questionImg.anchor.set(options.scaleAnimation.value.anchor.x, options.scaleAnimation.value.anchor.y)

    let tl = gsap.timeline()
    let animationScale = globalOptions.scale * options.scaleAnimation.value.scale
    let recoverScale = globalOptions.scale * options.scaleAnimation.value.recoverScale
    return timelinePromise(
      tl.to(questionImg.scale, { x: animationScale, y: animationScale, duration: options.scaleAnimation.value.scaleDuration })
        .to(questionImg.scale, { x: recoverScale, y: recoverScale, duration: options.scaleAnimation.value.recoverDuration })
        .to(questionImg, { duration: options.fadeOutPreDuration!.value })
        .to(questionImg, { alpha: 0, duration: options.fadeOutDuration.value })
      , [questionImg])
  }, Respond(instance: CharacterEffectInstance, options: EmotionOptions['Respond'], sprites: Sprite[]): Promise<void> {
    let { app } = usePlayerStore()
    let globalOptions = setInitValue(instance, sprites[0], options)
    let imgContainer = new Container()
    for (let i = 0; i < 3; ++i) {
      let respondImg = Sprite.from(sprites[0].texture)
      respondImg.angle = options.perImgSetting.value[i].angle
      respondImg.anchor.set(
        options.perImgSetting.value[i].anchor.x,
        options.perImgSetting.value[i].anchor.y,
      )
      respondImg.scale.set(globalOptions.scale * options.perImgSetting.value[i].scale)
      imgContainer.addChild(respondImg)
    }
    app.stage.addChild(imgContainer)
    imgContainer.position = sprites[0].position
    imgContainer.zIndex = 10

    let tl = gsap.timeline()
    return timelinePromise(
      tl.to(imgContainer, { alpha: options.flashAnimation.value.alpha, duration: options.flashAnimation.value.duration })
        .to(imgContainer, { alpha: 1, duration: options.fadeOutDuration.value })
        .to(imgContainer, { duration: options.fadeOutPreDuration?.value })
        .to(imgContainer, { alpha: 0, duration: options.fadeOutDuration.value }),
      [...imgContainer.children as Sprite[], ...sprites]
    );
  }, Sad(instance: CharacterEffectInstance, options: EmotionOptions['Sad'], sprites: Sprite[]): Promise<void> {
    return Promise.resolve(undefined);
  }, Shy(instance: CharacterEffectInstance, options: EmotionOptions['Shy'], sprites: Sprite[]): Promise<void> {
    let dialogImg = sprites[0]
    let shyImg = sprites[1]
    let globalOptions = setInitValue(instance, dialogImg, options)
    dialogImg.scale.set(globalOptions.scale * options.scaleAnamation.value.startScale)
    dialogImg.anchor.set(options.scaleAnamation.value.anchor.x, options.scaleAnamation.value.anchor.y)
    let shyImgPos = calcRelativePosition(dialogImg, options.shyImg.value.position)
    shyImg.scale.set(globalOptions.scale * options.shyImg.value.scale * options.scaleAnamation.value.startScale)
    shyImg.position = shyImgPos
    dialogImg.zIndex = 10
    shyImg.zIndex = 11
    let shyImgAnchor = options.shyImg.value.anchor
    shyImg.anchor.set(shyImgAnchor.x, shyImgAnchor.y)
    shyImg.visible = dialogImg.visible = true

    let shakeTl = gsap.timeline({ paused: true })
    shakeTl.add('start')
      .to(shyImg, { angle: options.shakeAnimation.value.angleFrom, duration: options.shakeAnimation.value.duration / 2 })
      .to(shyImg, { angle: options.shakeAnimation.value.angleTo, duration: options.shakeAnimation.value.duration / 2 })
      .add('end')


    let tl = gsap.timeline()
    return timelinePromise(
      tl.to(shyImg.scale, { x: globalOptions.scale, y: globalOptions.scale, duration: options.scaleAnamation.value.duration })
        .to(dialogImg.scale, { x: globalOptions.scale, y: globalOptions.scale, duration: options.scaleAnamation.value.duration }, '<')
        .add(shakeTl.tweenFromTo('start', 'end', { repeat: options.shakeAnimation.value.times - 1 }))
        .to(shyImg, { alpha: 0, duration: options.fadeOutDuration.value })
        .to(dialogImg, { alpha: 0, duration: options.fadeOutDuration.value }, '<')
      , [shyImg, dialogImg]
    )
  }, Surprise(instance: CharacterEffectInstance, options: EmotionOptions['Surprise'], sprites: Sprite[]): Promise<void> {
    let exclaimImg = Sprite.from(sprites[0].texture)
    let surpriseImg = Sprite.from(sprites[1].texture)
    let globalOptions = setInitValue(instance, exclaimImg, options)
    let startScale = globalOptions.scale * options.scaleAnimation.value.startScale
    exclaimImg.scale.set(startScale)
    exclaimImg.anchor.set(options.scaleAnimation.value.anchor.x, options.scaleAnimation.value.anchor.y)
    surpriseImg.scale.set(startScale, startScale * options.scaleAnimation.value.questionImgYScale)
    surpriseImg.position = calcRelativePosition(exclaimImg, options.imgSetting.value.questionImgPos)
    surpriseImg.anchor.set(options.scaleAnimation.value.anchor.x, options.scaleAnimation.value.anchor.y)
    let container = new Container()
    //container设置为从app.stage的(0,0)开始方便使用工具类函数
    container.addChild(exclaimImg)
    container.addChild(surpriseImg)
    let { app } = usePlayerStore()
    app.stage.addChild(container)
    container.zIndex = 10

    let tl = gsap.timeline()
    let xOffset = options.jumpAnimation.value.xOffset * instance.instance.width
    let jumpYOffset = options.jumpAnimation.value.jumpYOffset * instance.instance.width
    return timelinePromise(
      tl.to(container, { x: `+=${xOffset}`, duration: options.jumpAnimation.value.duration })
        .to(container, { y: `-=${jumpYOffset}`, duration: options.jumpAnimation.value.duration / 2 }, 0)
        .to(container, { y: `+=${jumpYOffset}`, duration: options.jumpAnimation.value.duration / 2 }, '>')
        .add('jumpEnd')
        .to(exclaimImg.scale, { x: globalOptions.scale, y: globalOptions.scale, duration: options.scaleAnimation.value.duration }, 0)
        .to(surpriseImg.scale, { x: globalOptions.scale, y: globalOptions.scale, duration: options.scaleAnimation.value.duration }, 0)
        .to(container, { duration: options.fadeOutPreDuration?.value }, 'jumpEnd')
        .to(container, { alpha: 0, duration: options.fadeOutDuration.value }, '>')
      , [...sprites, surpriseImg, exclaimImg]
    )
  }, Sweat(instance: CharacterEffectInstance, options: EmotionOptions['Sweat'], sprites: Sprite[]): Promise<void> {
    let { app } = usePlayerStore()
    let dropImg = sprites[0]
    let smallDropImg = sprites[1]

    //设置初始位置和大小
    let globalOptions = calcGlobalEmotionOptions(instance, dropImg, options)
    dropImg.scale.set(globalOptions.scale)
    smallDropImg.scale.set(globalOptions.scale)
    dropImg.x = globalOptions.startPositionOffset.x
    dropImg.y = globalOptions.startPositionOffset.y
    let smallPosition = calcRelativePosition(dropImg, options.smallImg.value.offset)
    smallDropImg.x = smallPosition.x
    smallDropImg.y = smallPosition.y
    dropImg.zIndex = 10
    smallDropImg.zIndex = 10
    smallDropImg.visible = dropImg.visible = true

    let tl = gsap.timeline()
    return new Promise((resolve, reject) => {
      tl.to(dropImg, { y: dropImg.y - dropImg.width * options.dropAnimation.value.yOffset, duration: options.dropAnimation.value.duration })
        .to(smallDropImg, {
          y: smallDropImg.y - options.smallImg.value.dropAnimationOffset * smallDropImg.width,
          duration: options.dropAnimation.value.duration
        }, '<')
        .then(() => { dropImg.destroy(); smallDropImg.destroy(); resolve() })
        .catch(reason => reject(reason))
    })
  }, Twinkle(instance: CharacterEffectInstance, options: EmotionOptions['Twinkle'], sprites: Sprite[]): Promise<void> {
    let container = new Container()
    setInitPos(instance, container, options)
    let scale = getRelativeScale(instance, sprites[0], options)
    let starImgs: Sprite[] = []
    let starImgScales: number[] = []
    for (let i = 0; i < 3; ++i) {
      starImgScales.push(scale * options.starImgs.value.scale[i])
    }
    for (let i = 0; i < 3; ++i) {
      let starImg = Sprite.from(sprites[0].texture)
      starImgs.push(starImg)
      starImg.anchor.set(0.5)
      starImg.scale.set(starImgScales[i])
      starImg.position = calcRelativePosition(starImgs[0], options.starImgs.value.pos[i])
      container.addChild(starImg)
    }
    let { app } = usePlayerStore()
    container.alpha = 0
    app.stage.addChild(container)

    let flashTlMaster = gsap.timeline({ paused: true })
    for (let i = 0; i < 3; ++i) {
      let flashTl = gsap.timeline()
      flashTl.to(starImgs[i],
        {
          pixi: { scale: options.flashAnimation.value.scales[i] * starImgScales[i] },
          duration: options.flashAnimation.value.duration[i] / 2,
          repeat: -1,
          yoyo: true,
        }
        , 0)
      flashTlMaster.add(flashTl, 0)
    }

    let tl = gsap.timeline()
    return timelinePromise(
      tl.to(container, { alpha: 1, duration: options.fadeInDuration.value })
        .add(flashTlMaster.tweenFromTo(0, options.flashAnimation.value.totalDuration))
        .to(container, { alpha: 0, duration: options.fadeOutDuration.value }, `>-=${options.fadeOutPreDuration?.value}`)
      , [...starImgs, ...sprites]
    )
  }, Upset(instance: CharacterEffectInstance, options: EmotionOptions['Upset'], sprites: Sprite[]): Promise<void> {
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
function calcSpineStagePosition(character: Spine, position: number): PositionOffset {
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


function calcGlobalEmotionOptions(instance: CharacterEffectInstance, standardImg: Sprite, options: EmotionOptions[EmotionWord]) {
  return {
    startPositionOffset: {
      x: instance.instance.x + instance.instance.width * options.startPositionOffset.value.x,
      y: instance.instance.y + instance.instance.width * options.startPositionOffset.value.y
    },
    scale: options.scale.value * instance.instance.width / standardImg.width
  }
}

/**
 * 根据相对位置计算相对位置
 * @param standard 相对位置基于的图片
 * @param relativeValue 相对值
 * @returns 绝对位置
 */
function calcRelativePosition(standard: Sprite, relativeValue: PositionOffset) {
  return {
    x: standard.x + standard.width * relativeValue.x,
    y: standard.y + standard.width * relativeValue.y
  }
}


/**
 * 设置基准图片的初始位置, 缩放, zIndex
 * @param instance 
 * @param standardImg 
 * @param options 
 * @returns 位置和缩放比例的绝对值
 */
function setInitValue(instance: CharacterEffectInstance, standardImg: Sprite, options: EmotionOptions[EmotionWord]) {
  let globalOptions = {
    startPositionOffset: {
      x: instance.instance.x + instance.instance.width * options.startPositionOffset.value.x,
      y: instance.instance.y + instance.instance.width * options.startPositionOffset.value.y
    },
    scale: options.scale.value * instance.instance.width / standardImg.width
  }
  standardImg.scale.set(globalOptions.scale)
  standardImg.x = globalOptions.startPositionOffset.x
  standardImg.y = globalOptions.startPositionOffset.y
  standardImg.zIndex = 10

  return globalOptions
}

/**
 * 设置初始位置, 并同时会将z-index设为10放置角色覆盖图片
 * @param instance 角色实例
 * @param object 设置位置的pixi对象
 * @param options 当前情绪动画的参数
 * @returns 位置绝对值
 */
function setInitPos(instance: CharacterEffectInstance, object: DisplayObject, options: EmotionOptions[EmotionWord]) {
  let pos = {
    x: instance.instance.x + instance.instance.width * options.startPositionOffset.value.x,
    y: instance.instance.y + instance.instance.width * options.startPositionOffset.value.y
  }
  object.x = pos.x
  object.y = pos.y
  object.zIndex = 10

  return pos
}

/**
 * 计算图片基于角色大小的缩放比例 
 * @param instance 角色实例 
 * @param img 缩放的图片
 * @param options 情绪动画设置参数
 * @returns 缩放比例绝对值
 */
function getRelativeScale(instance: CharacterEffectInstance, img: Sprite, options: EmotionOptions[EmotionWord]) {
  return options.scale.value * instance.instance.width / img.width
}

/**
 * timeline执行后生成一个promise并自动回收sprite 
 * @param timeLine 执行的timeline
 * @param destroyImgs 要回收的sprite对象数组
 * @returns 生成的promise
 */
function timelinePromise(timeLine: gsap.core.Timeline, destroyImgs: Sprite[]) {
  return new Promise<void>((resolve, reject) => {
    timeLine.then(() => {
      resolve()
      for (let img of destroyImgs) {
        img.destroy()
      }
    })
      .catch(reason => reject(reason))
  })
} 