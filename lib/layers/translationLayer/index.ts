import { StoryRawUnit, StoryUnit } from "@/types/common";

/**
 * 将原始剧情结构翻译成标准剧情结构
 */
export function translate(rawStory: StoryRawUnit[]): StoryUnit[] {
    let result: StoryUnit[] = []
    for (let i of rawStory) {
        let { GroupId, BGMId, BGName, BGEffect, SelectionGroup, Sound, Transition, VoiceJp, PopupFileName } = i
        let unit: StoryUnit = {
            GroupId, BGMId, BGName, BGEffect, SelectionGroup, Sound, Transition, VoiceJp, PopupFileName,
            type: 'text', 
            menuState: true,
            characters: [],
            characterEffect: [],
            text: { TextJp: [] },
            textEffect: []
        }

        let ScriptKr = String(i.ScriptKr)
        console.log( ScriptKr.split('\n'))
    }
    //测试用数据
    let tempResult: StoryUnit[] = [
        {
            type: 'title',
            menuState: true,
            "GroupId": 1005302,
            "SelectionGroup": 0,
            "BGMId": 4, "Sound": "", "Transition": 0,
            "BGName": 527011333, "BGEffect": 0, "PopupFileName": "", text: { "TextJp": [{ content: "朝のジョギング", waitTime: 0 }] }, textEffect: [], "VoiceJp": "", characters: [], characterEffect: []
        },
        {
            type: 'place',
            menuState: true,
            characters: [],
            characterEffect: [],
            "GroupId": 1005302,
            "SelectionGroup": 0,
            "BGMId": 0,
            "Sound": "",
            "Transition": 0,
            "BGName": 0,
            "BGEffect": 0,
            "PopupFileName": "",
            text: { "TextJp": [{ content: "明け方の公園・散歩道", waitTime: 0 }] },
            textEffect: [],
            "VoiceJp": ""
        },
        {
            type: 'option',
            menuState: true,
            characters: [],
            characterEffect: [],
            "GroupId": 1005302,
            "SelectionGroup": 0,
            "BGMId": 0,
            "Sound": "",
            "Transition": 0,
            "BGName": 0,
            "BGEffect": 0,
            "PopupFileName": "",
            options: [
                { text: { TextJp: '少し散歩しようかなって' }, SelectionGroup: 1 },
                { text: { TextJp: 'ユウカは？' }, SelectionGroup: 2 },
            ],
            text: { TextJp: [] },
            textEffect: [],
            "VoiceJp": ""
        },
        {
            type: 'text',
            menuState: true,
            "GroupId": 1005302,
            "SelectionGroup": 1,
            "BGMId": 0,
            "Sound": "",
            "Transition": 0,
            "BGName": 0,
            "BGEffect": 0,
            "PopupFileName": "",
            characters: [{ CharacterName: 4179367264, position: 3, face: 14, highlight: true }],
            characterEffect: [],
            text: { "TextJp": [{ content: "えっと、そのですね……。" }] },
            textEffect: [],
            "VoiceJp": ""
        },
        {
            type: 'st',
            menuState: false,
            stArgs: [[-1200, -530], 'serial', 60],
            characters: [],
            characterEffect: [],
            "GroupId": 1005302,
            "SelectionGroup": 0,
            "BGMId": 0,
            "Sound": "",
            "Transition": 0,
            "BGName": 171143405,
            "BGEffect": 0,
            "PopupFileName": "",
            text: { TextJp: [{ content: '― はぁ、', waitTime: 1500 }, { content: '하아……', waitTime: 0 }] },
            textEffect: [],
            "VoiceJp": ""
        }
    ]
    return tempResult
}