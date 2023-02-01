export type IL2dConfig = {
  [key: string]: {
    name: string;
    playQue: {
      name: string;
      animation: string;
      /** 和后一个动画是否fade */
      fade?: boolean;
    }[];
    /** 实际上是请求的路径 */
    otherSpine: string[];
  };
};
