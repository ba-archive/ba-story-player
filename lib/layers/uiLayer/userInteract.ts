import eventBus from "@/eventBus";
import { eventEmitter, storyHandler } from "@/index";
import { usePlayerStore } from "@/stores";
import { useThrottleFn } from "@vueuse/core";

function interactNext(){
  const currentStoryUnit = storyHandler.currentStoryUnit;
  if (currentStoryUnit?.textAbout?.options || currentStoryUnit?.textAbout?.titleInfo || eventEmitter.l2dPlaying) {
    console.log(storyHandler.currentStoryUnit)
    return;
  }
  eventBus.emit("next");
}
const throttledSkip = useThrottleFn(() => {
  interactNext()
}, 200);
const throttledNext = useThrottleFn(() => {
  interactNext()
}, 1000);

const keyEvent = (e: KeyboardEvent) => {
  switch (e.key) {
    case "Enter":
    case " ":
      throttledNext()
      break;
    case "ArrowUp":
      eventBus.emit("showStoryLog");
      break;
    case "Control":
      // 限流
      storyHandler.isSkip = true;
      throttledSkip();
  }
};
const keyUpEvent = (e: KeyboardEvent) => {
  switch (e.key) {
    case "Control":
      storyHandler.isSkip = false;
  }
};
document.addEventListener("keydown", keyEvent);
document.addEventListener("keyup", keyUpEvent);
eventBus.on("dispose", () => {
  document.removeEventListener("keydown", keyEvent);
  document.removeEventListener("keyup", keyUpEvent);
});

export const changeStoryIndex = (index?: number) => {
  if (typeof index !== "number") return;
  index -= 1
  const allStory = usePlayerStore().allStoryUnit;
  const recentStory = allStory.slice(0, index + 1).reverse();
  const lastBg = recentStory.find((currentStoryUnit) => {
    return currentStoryUnit.bg;
  });
  const lastBgm = recentStory.find((currentStoryUnit) => {
    return currentStoryUnit.audio?.bgm;
  });
  eventEmitter.playAudio(lastBgm);
  eventEmitter.showBg(lastBg);
  storyHandler.currentStoryIndex = index;
  eventBus.emit("next");
};
