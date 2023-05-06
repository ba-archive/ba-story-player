import mitt from "mitt";

type BaseEvent = {
  start: number;
  pause: number;
  stop: number;
  destroy: number;
};

type CommonEvent = BaseEvent & {
  [key in keyof BaseEvent as key extends "no" ? "no" : `${key}All`]: undefined;
};

type TypingEmitter = CommonEvent & {
  complete: number;
};

const TypingEmitter = mitt<TypingEmitter>();

export default TypingEmitter;
