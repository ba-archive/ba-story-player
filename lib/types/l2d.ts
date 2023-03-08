export type IL2dPlayQue = {
  name: string;
  animation: string;
  fadeTime?: number;
  /** 和后一个动画是否fade */
  fade?: boolean;
}
export type IL2dConfig = {
  [key: string]: {
    name: string;
    playQue: IL2dPlayQue[];
    spineSettings?: {
      [key:string]:{
        scale?: number; // 对单个 spine 文件进行设置
      }
    },
    /** 实际上是请求的路径 */
    otherSpine?: string[];
  };
};
