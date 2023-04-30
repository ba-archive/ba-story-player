import { IL2dConfig } from "@/types/l2d";

export const l2dConfig: IL2dConfig = {
  CH0184_home: {
    name: "CH0184_home",
    playQue: [
      {
        name: "CH0184_home",
        animation: "Start_Idle_01",
        fade: true,
      },
      {
        name: "CH0184_home/CH0184_00/CH0184_00",
        animation: "Start_Idle_01",
        fade: true,
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
        fade: true,
      },
      {
        name: "CH0198_home",
        animation: "Idle_01",
      },
    ],
    spineSettings: {
      CH0198_home: {
        scale: 1.5,
      },
    },
  },
  CH0087_home: {
    name: "CH0087_home",
    playQue: [
      {
        name: "CH0087_home",
        animation: "Start_Idle_01",
        fadeTime: 4.8,
        fade: true,
      },
      {
        name: "CH0087_home",
        animation: "Idle_01",
      },
    ],
    spineSettings: {
      CH0087_home: {
        scale: 1.3,
      },
    },
  },
  CH0107_home: {
    name: "CH0107_home",
    playQue: [
      {
        name: "CH0107_home",
        animation: "Start_Idle_01",
        fadeTime: 4.2,
        secondFadeTime: 8.2,
        fade: true,
      },
      {
        name: "CH0107_home",
        animation: "Idle_01",
      },
    ],
    spineSettings: {
      CH0107_home: {
        scale: 1.3,
      },
    },
  },
  CH0086_home: {
    name: "CH0087_home",
    playQue: [
      {
        name: "CH0087_home",
        animation: "Start_Idle_01",
        fadeTime: 4.3,
        fade: true,
      },
      {
        name: "CH0087_home",
        animation: "Idle_01",
      },
    ],
    spineSettings: {
      CH0087_home: {
        scale: 2,
      },
    },
  },
  CH0200_home: {
    name: "CH0200_home",
    playQue: [
      {
        name: "CH0200_home",
        animation: "Start_Idle_01",
        fadeTime: 4.3,
        fade: true,
      },
      {
        name: "CH0200_home",
        animation: "Idle_01",
      },
    ],
  },
};
