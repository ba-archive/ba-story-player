# 通用
每层需提供一个init函数用于注册event handler(如果是组件类型则需自行使用eventBus注册).
## 事件管理
通过`eventBus.ts`导入`eventBus`.
## 可访问getter
`app`: pixi-Application实例

## 接收事件
`hide`: 清除当前内容

# 人物层
人物层负责处理人物的显示, 人物特效, 人物动作.
## 接收事件
`showCharacter`
展示人物
参数: 
```ts
 interface ShowCharacter{
      characters: Character[],
      characterEffect: CharacterEffect[],
 }
 interface Character{
      position: number,
      CharacterName: number,
      face: number,
      highlight: boolean
}
    
interface CharacterEffect{
      target: number //注意指的是position
       type:'emotion'|'action'|'signal'|'fx'
      effect: string,
      async: boolean
}
```
具体的人物特效请参考[剧情播放器人物特效索引表](https://github.com/ba-archive/blue-archive-story-viewer/issues/32)
## 发出事件
`characterDone`: 人物各种处理已完成
`playEmotionAudio`: 要求播放人物情绪特效语音
## 可使用的getter
`characterSpineData`: 根据CharacterName获取spineData
`emotionResources`: 获取人物情绪图片url, 返回一个string数组, 图片的排列按从底部到顶部, 从左到右排列.
## 需要处理的state
`currentCharacterList: CharacterInstance[]`: 当前显示的人物与其其其

# 背景层
背景层负责背景的显示
## 接收事件
`showBg`: 展示背景, 带一个string参数表示背景图片url

## 需要处理的state
`bgInstance`: 背景实例, 通过`setBgInstance`访问

# 声音层
声音层负责背景音乐, 效果音, 语音等的播放
## 接受事件
`playAudio`: 播放bgm, sound, 或voiceJP

参数:
```ts
interface PlayAudio{
    bgmUrl?:string
    soundUrl?:string
    voiceJPUrl?:string
}
```
`playEmotionAudio`: 播放人物情绪动作特效音, 参数是一个string代表人物的情绪动作

`playSelectSound`: 播放选择时的特效音

## 可使用getter
`otherSound`: 获取其他声音资源url
`emotionSoundUrl`: 获取emotion特效对应的特效音

# UI层
UI层负责UI的相关功能
## 发出事件
`skip`: 跳过剧情
`auto`: 启动自动模式
## 可使用getter
`logText`: 已播放剧情语句
`storySummary`: 剧情梗概
# 文字层
文字层负责有对话框文字, 无对话框文字, 选项的显示.
## 接收事件
`showTitle`: 显示标题, 接受一个string参数作为标题

`showPlace`: 显示地点, 接受一个string参数作为地点

`showText`: 显示普通对话框文字
参数
```ts
export interface ShowText {
  text: Text[]
  textEffect: TextEffect[]
  speaker?: Speaker
}
```

`st`: 显示无对话框文字
参数: 
```ts
interface StText{
    text: Text[]
    textEffect: TextEffect[]
    stArgs:string[] 
}
interface Text {
    content: string
    waitTime?: number
}
interface TextEffect {
    name: 'color'|'fontsize'|'ruby',,
    value: string[],
    textIndex: number
}
```
其中stArgs通常只需要注意第二个参数, serial打字机效果, instant立即全部显示.
当没有清除无对话框文字时, 新来的文字需要放在原来文字的下方.

`clearSt`: 清除无对话框文字

`option`: 显示选项
参数: ShowOption[]
```ts
interface Option {
    SelectionGroup: number,
    text: string
}
```
## 发出事件
`next`: 进入下一语句
    
`select`: 选择后加入下一剧情语句, 需要带一个number类型的参数

`playSelectSound`: 播放选择时的特效音
## 可使用getter
`nameAndNickName`: 根据CharacterName获取name和nickname
## 需要处理的state
`logText`: 已播放剧情语句, 通过`setLogText`进行修改.
# 特效层
特效层用于播放除人物相关特效外的特效
## 接收事件
`playEffect`: 播放特效
## 发出事件
`effectDone`: 特效播放完成时发出的事件
# L2D层
L2D层用于播放L2D
## 接收事件
`playL2D`: 加载L2D
`changeAnimation`: 更换动画, 接受一个string参数作为动画名
`endL2D`: 停止L2D
## 可使用getter
`l2dSpineData`: 获取l2d的spine数据


