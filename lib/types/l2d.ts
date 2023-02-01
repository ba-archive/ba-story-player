export type IL2dConfig = {
  [key:string]:{
    name: string,
    playQue: {
      name: string;
      animation: string;
    }[],
    /** 实际上是请求的路径 */
    otherSpine: string[]
  }
}