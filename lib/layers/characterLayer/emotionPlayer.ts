import eventBus from "@/eventBus";
import { usePlayerStore } from "@/stores";
import {
  CharacterEffectInstance, CharacterEmotionPlayer, EmotionOptions, EmotionWord, PositionOffset, Scale
} from "@/types/characterLayer";
import gsap from 'gsap';
import { Spine } from "pixi-spine";
import { Container, Sprite } from "pixi.js";
import emotionOptions from "./options/emotionOptions";


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
    if (!fn) {
      return Promise.reject(`不支持的特效类型: ${type}`)
    }
    const { emotionResources, app } = usePlayerStore()
    let emotionImageSprites: Sprite[] = []
    let emotionImgs = emotionResources(type)
    if (!emotionImgs) {
      return Promise.reject(`${type}没有对应的图像资源`)
    }
    for (let imageResource of emotionImgs) {
      const tempSprite = Sprite.from(imageResource)
      tempSprite.visible = false
      app.stage.addChild(tempSprite)
      emotionImageSprites.push(tempSprite)
    }
    eventBus.emit('playEmotionAudio', type)
    return fn(instance, emotionOptions[type], emotionImageSprites)?.then(
      () => {
        for (let sprite of emotionImageSprites) {
          sprite.destroy()
        }
      }
    ) as Promise<void>;
  },
  Angry(instance: CharacterEffectInstance, options: EmotionOptions['Angry'], sprites: Sprite[]): Promise<void> {
    const angryImgUnit = sprites[0]
    const scale = getRelativeScale(angryImgUnit, options)
    const { container } = prepareEmotionContainer(instance.instance, options);
    //最后用于确定动画结束的timeline
    let waitTimeLine = gsap.timeline()
    const destroyImg: Sprite[] = []
    for (let i = 0; i < 3; ++i) {
      const uImgUnit = Sprite.from(angryImgUnit.texture)
      destroyImg.push(uImgUnit)
      uImgUnit.scale.set(scale)
      uImgUnit.anchor.set(0.35, -0.05)
      uImgUnit.angle += i * 120
      uImgUnit.zIndex = 10
      container.addChild(uImgUnit)
      const tl = gsap.timeline()
      waitTimeLine = tl
      tl.to(uImgUnit.scale, { x: scale * options.animationScale.scale, duration: options.animationScale.duration })
        .to(uImgUnit.scale, { x: scale, duration: options.animationScale.duration })
        .to(uImgUnit.scale, { x: scale * options.endScale.scale, y: scale * options.endScale.scale, duration: options.endScale.duration })
    }

    return timelinePromise(waitTimeLine, destroyImg);
  }, Chat(instance: CharacterEffectInstance, options: EmotionOptions['Chat'], sprites: Sprite[]): Promise<void> {
    const chatImage = sprites[0]
    prepareEmotionContainer(instance.instance, options, chatImage);

    chatImage.scale.set(getRelativeScale(chatImage, options))
    chatImage.visible = true
    chatImage.pivot.x = chatImage.width * (1 + options.rotatePivot.x)
    chatImage.pivot.y = chatImage.height * (1 + options.rotatePivot.y)
    chatImage.zIndex = 10
    let tl = gsap.timeline()
    tl.to(chatImage, { angle: options.rotateAngle, duration: options.rotateTime / 2 })
      .to(chatImage, { angle: 0, duration: options.rotateTime / 2 })
      .to(chatImage, { alpha: 0, duration: options.fadeOutDuration })

    return timelinePromise(tl, [])
  }, Dot(instance: CharacterEffectInstance, options: EmotionOptions['Dot'], sprites: Sprite[]): Promise<void> {
    const dialogImg = Sprite.from(sprites[0].texture);
    prepareEmotionContainer(instance.instance, options, dialogImg);
    const dotContainer = new Container()
    const showTl = gsap.timeline()
    for (let i = 0; i < 3; ++i) {
      const dotImg = Sprite.from(sprites[1].texture)
      dotImg.alpha = 0
      dotImg.position = calcRelativePosition(dotImg, { x: options.dotPos[i], y: 0 })
      showTl.to(dotImg, { alpha: 1, duration: options.showAnimation.alpahaDuration, delay: options.showAnimation.showDelay })
      dotContainer.addChild(dotImg)
    }
    dialogImg.addChild(dotContainer)
    dotContainer.position = { x: options.dotContainerPos.x * dialogImg.width, y: options.dotContainerPos.y * dialogImg.height }
    showTl.to(dialogImg, { alpha: 0, duration: options.fadeOutDuration, delay: options.fadeOutPreDuration })
    return timelinePromise(
      showTl
      , [dialogImg, ...dotContainer.children as Sprite[]])
  }, Exclaim(instance: CharacterEffectInstance, options, sprites: Sprite[]): Promise<void> {
    const surpriseImg = sprites[0]
    prepareEmotionContainer(instance.instance, options, surpriseImg);
    const scale = getRelativeScale(surpriseImg, options)
    surpriseImg.visible = true
    const tl = gsap.timeline()
    const animationScale = scale * options.scaleAnimation.scale
    const recoverScale = scale * options.scaleAnimation.recoverScale
    return timelinePromise(
      tl.to(surpriseImg.scale, { x: animationScale, y: animationScale, duration: options.scaleAnimation.scaleDuration })
        .to(surpriseImg.scale, { x: recoverScale, y: recoverScale, duration: options.scaleAnimation.recoverDuration })
        .to(surpriseImg, { duration: options.fadeOutWaitTime })
        .to(surpriseImg, { alpha: 0, duration: options.fadeOutDuration })
      , [])
  }, Heart(instance: CharacterEffectInstance, options: EmotionOptions['Heart'], sprites: Sprite[]): Promise<void> {
    const dialogImg = sprites[0];
    const heartImg = sprites[1];
    const dialogScale = getRelativeScale(dialogImg, options);
    const { container } = prepareEmotionContainer(instance.instance, options);

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

    const tl = gsap.timeline()
    const firstScale: Scale = {
      x: options.jumpAnimation.firstScale.x * heartScale,
      y: options.jumpAnimation.firstScale.y * heartScale
    }
    const secondScale: Scale = {
      x: options.jumpAnimation.secondScale.x * heartScale,
      y: options.jumpAnimation.secondScale.y * heartScale
    }
    tl.to(heartImg.scale, { x: firstScale.x, y: firstScale.y, duration: options.jumpAnimation.duration })
      .to(heartImg.scale, { x: heartScale, y: heartScale, duration: options.jumpAnimation.duration })
      .to(heartImg.scale, { x: secondScale.x, y: secondScale.y, duration: options.jumpAnimation.duration })
      .to(heartImg, { alpha: 0, duration: options.fadeOutDuration })
      .add('fadeOut', "<")
      .to(dialogImg, { alpha: 0, duration: options.fadeOutDuration }, 'fadeOut')
    return timelinePromise(tl, [])
  }, Music(instance: CharacterEffectInstance, options: EmotionOptions['Music'], sprites: Sprite[]) {
    const note = sprites[0];
    const scale = getRelativeScale(note, options)
    const { container } = prepareEmotionContainer(instance.instance, options);

    note.scale.set(scale * 0.7);
    const x = instance.instance.width * options.startPositionOffset.x;
    const y = instance.instance.width * options.startPositionOffset.y;
    note.visible = true;
    note.position.set(x, y);
    container.addChild(note);
    const tl = gsap.timeline();
    tl.to(note.scale, { x: scale, y: scale, duration: 0.1 })
      .to(note, { x: x + note.width * options.animation.offset.x, duration: options.animation.duration })
      .add('start', '<')
      .to(note, { y: y + note.width * options.animation.offset.y, angle: options.rotateAngle, duration: options.animation.duration * 0.3 }, 'start')
      .to(note, { y: y, angle: 0, duration: options.animation.duration * 0.3 }, '>')
      .to(note, { y: y + note.width * options.animation.offset.y, angle: options.rotateAngle, duration: options.animation.duration * 0.4 }, '>')
      .to(note, { y: y, angle: 0, duration: options.animation.duration * 0.4 }, '>')
      .to(note, { alpha: 0, duration: options.fadeOutDuration }, '>')


    return timelinePromise(tl, [])
  }, Question(instance: CharacterEffectInstance, options: EmotionOptions['Question'], sprites: Sprite[]): Promise<void> {
    const questionImg = sprites[0]
    questionImg.visible = true
    questionImg.zIndex = 10;
    const scale = getRelativeScale(questionImg, options);
    prepareEmotionContainer(instance.instance, options, questionImg);

    questionImg.scale.set(scale);
    questionImg.anchor.set(options.scaleAnimation.anchor.x, options.scaleAnimation.anchor.y)
    const tl = gsap.timeline()
    const animationScale = scale * options.scaleAnimation.scale
    const recoverScale = scale * options.scaleAnimation.recoverScale
    return timelinePromise(
      tl.to(questionImg.scale, { x: animationScale, y: animationScale, duration: options.scaleAnimation.scaleDuration })
        .to(questionImg.scale, { x: recoverScale, y: recoverScale, duration: options.scaleAnimation.recoverDuration })
        .to(questionImg, { duration: options.fadeOutPreDuration! })
        .to(questionImg, { alpha: 0, duration: options.fadeOutDuration })
      , [])
  }, Respond(instance: CharacterEffectInstance, options: EmotionOptions['Respond'], sprites: Sprite[]): Promise<void> {
    const { instance: spine } = instance;
    const { container } = prepareEmotionContainer(spine, options);
    const scale = getRelativeScale(sprites[0], options)

    for (let i = 0; i < 3; ++i) {
      let respondImg = spine.newSprite(sprites[0].texture)
      respondImg.angle = options.perImgSetting[i].angle
      respondImg.anchor.set(
        options.perImgSetting[i].anchor.x,
        options.perImgSetting[i].anchor.y,
      )
      respondImg.scale.set(scale * options.perImgSetting[i].scale / 0.5)
      container.addChild(respondImg)
    }
    container.zIndex = 10
    container.alpha = 1
    container.visible = true;
    let tl = gsap.timeline()
    return timelinePromise(
      tl.to(container, { alpha: options.flashAnimation.alpha, duration: options.flashAnimation.duration })
        .to(container, { alpha: 1, duration: options.fadeOutDuration })
        .to(container, { duration: options.fadeOutPreDuration })
        .to(container, { alpha: 0, duration: options.fadeOutDuration }),
      [...container.children as Sprite[], ...sprites]
    );
  }, Sad(instance: CharacterEffectInstance, options: EmotionOptions['Sad'], sprites: Sprite[]): Promise<void> {
    const { container } = prepareEmotionContainer(instance.instance, options);
    // TODO
    return Promise.resolve(undefined);
  }, Shy(instance: CharacterEffectInstance, options: EmotionOptions['Shy'], sprites: Sprite[]): Promise<void> {
    const dialogImg = sprites[0]
    const shyImg = sprites[1]
    const { container, offsetX, offsetY } = prepareEmotionContainer(instance.instance, options);
    const scale = getRelativeScale(dialogImg, options)
    container.position.set(
      offsetX + instance.instance.width * options.startPositionOffset.x,
      offsetY + instance.instance.width * options.startPositionOffset.y
    );
    dialogImg.scale.set(scale * options.scaleAnamation.startScale)
    dialogImg.anchor.set(options.scaleAnamation.anchor.x, options.scaleAnamation.anchor.y)
    const shyImgPos = calcRelativePosition(dialogImg, options.shyImg.position)
    shyImg.scale.set(scale * options.shyImg.scale * options.scaleAnamation.startScale)
    shyImg.position = shyImgPos
    dialogImg.zIndex = 10
    shyImg.zIndex = 11
    const shyImgAnchor = options.shyImg.anchor
    shyImg.anchor.set(shyImgAnchor.x, shyImgAnchor.y)
    shyImg.visible = dialogImg.visible = true
    container.addChild(dialogImg, shyImg);
    const shakeTl = gsap.timeline({ paused: true })
    shakeTl.add('start')
      .to(shyImg, { angle: options.shakeAnimation.angleFrom, duration: options.shakeAnimation.duration / 2 })
      .to(shyImg, { angle: options.shakeAnimation.angleTo, duration: options.shakeAnimation.duration / 2 })
      .add('end')
    const tl = gsap.timeline()
    return timelinePromise(
      tl.to(shyImg.scale, { x: scale, y: scale, duration: options.scaleAnamation.duration })
        .to(dialogImg.scale, { x: scale, y: scale, duration: options.scaleAnamation.duration }, '<')
        .add(shakeTl.tweenFromTo('start', 'end', { repeat: options.shakeAnimation.times - 1 }))
        .to(shyImg, { alpha: 0, duration: options.fadeOutDuration })
        .to(dialogImg, { alpha: 0, duration: options.fadeOutDuration }, '<')
      , []
    )
  }, Surprise(instance: CharacterEffectInstance, options: EmotionOptions['Surprise'], sprites: Sprite[]): Promise<void> {
    const exclaimImg = Sprite.from(sprites[0].texture)
    const surpriseImg = Sprite.from(sprites[1].texture)
    const scale = getRelativeScale(exclaimImg, options)
    const startScale = scale * options.scaleAnimation.startScale

    exclaimImg.scale.set(startScale)
    exclaimImg.anchor.set(options.scaleAnimation.anchor.x, options.scaleAnimation.anchor.y)
    surpriseImg.scale.set(startScale, startScale * options.scaleAnimation.questionImgYScale)
    surpriseImg.position = calcRelativePosition(exclaimImg, options.imgSetting.questionImgPos)
    surpriseImg.anchor.set(options.scaleAnimation.anchor.x, options.scaleAnimation.anchor.y)
    const { container } = prepareEmotionContainer(instance.instance, options);
    container.addChild(exclaimImg, surpriseImg)
    container.zIndex = 10

    const tl = gsap.timeline()
    const xOffset = options.jumpAnimation.xOffset * instance.instance.width
    const jumpYOffset = options.jumpAnimation.jumpYOffset * instance.instance.width
    return timelinePromise(
      tl.to(container, { x: `+=${xOffset}`, duration: options.jumpAnimation.duration })
        .to(container, { y: `-=${jumpYOffset}`, duration: options.jumpAnimation.duration / 2 }, 0)
        .to(container, { y: `+=${jumpYOffset}`, duration: options.jumpAnimation.duration / 2 }, '>')
        .add('jumpEnd')
        .to(exclaimImg.scale, { x: scale, y: scale, duration: options.scaleAnimation.duration }, 0)
        .to(surpriseImg.scale, { x: scale, y: scale, duration: options.scaleAnimation.duration }, 0)
        .to(container, { duration: options.fadeOutPreDuration }, 'jumpEnd')
        .to(container, { alpha: 0, duration: options.fadeOutDuration }, '>')
      , [surpriseImg, exclaimImg]
    )
  }, Sweat(instance: CharacterEffectInstance, options: EmotionOptions['Sweat'], sprites: Sprite[]): Promise<void> {
    const dropImg = sprites[0];
    const smallDropImg = sprites[1];
    const { container } = prepareEmotionContainer(instance.instance, options);
    const scale = getRelativeScale(dropImg, options)
    dropImg.scale.set(scale);
    smallDropImg.scale.set(scale);
    dropImg.x = instance.instance.width * options.startPositionOffset.x;
    dropImg.y = instance.instance.width * options.startPositionOffset.y;
    const smallPosition = calcRelativePosition(dropImg, options.smallImg.offset);
    smallDropImg.x = smallPosition.x;
    smallDropImg.y = smallPosition.y;
    dropImg.zIndex = 10;
    smallDropImg.zIndex = 10;
    smallDropImg.visible = dropImg.visible = true;
    container.addChild(dropImg, smallDropImg);
    const tl = gsap.timeline();
    tl.to(dropImg, { y: dropImg.y - dropImg.width * options.dropAnimation.yOffset, duration: options.dropAnimation.duration })
      .to(smallDropImg, {
        y: smallDropImg.y - options.smallImg.dropAnimationOffset * smallDropImg.width,
        duration: options.dropAnimation.duration
      }, '<')

    return timelinePromise(tl, [])
  }, Twinkle(instance: CharacterEffectInstance, options: EmotionOptions['Twinkle'], sprites: Sprite[]): Promise<void> {
    const { container } = prepareEmotionContainer(instance.instance, options);

    const scale = getRelativeScale(sprites[0], options) / 0.5;
    const starImgs: Sprite[] = []
    const starImgScales: number[] = []
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

    const flashTlMaster = gsap.timeline({ paused: true })
    for (let i = 0; i < 3; ++i) {
      const flashTl = gsap.timeline()
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

    const tl = gsap.timeline()
    return timelinePromise(
      tl.to(container, { alpha: 1, duration: options.fadeInDuration })
        .add(flashTlMaster.tweenFromTo(0, options.flashAnimation.totalDuration))
        .to(container, { alpha: 0, duration: options.fadeOutDuration }, `>-=${options.fadeOutPreDuration}`)
      , [...starImgs]
    )
  }, Upset(instance: CharacterEffectInstance, options: EmotionOptions['Upset'], sprites: Sprite[]): Promise<void> {
    const dialogImg = sprites[0]
    const upsetImg = Sprite.from(sprites[1].texture)
    prepareEmotionContainer(instance.instance, options, dialogImg);
    upsetImg.anchor.set(0.5, 0.5)
    dialogImg.addChild(upsetImg)
    dialogImg.visible = true;
    setRelativePosition(upsetImg, dialogImg, options.upsetImgPos)

    const animationTl = gsap.timeline({ paused: true })
    animationTl.fromTo(upsetImg,
      { pixi: { angle: options.rotateAnimation.angleFrom } },
      { pixi: { angle: options.rotateAnimation.angleTo }, duration: options.rotateAnimation.duration, repeat: -1, yoyo: true })
      .to(upsetImg, {
        pixi: { scaleY: options.yScaleAnimation.scale },
        duration: options.yScaleAnimation.duration,
        repeat: -1,
        yoyo: true
      })

    const tl = gsap.timeline()
    return timelinePromise(
      tl.add(animationTl.tweenFromTo(0, options.animationTotalDuration))
        .to(dialogImg, { pixi: { alpha: 0 }, duration: options.fadeOutDuration })
      , [upsetImg]
    )
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
 * 预处理表情容器, 可以是表情图片自己, 也可以是新的容器
 *
 * 将spine作为Container使用后的方法
 *
 * 计算方式不能基于spine width, 有width很大的人物特例
 *
 * 计算图片相对于入物中心的偏移值, 其中x方向减去的值为前面设置遗留的特殊值, 后面会改
 *
 * @param spine 角色对象
 * @param options 表情自己的配置信息
 * @param container 装表情的容器, 也可以是表情自己
 */
function prepareEmotionContainer(spine: Spine, options: EmotionOptions[EmotionWord], container?: Container | Sprite) {
  if (!container) {
    container = new Container();
  }
  //偏移量为根据startPositionOffset计算得出的固定值, 替换前面使用的makeSpineHappyOffset
  const offsetX = (options.startPositionOffset.x - 0.8) * 540;
  const offsetY = (options.startPositionOffset.y - 1.2) * 1012;
  container.position.set(
    offsetX,
    offsetY
  );
  spine.addChild(container);
  return {
    offsetX,
    offsetY,
    container
  }
}

/**
 * 计算图片的缩放比例
 * 事实上是一个固定值, 该函数的存在意义主要是适应以前的参数设置
 * @param img 缩放的图片
 * @param options 情绪动画设置参数
 * @returns 缩放比例绝对值
 */
function getRelativeScale(img: Sprite, options: EmotionOptions[EmotionWord]) {
  return options.scale * 540 / img.width
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
