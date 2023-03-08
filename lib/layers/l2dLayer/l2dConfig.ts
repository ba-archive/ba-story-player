import { IL2dConfig } from "@/types/l2d";

export const l2dConfig: IL2dConfig = {
  CH0184_home: {
    name: "CH0184_home",
    playQue: [
      {
        name: "CH0184_home",
        animation: "Start_Idle_01",
        fade: true
      },
      {
        name: "CH0184_home/CH0184_00/CH0184_00",
        animation: "Start_Idle_01",
        fade: true
      },
      {
        name: "CH0184_home",
        animation: "Start_Idle_02",
      },
    ],
    otherSpine: ["CH0184_home/CH0184_00/CH0184_00"],
  },
  CH0198_home: {
    name: "CH0198_home",
    playQue: [
      {
        name: "CH0198_home",
        animation: "Start_Idle_01",
        fadeTime: 4.8,
        fade: true
      },
      {
        name: "CH0198_home",
        animation: "Idle_01",
      },
    ],
    spineSettings: {
      CH0198_home:{
        scale: 1.5
      }
    }
  },
};
