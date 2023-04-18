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

type Event = CommonEvent & {
  complete: number;
};

const emitter = mitt<Event>();

export default emitter;
