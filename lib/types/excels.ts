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
  "Shape": string
  "SpinePrefabName": string
  "SmallPortrait": string
}