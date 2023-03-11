import Typed from "typed.js";

declare module "typed.js" {
  declare interface TypedExtend extends Typed {
    strings: string[]; // 要打印的内容
    pause: {
      // 暂停时保存的回复参数
      curStrPos: number; // 暂停前字符串指针位置
      curString: string; // 暂停前打印的字符串
      status: boolean; // 是否在暂停
      typewrite: boolean; // 是否是在打印, 如果为false表示暂停前在删除
    };
    strPos: number; // 开始位置, 已废弃
    options: TypedOptions; // 初始化参数
    startDelay: number; // 开始时延, 已废弃
    typingComplete: boolean; // 是否打印完成, 如果为true会忽略start()方法
    timeout: Nodejs.Timeout; // 打字机内部循环handler
    isSt: boolean; // 是否在显示特效字, 为true会在clearSt事件前将拿到的st特效append上去
  }
  declare interface TypedOptions {
    /**
     * strings to be typed
     */
    strings?: string[];
    /**
     * ID or instance of HTML element of element containing string children
     */
    stringsElement?: string | Element;
    /**
     * type speed in milliseconds
     */
    typeSpeed?: number;
    /**
     * time before typing starts in milliseconds
     */
    startDelay?: number;
    /**
     * backspacing speed in milliseconds
     */
    backSpeed?: number;
    /**
     * only backspace what doesn't match the previous string
     */
    smartBackspace?: boolean;
    /**
     * shuffle the strings
     */
    shuffle?: boolean;
    /**
     * time before backspacing in milliseconds
     */
    backDelay?: number;
    /**
     * Fade out instead of backspace
     */
    fadeOut?: boolean;
    /**
     * css class for fade animation
     */
    fadeOutClass?: string;
    /**
     * Fade out delay in milliseconds
     */
    fadeOutDelay?: number;
    /**
     * loop strings
     */
    loop?: boolean;
    /**
     * amount of loops
     */
    loopCount?: number;
    /**
     * show cursor
     */
    showCursor?: boolean;
    /**
     * character for cursor
     */
    cursorChar?: string;
    /**
     * insert CSS for cursor and fadeOut into HTML
     */
    autoInsertCss?: boolean;
    /**
     * attribute for typing Ex: input placeholder, value, or just HTML text
     */
    attr?: string;
    /**
     * bind to focus and blur if el is text input
     */
    bindInputFocusEvents?: boolean;
    /**
     * 'html' or 'null' for plaintext
     */
    contentType?: string;
    /**
     * All typing is complete
     */
    onComplete?(self: Typed): void;
    /**
     * Before each string is typed
     */
    preStringTyped?(arrayPos: number, self: Typed): void;
    /**
     * After each string is typed
     */
    onStringTyped?(arrayPos: number, self: Typed): void;
    /**
     * During looping, after last string is typed
     */
    onLastStringBackspaced?(self: Typed): void;
    /**
     * Typing has been stopped
     */
    onTypingPaused?(arrayPos: number, self: Typed): void;
    /**
     * Typing has been started after being stopped
     */
    onTypingResumed?(arrayPos: number, self: Typed): void;
    /**
     * After reset
     */
    onReset?(self: Typed): void;
    /**
     * After stop
     */
    onStop?(arrayPos: number, self: Typed): void;
    /**
     * After start
     */
    onStart?(arrayPos: number, self: Typed): void;
    /**
     * After destroy
     */
    onDestroy?(self: Typed): void;
  }
}
