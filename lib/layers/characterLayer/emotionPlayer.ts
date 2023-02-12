import eventBus from "@/eventBus";
import { usePlayerStore } from "@/stores";
import {
  CharacterEffectInstance, CharacterEmotionPlayer, EmotionOptions, EmotionWord, PositionOffset, Scale
} from "@/types/characterLayer";
import gsap from 'gsap';
import { Container, DisplayObject, Sprite } from "pixi.js";
import emotionOptions, {emotionDescriptions} from "./options/emotionOptions";
import {Spine} from "pixi-spine";


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
    let emotionImgs = emotionResources(type)
    if (!emotionImgs) {
      return Promise.reject(`${type}没有对于的图像资源`)
    }
    for (let imageResource of emotionImgs) {
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
    const scale = instance.instance.width * options.scale / angryImgUnit.width / instance.instance.scale.x;
    const container = new Container();
    const { offsetX, offsetY } = emotionContainerOffset(instance.instance, options);
    container.x = offsetX;
    container.y = offsetY;
    instance.instance.addChild(container);
    for (let i = 0; i < 3; ++i) {
      let uImgUnit = Sprite.from(angryImgUnit.texture)
      uImgUnit.scale.set(scale)
      uImgUnit.pivot.set(uImgUnit.width * options.pivotPosition.x, uImgUnit.width * options.pivotPosition.y)
      uImgUnit.angle += i * 120
      uImgUnit.zIndex = 10
      container.addChild(uImgUnit)
      let tl = gsap.timeline()
      tl.to(uImgUnit.scale, { x: scale * options.animationScale.scale, duration: options.animationScale.duration })
        .to(uImgUnit.scale, { x: scale, duration: options.animationScale.duration })
        .to(uImgUnit.scale, { x: scale * options.endScale.scale, y: scale * options.endScale.scale, duration: options.endScale.duration })
        .then(() => { uImgUnit.destroy() })
    }

    return Promise.resolve(undefined);
  }, Chat(instance: CharacterEffectInstance, options: EmotionOptions['Chat'], sprites: Sprite[]): Promise<void> {
    let chatImage = sprites[0]

    const { offsetX, offsetY } = emotionContainerOffset(instance.instance, options);

    chatImage.scale.set(options.scale * instance.instance.width / chatImage.width / instance.instance.scale.x)
    chatImage.x = offsetX + instance.instance.width * options.startPositionOffset.x
    chatImage.y = offsetY + instance.instance.width * options.startPositionOffset.y
    chatImage.visible = true
    chatImage.pivot.x = chatImage.width * (1 + options.rotatePivot.x)
    chatImage.pivot.y = chatImage.height * (1 + options.rotatePivot.y)
    chatImage.zIndex = 10
    instance.instance.addChild(chatImage);

    let tl = gsap.timeline()
    return new Promise((resolve, reject) => {
      tl.to(chatImage, { angle: options.rotateAngle, duration: options.rotateTime / 2 })
        .to(chatImage, { angle: 0, duration: options.rotateTime / 2 })
        .to(chatImage, { alpha: 0, duration: options.fadeOutDuration })
        .then(() => { chatImage.destroy(); resolve() })
        .catch(reason => reject(reason))
    })
  }, Dot(instance: CharacterEffectInstance, options: EmotionOptions['Dot'], sprites: Sprite[]): Promise<void> {
    let dialogImg = Sprite.from(sprites[0].texture);

    const { offsetX, offsetY } = emotionContainerOffset(instance.instance, options);
    dialogImg.position.set(offsetX, offsetY);
    let dotContainer = new Container()
    let showTl = gsap.timeline()
    for (let i = 0; i < 3; ++i) {
      let dotImg = Sprite.from(sprites[1].texture)
      dotImg.alpha = 0
      dotImg.position = calcRelativePosition(dotImg, { x: options.dotPos[i], y: 0 })
      showTl.to(dotImg, { alpha: 1, duration: options.showAnimation.alpahaDuration, delay: options.showAnimation.showDelay })
      dotContainer.addChild(dotImg)
    }
    dialogImg.addChild(dotContainer)
    dotContainer.position = { x: options.dotContainerPos.x * dialogImg.width, y: options.dotContainerPos.y * dialogImg.height }
    instance.instance.addChild(dialogImg);
    return timelinePromise(
      showTl.to(dialogImg, { alpha: 0, duration: options.fadeOutDuration, delay: options.fadeOutPreDuration })
      , [...sprites, ...dotContainer.children as Sprite[]])
  }, Exclaim(instance: CharacterEffectInstance, options, sprites: Sprite[]): Promise<void> {
    let surpriseImg = sprites[0]

    const { offsetX, offsetY } = emotionContainerOffset(instance.instance, options);
    surpriseImg.position.set(
      offsetX + instance.instance.width * options.startPositionOffset.x,
      offsetY + instance.instance.width * options.startPositionOffset.y
    )
    const scale = options.scale * instance.instance.width / surpriseImg.width / instance.instance.scale.x;
    surpriseImg.visible = true
    instance.instance.addChild(surpriseImg);

    let tl = gsap.timeline()
    let animationScale = scale * options.scaleAnimation.scale
    let recoverScale = scale * options.scaleAnimation.recoverScale
    return timelinePromise(
      tl.to(surpriseImg.scale, { x: animationScale, y: animationScale, duration: options.scaleAnimation.scaleDuration })
        .to(surpriseImg.scale, { x: recoverScale, y: recoverScale, duration: options.scaleAnimation.recoverDuration })
        .to(surpriseImg, { duration: options.fadeOutWaitTime })
        .to(surpriseImg, { alpha: 0, duration: options.fadeOutDuration })
      , [surpriseImg])
  }, Heart(instance: CharacterEffectInstance, options: EmotionOptions['Heart'], sprites: Sprite[]): Promise<void> {
    const dialogImg = sprites[0];
    const heartImg = sprites[1];
    const container = new Container();
    const dialogScale = options.scale * instance.instance.width / dialogImg.width / instance.instance.scale.x;
    dialogImg.scale.set(dialogScale)
    heartImg.x = dialogImg.width * options.heartImg.position.x
    heartImg.y = dialogImg.width * options.heartImg.position.y
    const heartScale = options.heartImg.scale * dialogImg.width / heartImg.width;
    heartImg.scale.set(heartScale)
    dialogImg.zIndex = 10
    heartImg.zIndex = 11
    dialogImg.visible = heartImg.visible = true
    container.addChild(dialogImg);
    container.addChild(heartImg);
    const { offsetX, offsetY } = emotionContainerOffset(instance.instance, options);
    container.position.set(offsetX, offsetY);
    instance.instance.addChild(container);

    let tl = gsap.timeline()
    let firstScale: Scale = {
      x: options.jumpAnimation.firstScale.x * heartScale,
      y: options.jumpAnimation.firstScale.y * heartScale
    }
    let secondScale: Scale = {
      x: options.jumpAnimation.secondScale.x * heartScale,
      y: options.jumpAnimation.secondScale.y * heartScale
    }
    tl.to(heartImg.scale, { x: firstScale.x, y: firstScale.y, duration: options.jumpAnimation.duration })
      .to(heartImg.scale, { x: heartScale, y: heartScale, duration: options.jumpAnimation.duration })
      .to(heartImg.scale, { x: secondScale.x, y: secondScale.y, duration: options.jumpAnimation.duration })
      .to(heartImg, { alpha: 0, duration: options.fadeOutDuration })
      .add('fadeOut', "<")
      .to(dialogImg, { alpha: 0, duration: options.fadeOutDuration }, 'fadeOut')
      .then(() => { dialogImg.destroy(); heartImg.destroy() })

    return Promise.resolve(undefined);
  }, Music(instance: CharacterEffectInstance, options: EmotionOptions['Music'], sprites: Sprite[]) {
    let note = sprites[0];
    let scale = options.scale * instance.instance.width / note.width / instance.instance.scale.x;
    const container = new Container();
    const { offsetX, offsetY } = emotionContainerOffset(instance.instance, options);
    container.position.set(offsetX, offsetY);
    note.scale.set(scale * 0.7);
    note.x = instance.instance.width * options.startPositionOffset.x;
    note.y = instance.instance.width * options.startPositionOffset.y;
    note.visible = true;
    container.addChild(note);
    let tl = gsap.timeline();
    let x = note.x;
    let y = note.y;
    instance.instance.addChild(container);

    return new Promise((resolve, reject) => {
      tl.to(note.scale, { x: scale, y: scale, duration: 0.1 })
        .to(note, { x: x + note.width * options.animation.offset.x, duration: options.animation.duration })
        .add('start', '<')
        .to(note, { y: y + note.width * options.animation.offset.y, angle: options.rotateAngle, duration: options.animation.duration * 0.3 }, 'start')
        .to(note, { y: y, angle: 0, duration: options.animation.duration * 0.3 }, '>')
        .to(note, { y: y + note.width * options.animation.offset.y, angle: options.rotateAngle, duration: options.animation.duration * 0.4 }, '>')
        .to(note, { y: y, angle: 0, duration: options.animation.duration * 0.4 }, '>')
        .to(note, { alpha: 0, duration: options.fadeOutDuration }, '>')
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
    questionImg.visible = true
    questionImg.zIndex = 10;
    const scale = options.scale * instance.instance.width / questionImg.width / instance.instance.scale.x;
    const { offsetX, offsetY } = emotionContainerOffset(instance.instance, options);
    questionImg.position.set(
      offsetX + instance.instance.width * options.startPositionOffset.x,
      offsetY + instance.instance.width * options.startPositionOffset.y
    );
    questionImg.scale.set(scale);
    questionImg.anchor.set(options.scaleAnimation.anchor.x, options.scaleAnimation.anchor.y)
    instance.instance.addChild(questionImg);
    let tl = gsap.timeline()
    let animationScale = scale * options.scaleAnimation.scale
    let recoverScale = scale * options.scaleAnimation.recoverScale
    return timelinePromise(
      tl.to(questionImg.scale, { x: animationScale, y: animationScale, duration: options.scaleAnimation.scaleDuration })
        .to(questionImg.scale, { x: recoverScale, y: recoverScale, duration: options.scaleAnimation.recoverDuration })
        .to(questionImg, { duration: options.fadeOutPreDuration! })
        .to(questionImg, { alpha: 0, duration: options.fadeOutDuration })
      , [questionImg])
  }, Respond(instance: CharacterEffectInstance, options: EmotionOptions['Respond'], sprites: Sprite[]): Promise<void> {
    const { instance: spine } = instance;
    const globalOptions = setInitValue(instance, sprites[0], options)
    const imgContainer = new Container();
    for (let i = 0; i < 3; ++i) {
      let respondImg = spine.newSprite(sprites[0].texture)
      respondImg.angle = options.perImgSetting[i].angle
      respondImg.anchor.set(
        options.perImgSetting[i].anchor.x,
        options.perImgSetting[i].anchor.y,
      )
      respondImg.scale.set(globalOptions.scale * options.perImgSetting[i].scale / spine.scale.x)
      imgContainer.addChild(respondImg)
    }
    const { offsetX, offsetY } = emotionContainerOffset(spine, options);
    imgContainer.position.set(offsetX, offsetY);
    imgContainer.zIndex = 10
    imgContainer.alpha = 1
    imgContainer.visible = true;
    spine.addChild(imgContainer)
    let tl = gsap.timeline()
    return timelinePromise(
      tl.to(imgContainer, { alpha: options.flashAnimation.alpha, duration: options.flashAnimation.duration })
        .to(imgContainer, { alpha: 1, duration: options.fadeOutDuration })
        .to(imgContainer, { duration: options.fadeOutPreDuration })
        .to(imgContainer, { alpha: 0, duration: options.fadeOutDuration }),
      [...imgContainer.children as Sprite[], ...sprites]
    );
  }, Sad(instance: CharacterEffectInstance, options: EmotionOptions['Sad'], sprites: Sprite[]): Promise<void> {
    const container = new Container()
    const { offsetX, offsetY } = emotionContainerOffset(instance.instance, options);
    container.position.set(offsetX, offsetY);
    // TODO
    return Promise.resolve(undefined);
  }, Shy(instance: CharacterEffectInstance, options: EmotionOptions['Shy'], sprites: Sprite[]): Promise<void> {
    let dialogImg = sprites[0]
    let shyImg = sprites[1]

    const scale = options.scale * instance.instance.width / dialogImg.width / instance.instance.scale.x;
    const container = new Container()
    const { offsetX, offsetY } = emotionContainerOffset(instance.instance, options);
    container.position.set(
      offsetX + instance.instance.width * options.startPositionOffset.x,
      offsetY + instance.instance.width * options.startPositionOffset.y
    );

    dialogImg.scale.set(scale * options.scaleAnamation.startScale)
    dialogImg.anchor.set(options.scaleAnamation.anchor.x, options.scaleAnamation.anchor.y)
    let shyImgPos = calcRelativePosition(dialogImg, options.shyImg.position)
    shyImg.scale.set(scale * options.shyImg.scale * options.scaleAnamation.startScale)
    shyImg.position = shyImgPos
    dialogImg.zIndex = 10
    shyImg.zIndex = 11
    let shyImgAnchor = options.shyImg.anchor
    shyImg.anchor.set(shyImgAnchor.x, shyImgAnchor.y)
    shyImg.visible = dialogImg.visible = true
    container.addChild(dialogImg, shyImg);
    instance.instance.addChild(container);
    let shakeTl = gsap.timeline({ paused: true })
    shakeTl.add('start')
      .to(shyImg, { angle: options.shakeAnimation.angleFrom, duration: options.shakeAnimation.duration / 2 })
      .to(shyImg, { angle: options.shakeAnimation.angleTo, duration: options.shakeAnimation.duration / 2 })
      .add('end')


    let tl = gsap.timeline()
    return timelinePromise(
      tl.to(shyImg.scale, { x: scale, y: scale, duration: options.scaleAnamation.duration })
        .to(dialogImg.scale, { x: scale, y: scale, duration: options.scaleAnamation.duration }, '<')
        .add(shakeTl.tweenFromTo('start', 'end', { repeat: options.shakeAnimation.times - 1 }))
        .to(shyImg, { alpha: 0, duration: options.fadeOutDuration })
        .to(dialogImg, { alpha: 0, duration: options.fadeOutDuration }, '<')
      , [shyImg, dialogImg]
    )
  }, Surprise(instance: CharacterEffectInstance, options: EmotionOptions['Surprise'], sprites: Sprite[]): Promise<void> {
    let exclaimImg = Sprite.from(sprites[0].texture)
    let surpriseImg = Sprite.from(sprites[1].texture)

    const scale = options.scale * instance.instance.width / exclaimImg.width / instance.instance.scale.x;
    let startScale = scale * options.scaleAnimation.startScale

    exclaimImg.scale.set(startScale)
    exclaimImg.anchor.set(options.scaleAnimation.anchor.x, options.scaleAnimation.anchor.y)
    surpriseImg.scale.set(startScale, startScale * options.scaleAnimation.questionImgYScale)
    surpriseImg.position = calcRelativePosition(exclaimImg, options.imgSetting.questionImgPos)
    surpriseImg.anchor.set(options.scaleAnimation.anchor.x, options.scaleAnimation.anchor.y)

    const container = new Container()
    const { offsetX, offsetY } = emotionContainerOffset(instance.instance, options);
    container.position.set(
      offsetX + instance.instance.width * options.startPositionOffset.x,
      offsetY + instance.instance.width * options.startPositionOffset.y
    );

    //container设置为从app.stage的(0,0)开始方便使用工具类函数
    container.addChild(exclaimImg, surpriseImg)
    instance.instance.addChild(container)
    container.zIndex = 10

    let tl = gsap.timeline()
    let xOffset = options.jumpAnimation.xOffset * instance.instance.width
    let jumpYOffset = options.jumpAnimation.jumpYOffset * instance.instance.width
    return timelinePromise(
      tl.to(container, { x: `+=${xOffset}`, duration: options.jumpAnimation.duration })
        .to(container, { y: `-=${jumpYOffset}`, duration: options.jumpAnimation.duration / 2 }, 0)
        .to(container, { y: `+=${jumpYOffset}`, duration: options.jumpAnimation.duration / 2 }, '>')
        .add('jumpEnd')
        .to(exclaimImg.scale, { x: scale, y: scale, duration: options.scaleAnimation.duration }, 0)
        .to(surpriseImg.scale, { x: scale, y: scale, duration: options.scaleAnimation.duration }, 0)
        .to(container, { duration: options.fadeOutPreDuration }, 'jumpEnd')
        .to(container, { alpha: 0, duration: options.fadeOutDuration }, '>')
      , [...sprites, surpriseImg, exclaimImg]
    )
  }, Sweat(instance: CharacterEffectInstance, options: EmotionOptions['Sweat'], sprites: Sprite[]): Promise<void> {
    let dropImg = sprites[0]
    let smallDropImg = sprites[1]
    const container = new Container()
    const { offsetX, offsetY } = emotionContainerOffset(instance.instance, options);
    container.position.set(offsetX, offsetY);
    //设置初始位置和大小

    const scale = options.scale * instance.instance.width / dropImg.width / instance.instance.scale.x;
    dropImg.scale.set(scale)
    smallDropImg.scale.set(scale)

    dropImg.x = instance.instance.width * options.startPositionOffset.x;
    dropImg.y = instance.instance.width * options.startPositionOffset.y;
    let smallPosition = calcRelativePosition(dropImg, options.smallImg.offset)
    smallDropImg.x = smallPosition.x;
    smallDropImg.y = smallPosition.y;
    dropImg.zIndex = 10
    smallDropImg.zIndex = 10
    smallDropImg.visible = dropImg.visible = true
    container.addChild(dropImg, smallDropImg);
    instance.instance.addChild(container);
    let tl = gsap.timeline()
    return new Promise((resolve, reject) => {
      tl.to(dropImg, { y: dropImg.y - dropImg.width * options.dropAnimation.yOffset, duration: options.dropAnimation.duration })
        .to(smallDropImg, {
          y: smallDropImg.y - options.smallImg.dropAnimationOffset * smallDropImg.width,
          duration: options.dropAnimation.duration
        }, '<')
        .then(() => { dropImg.destroy(); smallDropImg.destroy(); resolve() })
        .catch(reason => reject(reason))
    })
  }, Twinkle(instance: CharacterEffectInstance, options: EmotionOptions['Twinkle'], sprites: Sprite[]): Promise<void> {
    const container = new Container()
    const { offsetX, offsetY } = emotionContainerOffset(instance.instance, options);
    container.position.set(offsetX, offsetY);
    let scale = getRelativeScale(instance, sprites[0], options) / instance.instance.scale.x;
    let starImgs: Sprite[] = []
    let starImgScales: number[] = []
    for (let i = 0; i < 3; ++i) {
      starImgScales.push(scale * options.starImgs.scale[i])
    }
    for (let i = 0; i < 3; ++i) {
      let starImg = Sprite.from(sprites[0].texture)
      starImgs.push(starImg)
      starImg.anchor.set(0.5)
      starImg.scale.set(starImgScales[i])
      starImg.position = calcRelativePosition(starImgs[0], options.starImgs.pos[i])
      container.addChild(starImg)
    }
    container.alpha = 0
    instance.instance.addChild(container)

    let flashTlMaster = gsap.timeline({ paused: true })
    for (let i = 0; i < 3; ++i) {
      let flashTl = gsap.timeline()
      flashTl.to(starImgs[i],
        {
          pixi: { scale: options.flashAnimation.scales[i] * starImgScales[i] },
          duration: options.flashAnimation.duration[i] / 2,
          repeat: -1,
          yoyo: true,
        }
        , 0)
      flashTlMaster.add(flashTl, 0)
    }

    let tl = gsap.timeline()
    return timelinePromise(
      tl.to(container, { alpha: 1, duration: options.fadeInDuration })
        .add(flashTlMaster.tweenFromTo(0, options.flashAnimation.totalDuration))
        .to(container, { alpha: 0, duration: options.fadeOutDuration }, `>-=${options.fadeOutPreDuration}`)
      , [...starImgs, ...sprites]
    )
  }, Upset(instance: CharacterEffectInstance, options: EmotionOptions['Upset'], sprites: Sprite[]): Promise<void> {
    let dialogImg = sprites[0]
    let upsetImg = Sprite.from(sprites[1].texture)
    const { offsetX, offsetY } = emotionContainerOffset(instance.instance, options);
    dialogImg.position.set(
      offsetX + instance.instance.width * options.startPositionOffset.x,
      offsetY + instance.instance.width * options.startPositionOffset.y
    );

    upsetImg.anchor.set(0.5, 0.5)
    dialogImg.addChild(upsetImg)
    dialogImg.visible = true;
    instance.instance.addChild(dialogImg);
    setRelativePosition(upsetImg, dialogImg, options.upsetImgPos)

    let animationTl = gsap.timeline({ paused: true })
    animationTl.fromTo(upsetImg,
      { pixi: { angle: options.rotateAnimation.angleFrom } },
      { pixi: { angle: options.rotateAnimation.angleTo }, duration: options.rotateAnimation.duration, repeat: -1, yoyo: true })
      .to(upsetImg, {
        pixi: { scaleY: options.yScaleAnimation.scale },
        duration: options.yScaleAnimation.duration,
        repeat: -1,
        yoyo: true
      })

    let tl = gsap.timeline()
    return timelinePromise(
      tl.add(animationTl.tweenFromTo(0, options.animationTotalDuration))
        .to(dialogImg, { pixi: { alpha: 0 }, duration: options.fadeOutDuration })
      , [...sprites, upsetImg]
    )
  }
}


function calcGlobalEmotionOptions(instance: CharacterEffectInstance, standardImg: Sprite, options: EmotionOptions[EmotionWord]) {
  return {
    startPositionOffset: {
      x: instance.instance.x + instance.instance.width * options.startPositionOffset.x,
      y: instance.instance.y + instance.instance.width * options.startPositionOffset.y
    },
    scale: options.scale * instance.instance.width / standardImg.width
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
 * 设置一个图片在另一个图片中的位置(需要该图片是另一图片的child) 
 * @param childImg 设置的图片
 * @param containerImg 作为容器的图片
 * @param relativeValue 位置的相对值(相对于容器图片宽度而言)
 */
function setRelativePosition(childImg: Sprite, containerImg: Sprite, relativeValue: PositionOffset) {
  childImg.position = {
    x: relativeValue.x * containerImg.width,
    y: relativeValue.y * containerImg.height
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
      x: instance.instance.x + instance.instance.width * options.startPositionOffset.x,
      y: instance.instance.y + instance.instance.width * options.startPositionOffset.y
    },
    scale: options.scale * instance.instance.width / standardImg.width
  }
  standardImg.scale.set(globalOptions.scale)
  standardImg.x = globalOptions.startPositionOffset.x
  standardImg.y = globalOptions.startPositionOffset.y
  standardImg.zIndex = 10

  return globalOptions
}

/**
 * 将spine作为Container使用后的方法
 *
 * 提供可能存在的将0,0引导至spine左上角的offset
 */
const YuukaWidth = 965;
const YuukaHeight = 2424;
function emotionContainerOffset(spine: Spine, options: EmotionOptions[EmotionWord]) {
  return {
    offsetX: spine.pivot.x + ((spine.width / spine.scale.x / YuukaWidth) * options.makeSpineHappyOffset.x),
    offsetY: spine.pivot.y + ((spine.height / spine.scale.y / YuukaHeight) * options.makeSpineHappyOffset.y),
  }
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
    x: instance.instance.x + instance.instance.width * options.startPositionOffset.x,
    y: instance.instance.y + instance.instance.width * options.startPositionOffset.y
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
  return options.scale * instance.instance.width / img.width
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

export default CharacterEmotionPlayerInstance