import { usePlayerStore } from "@/stores";
import { CharacterEffectInstance, CharacterFXPlayer, PositionOffset } from "@/types/characterLayer";
import { Sprite } from "pixi.js";
import fxOptions from './options/fxOptions'
import gsap from "gsap";

const characterFXPlayer: CharacterFXPlayer = {
  init() {
    return;
  },
  dispose(): void {
  },
  getHandlerFunction(type) {
    return Reflect.get(this, type)
  },
  processEffect(type, instance) {
    const fn = this.getHandlerFunction(type);
    if (!fn) {
      return Promise.reject('该effect不存在或未实现');
    }
    const { fxImages, app } = usePlayerStore()
    let fxImageSprites: Sprite[] = []
    for (let imageResource of fxImages(type)) {
      let tempSprite = Sprite.from(imageResource)
      tempSprite.visible = false
      app.stage.addChild(tempSprite)
      fxImageSprites.push(tempSprite)
    }
    return fn(instance, fxOptions[type], fxImageSprites) as Promise<void>;
  },
  shot(instance, options, sprites) {
    let scale = options.scale * instance.instance.width / sprites[0].width
    sprites[0].scale.set(scale)
    sprites[0].x = instance.instance.x
    sprites[0].y = instance.instance.y

    setPos(instance,sprites[0],options.shotPos[0])
    sprites[0].zIndex = 10
    sprites[0].visible=true
    let tl = gsap.timeline()
    for (let pos of options.shotPos) {
      tl.fromTo(sprites[0], { pixi: { alpha: 1 } }, { pixi: { alpha: 0 }, duration: options.shotDuration, delay: options.shotDelay, onStart: () => { setPos(instance, sprites[0], pos) } })
    }

    return timelinePromise(tl, sprites)
  }
}

/**
 * 设置图片相对于人物位置
 * @param instance 
 * @param img 
 * @param pos 
 * @returns 
 */
function setPos(instance: CharacterEffectInstance, img: Sprite, pos: PositionOffset) {
  let finalPos = {
    x: instance.instance.x + instance.instance.width * pos.x,
    y: instance.instance.y + instance.instance.width * pos.y
  }
  img.position = finalPos

  return pos
}

/**
 * timeline执行后生成一个promise并自动回收sprite 
 * @param timeLine 执行的timeline
 * @param destroyImgs 要回收的sprite对象数组
 * @returns 生成的promise
 */
function timelinePromise(timeLine: gsap.core.Timeline, destroyImgs: Sprite[], callback?: () => any) {
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

export default characterFXPlayer