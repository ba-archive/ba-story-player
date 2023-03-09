import eventBus from "@/eventBus";
import { eventEmitter, storyHandler } from "@/index";
import { usePlayerStore } from "@/stores";

const keyEvent = (e: KeyboardEvent) => {
  switch (e.key) {
    case "Enter":
    case " ":
      eventBus.emit("next");
      break;
    case "ArrowUp":
      eventBus.emit("showStoryLog");
  }
};
document.addEventListener("keydown", keyEvent);
eventBus.on("dispose", () => {
  document.removeEventListener("keydown", keyEvent);
});

export const changeStoryIndex = (index?: number) => {
  if (typeof index !== "number") return;
  const allStory = usePlayerStore().allStoryUnit;
  const recentStory = allStory.slice(0, index + 1).reverse();
  const lastBg = recentStory.find((currentStoryUnit) => {
    return currentStoryUnit.bg;
  });
  // const lastBgm = recentStory.find((currentStoryUnit) => {
  //   return currentStoryUnit.audio;
  // });
  // eventEmitter.playAudio(lastBgm); 列一个 bgm 的表
  eventEmitter.showBg(lastBg);
  storyHandler.currentStoryIndex = index;
  eventBus.emit("next");
};
