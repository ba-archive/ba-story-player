import { IL2dConfig } from "@/types/l2d";

export const l2dConfig:IL2dConfig = {
  CH0184_home:{
    name: 'CH0184_home',
    playQue: [
      {
        name: 'CH0184_home',
        animation: 'Start_Idle_01'
      },
      {
        name: 'CH0184_home/CH0184_00/CH0184_00',
        animation: 'Start_Idle_01'
      },
      {
        name: 'CH0184_home',
        animation: 'Start_Idle_02'
      }
    ],
    otherSpine: ['CH0184_home/CH0184_00/CH0184_00']
  }
}