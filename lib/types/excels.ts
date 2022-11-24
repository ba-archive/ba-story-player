export interface BGNameExcelTableItem {
  "Name": number,
  "ProductionStep": string,
  "BGFileName": string
  "BGType": "Spine" | "Image",
  "AnimationRoot": string,
  "AnimationName": string,
  "SpineScale": number,
  "SpineLocalPosX": number,
  "SpineLocalPosY": number
}

export interface CharacterNameExcelTableItem {
  "CharacterName": number,
  "ProductionStep": string
  "NameKR": string
  "NicknameKR": string
  "NameJP": string
  "NicknameJP": string
  "NameCN"?: string
  "NicknameCN"?: string
  "Shape": string
  "SpinePrefabName": string
  "SmallPortrait": string
}

export interface BGMExcelTableItem {
  "Id": number,
  "ProductionStep": string,
  "Path": string,
  "Volume": number,
  "LoopStartTime": number,
  "LoopEndTime": number,
  "LoopTranstionTime": number,
  "LoopOffsetTime": number
}

export type TransitionTypes="bgoverlap"|"fade"|"fade_white"

export interface TransitionTableItem {
  "Name": number,
  "TransitionOut": TransitionTypes,
  "TransitionOutDuration": number,
  "TransitionOutResource": null|string,
  "TransitionIn": TransitionTypes,
  "TransitionInDuration": number,
  "TransitionInResource": null|string
}