import { resourcesLoader } from "@/index";
import { Application, Container, Graphics, Sprite } from "pixi.js";
import gsap from "gsap";
import { Emitter, EmitterConfigV3, Particle } from "@pixi/particle-emitter";
import { emitterStarter } from "@/layers/effectLayer/emitterUtils";
import { wait } from "@/utils";

export async function clickEffect(app: Application, x: number, y: number) {
  // 原理是线条 emitter
  const appWidth = app.view.width;
  const appHeight = app.view.height / 2; // 通过 resolution 抗锯齿后需要重新算一下高度, 如果直接用图片不用 graphics 生成就没那锯齿这问题了
  const triangle =
    resourcesLoader.loader.resources["FX_TEX_Triangle_02_a.png"].texture;
  let tl = gsap.timeline();
  const circleSize = appHeight * 0.03;
  const graphics = new Graphics();
  graphics.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
  graphics.beginFill(0xffffff, 1); // 0xb8e1fe
  graphics.drawCircle(x, y, appHeight); // 设大一点, 避免锯齿
  graphics.endFill();
  const texture = app.renderer.generateTexture(graphics as any);
  const circle = new Sprite(texture as any);
  app.stage.addChild(circle);
  circle.width = circleSize;
  circle.height = circleSize;
  circle.anchor.set(0.5);
  circle.position.set(x, y);
  const maxCircleSize = 1.5 * circleSize;
  const baseDuration = 0.02;
  tl.to(circle, {
    pixi: {
      width: maxCircleSize * 2,
      height: maxCircleSize * 2,
    },
    duration: baseDuration * 14,
  })
    .to(
      circle,
      {
        pixi: {
          tint: 0xb8e1fe,
        },
        duration: baseDuration * 2,
      },
      "<"
    )
    .to(
      circle,
      {
        pixi: {
          tint: 0xb8e1fe,
          alpha: 0.4,
        },
        duration: baseDuration * 6,
      },
      "<"
    )
    .to(
      circle,
      {
        pixi: {
          tint: 0x01d4fb,
          alpha: 0,
        },
        duration: baseDuration * 2,
      },
      ">"
    );
  setTimeout(() => {
    // 白色的border
    const ring = new Graphics();
    const borderWidth = 0.1 * appHeight;
    ring.lineStyle(borderWidth, 0xffffff, 1);
    ring.drawCircle(x, y, appHeight); // 设大一点, 避免锯齿
    ring.endFill();
    const ringTexture = app.renderer.generateTexture(ring as any);
    const ringSprite = new Sprite(ringTexture as any);
    app.stage.addChild(ringSprite);
    const curSize = maxCircleSize * 0.6 * 2;
    ringSprite.width = curSize;
    ringSprite.height = curSize;
    ringSprite.anchor.set(0.5);
    setTimeout(() => {
      // 中途变细, 体现出 border 的变化感
      const ring = new Graphics();
      ring.lineStyle(borderWidth * 0.6, 0xffffff, 1);
      ring.drawCircle(x, y, appHeight);
      ring.endFill();
      const ringTexture = app.renderer.generateTexture(ring as any);
      ringSprite.texture = ringTexture;
    }, 1000 * 10 * baseDuration);
    ringSprite.texture = ringTexture;
    ringSprite.alpha = 0.8;
    ringSprite.position.set(x, y);
    tl = gsap.timeline();
    tl.to(ringSprite, {
      pixi: {
        tint: 0xffffff,
        alpha: 1,
      },
      duration: baseDuration * 1,
    })
      .to(
        ringSprite,
        {
          pixi: {
            width: maxCircleSize * 0.9 * 2,
            height: maxCircleSize * 0.9 * 2,
          },
          duration: baseDuration * 12,
        },
        ">"
      )
      .to(ringSprite, {
        pixi: {
          width: maxCircleSize * 2,
          height: maxCircleSize * 2,
        },
        duration: baseDuration * 4,
      })
      .then(() => {
        app.stage.removeChild(ringSprite);
      });
  }, baseDuration * 1);
  // 中心的那个点
  const point = new Graphics();
  point.lineStyle(0);
  point.beginFill(0xffffff, 0.4);
  point.drawCircle(x, y, 1);
  point.endFill();
  app.stage.addChild(point);
  setTimeout(() => {
    app.stage.removeChild(point);
  }, baseDuration * 10 * 1000);
  class ClickTriangle {
    public static type = "ClickTriangle";
    public order = 5; // 代表延迟执行, 可能是 emitter 包的问题, 引入定义报错
    public rotationedNum = 0; // 两个向上两个向下
    public rightNum = 0;
    public topNum = 1;
    initParticles(first: Particle): void {
      let next = first;
      const spawnWidth = maxCircleSize * 0.7;
      while (next) {
        let temX,
          temY = 0;
        if (this.rotationedNum < 2) {
          next.angle = 180;
          this.rotationedNum++;
        }
        if (this.rightNum < 2) {
          temX = Math.random();
          this.rightNum++;
        } else {
          temX = -Math.random();
        }
        temX = temX * spawnWidth;
        temY = Math.sqrt(spawnWidth ** 2 - Math.abs(temX) ** 2);
        this.topNum++;
        if (this.topNum % 2 === 0) {
          temY = -temY;
        }
        next.position.x = temX + x;
        next.position.y = temY + y;
        next = next.next;
      }
    }
    updateParticle(particle: Particle, deltaSec: number): void {
      const oldVX = particle.x;
      const oldVY = particle.y;
      const moveDistance = (0.3 * maxCircleSize) / (13 * baseDuration);
      const xDirection = oldVX - x > 0 ? 1 : -1;
      const yDirection = oldVY - y > 0 ? 1 : -1;
      particle.x += xDirection * moveDistance * deltaSec;
      particle.y += yDirection * ((moveDistance * oldVY) / oldVX) * deltaSec;
    }
  }
  Emitter.registerBehavior(ClickTriangle);
  // 相比整个播放器高度的大小
  const triangleScaleBase = appHeight / triangle?.width!;
  let emitterConfig = {
    frequency: 0.001,
    maxParticles: 4,
    lifetime: {
      min: baseDuration * 18,
      max: baseDuration * 18,
    },
    behaviors: [
      {
        type: "textureSingle",
        config: {
          texture: triangle,
        },
      },
      {
        type: "ClickTriangle",
      },
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              { value: 1, time: 0 },
              { value: 0.9, time: 4 / 13 },
              { value: 0.4, time: 5 / 13 },
              { value: 0.9, time: 7 / 13 },
              { value: 0.9, time: 1 },
            ],
          },
        },
      },
      {
        type: "scale",
        config: {
          scale: {
            list: [
              {
                value: 0,
                time: 0,
              },
              {
                value: triangleScaleBase * 0.024,
                time: 0.2,
              },
              {
                value: triangleScaleBase * 0.015,
                time: 0.6,
              },
              {
                value: 0,
                time: 1,
              },
            ],
          },
          minMult: 0.5,
        },
      },
      {
        type: "color",
        config: {
          color: {
            list: [
              { value: "#ffffff", time: 0 },
              { value: "#ffffff", time: 3 / 13 },
              { value: "#02d5fa", time: 4 / 13 },
              { value: "#02d5fa", time: 1 },
            ],
          },
        },
      },
    ],
  } as EmitterConfigV3;
  const ringEmitter = new Emitter(app.stage, emitterConfig);
  let ringRemover: any;
  setTimeout(() => {
    ringRemover = emitterStarter(ringEmitter);
  }, 1000 * baseDuration);
  await wait(1000 * baseDuration * 18);
  app.stage.removeChild(point);
  app.stage.removeChild(circle);
  ringRemover();
}
