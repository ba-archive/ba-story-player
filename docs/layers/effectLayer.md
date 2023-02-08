本层中需要协力完成的部分是`BGEffect`

本层提供一个简易的可视化工具方便开发.

# 基本流程
1. 在[bgEffect特效表](https://docs.qq.com/sheet/DQ1pFSmdHbFRNd3Fu?tab=BB08J2)找到未完成的特效并在实现者中填入自己的github id.
2. 根据[图像资源获取](#图片资源获取)获取图像资源
3. (可选) 中`@/types/effectLayer.ts`的`BGEffectHandlerOptions`中填入参数定义, 例子:
```js
let BGEffectHandlerOptions={
  'BG_Test':{
    testOptions1: number
  }
}
```
4. 在`@/layers/effectLayer/bgEffectHandlers.ts`中的`bgEffectHandlers`加入自己的实现, 例子:
```js
let bgEffectHandlers={
  'BG_test': async function (resources, setting, options){
    return removeFunction(){
      //code
    }
  }
}

//传入的参数分别为`resources`(图片资源对应的sprite数组), `setting`(BGEffect参数), `options`(自定义参数)
//注意需要返回一个特效移除函数
```

5. 功能测试无异常后在[bgEffect特效表](https://docs.qq.com/sheet/DQ1pFSmdHbFRNd3Fu?tab=BB08J2)中自己github id后加入`(已完成)`

# 特效文档完善
[bgEffect特效表](https://docs.qq.com/sheet/DQ1pFSmdHbFRNd3Fu?tab=BB08J2)中可能没有效果示例位置, 可按如下方法获取并填入完善:

1. 在[BGEffect table](https://github.com/aizawey479/ba-data/blob/jp/Excel/ScenarioBGEffectExcelTable.json)中搜索得到当前effect的id(也可在可视化工具中获取)
2. 在[主线剧情](https://github.com/aizawey479/ba-data/blob/jp/Excel/ScenarioScriptMain2ExcelTable.json)中搜索得到effect出现位置(地址main后数字可替换)
3. 在[威威的视频](https://www.bilibili.com/list/7045822?sid=1061322&desc=1&oid=765681436&bvid=BV1Zr4y1v7ZT)中找到找到对应出现位置, 复制视频详细位置信息填入表中

# 图片资源获取
请在[特效资源后端资源地址](https://yuuka.diyigemt.com/files/ba-all-data/effectTexture/)(账号密码群中自行获取)中根据特效名寻找素材. 如找不到或原素材使用困难请自行上网寻找素材.

找到后请填入`@/stores/index.ts`中的`bgEffectImgTable`, 例子:
```js
let bgEffectImgTable: BGEffectImgTable = {
  'BG_ScrollT_0.5': ['img1.png','img2.png'],
}
```

# emitter
本层中经常使用的一个工具为`@pixi/particle-emitter`, 故对emitter有一些需要遵守的规范: 

- 如果使用[官方可视化工具](https://pixijs.io/pixi-particles-editor/), 请将获取到的json放入`@/layers/effectLayer/emitterConfigs/`, 然后使用`emitterConfigs(filename)`获取config.

- 创建`emitter`时请使用`emitterContainer`作为container参数值.

本层同时提供了一个emitter的工具函数(`emitterHelper`), 它会自行启动emitter并返回对应的终止函数.