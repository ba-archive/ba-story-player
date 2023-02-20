# 剧情播放器组件仓库
本仓库是剧情播放器组件仓库, 用于播放碧蓝档案游戏剧情.

注意目前播放器的宽高比会自动固定为设备宽高比, 不可改变, 全屏模式可能会出现问题, 后续会改进.

# props
## story 
type: `StoryRawUnit[]`

剧情原始数据数组.

## dataUrl
type: `string`

资源服务器地址, 用于获取立绘语音等游戏资源. 各资源的具体路径请参照`lib/utils.ts`中的`getResourcesUrl`.

## width
type: `number`

播放器宽度, 单位是px, 可变.

## storySummary
type: 
```ts
export interface StorySummary {
  /**
   * 章节名
   */
  chapterName: string,
  /**
   * 简介
   */
  summary: string
}
```

## language 
type: `'Cn'|'Jp'`

语言选项, 目前只有`Cn`和`Jp`两个选项.

## startFullScreen
type: `boolean`

是否立即全屏, 用于移动端.

## useMp3
type: `boolean`

使用mp3代替ogg格式音频, 用于解决safari浏览器的音频解码问题.

## useSuperSampling
type: `boolean`

是否使用超分素材, 目前该功能尚未实现, 选项无实际效果.

# event
## end

播放结束时发送


# 贡献说明
请参照[贡献指南](./docs/contribute.md)