import eventBus from "@/eventBus";
import { eventEmitter, storyHandler } from "@/index";
import { usePlayerStore } from "@/stores";
import { useThrottleFn } from "@vueuse/core";
function interactNext() {
  const currentStoryUnit = storyHandler.currentStoryUnit;
  if (
    currentStoryUnit?.textAbout?.options ||
    currentStoryUnit?.textAbout?.titleInfo ||
    eventEmitter.l2dPlaying
  ) {
    console.log("不允许下一步", storyHandler.currentStoryUnit);
    return;
  }
  eventBus.emit("next");
}
const throttledSkip = useThrottleFn(() => {
  interactNext();
}, 200);
const throttledNext = useThrottleFn(() => {
  interactNext();
}, 1000);

const keyEvent = (e: KeyboardEvent) => {
  // 显示历史 log 不允许操作
  if (eventEmitter.isStoryLogShow) {
    return;
  }
  switch (e.key) {
    case "Enter":
    case " ":
      throttledNext();
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

const wheelEvent = (e: WheelEvent & { [key: string]: any }) => {
  if (eventEmitter.isStoryLogShow) {
    return;
  }
  const delta = e.wheelDelta ? e.wheelDelta : -e.detail;
  if (delta < 0) {
    interactNext();
  } else {
    eventBus.emit("showStoryLog");
  }
};

document.addEventListener("keydown", keyEvent);
document.addEventListener("keyup", keyUpEvent);
document.addEventListener("wheel", wheelEvent);
eventBus.on("dispose", () => {
  document.removeEventListener("keydown", keyEvent);
  document.removeEventListener("keyup", keyUpEvent);
  document.removeEventListener("wheel", wheelEvent);
});

export const changeStoryIndex = (index?: number) => {
  index = parseInt(index + "");
  if (typeof index !== "number") return;
  index -= 1;
  const allStory = usePlayerStore().allStoryUnit;
  const recentStory = allStory.slice(0, index + 1).reverse();
  eventBus.emit("hideCharacter");
  eventBus.emit("removeEffect");
  const lastCharacterIdx = recentStory.findIndex((currentStoryUnit) => {
    return currentStoryUnit.characters?.length;
  });
  const lastCharacter = recentStory[lastCharacterIdx];
  const characters = lastCharacter?.characters || [];
  if (lastCharacter) {
    // 拼装人物层展示情况
    recentStory.slice(lastCharacterIdx + 1).some((story) => {
      if (story.characters?.length) {
        const filterSamePosition = story.characters.filter((character) => {
          return !characters.find((j) => j.position === character.position);
        });
        filterSamePosition.forEach((character) => {
          character.highlight = false;
          character.effects = [];
        });
        characters.push(...filterSamePosition);
      }
      return story.hide === "all";
    });
    setTimeout(() => {
      // 在 hideCharacter 后触发
      eventEmitter.showCharacter(lastCharacter);
    }, 4);
  }
  const lastBg = recentStory.find((currentStoryUnit) => {
    return currentStoryUnit.bg;
  });
  const lastBgm = recentStory.find((currentStoryUnit) => {
    return currentStoryUnit.audio?.bgm;
  });
  lastBgm && eventEmitter.playAudio(lastBgm);
  lastBg && eventEmitter.showBg(lastBg);
  storyHandler.currentStoryIndex = index;
  eventBus.emit("next");
};
