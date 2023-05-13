import eventBus from "../../lib/eventBus";

export interface UnitTest {
  name: string;
  command: () => void;
}

export interface UnitTestCollection {
  name: string;
  tests: UnitTest[];
}

const unitTestCollections: UnitTestCollection[] = [
  {
    name: "文字层测试-dialog",
    tests: [
      {
        name: "general",
        command: () => {
          eventBus.emit("showText", {
            text: [
              {
                content: "伊甸園……出自聖典的",
                effects: [
                  {
                    name: "fontsize",
                    value: [100],
                  },
                ],
              },
              {
                content: "樂園",
                effects: [
                  {
                    name: "ruby",
                    value: ["ruby"],
                  },
                ],
              },
              {
                content: "。不存在於任何地方，也無跡可尋的場所。",
                effects: [
                  {
                    name: "fontsize",
                    value: [30],
                  },
                ],
              },
              {
                content: "。不存在於任何地方，也無跡可尋的場所。",
                effects: [
                  {
                    name: "color",
                    value: ["red"],
                  },
                ],
              },
            ],
            speaker: {
              name: "圣娅",
              nickName: "茶会",
            },
            avatarUrl:
              "https://yuuka.cdn.diyigemt.com/image/ba-all-data/UIs/01_Common/01_Character/Student_Portrait_CH0070.png",
            index: 21,
          });
        },
      },
    ],
  },
  {
    name: "文字层测试-st",
    tests: [
      {
        name: "st",
        command: () =>
          eventBus.emit("st", {
            text: [
              {
                content: "― 啊，",
                effects: [],
                waitTime: 300,
              },
              {
                content: "老师",
                effects: [],
                waitTime: 700,
              },
              {
                content: "需要",
                effects: [],
                waitTime: 400,
              },
              {
                content: "喝点水吗？",
                effects: [],
                waitTime: 400,
              },
            ],
            stArgs: [[-1200, -530], "serial", 60],
            middle: false,
          }),
      },
      {
        name: "st-middle",
        command: () =>
          eventBus.emit("st", {
            text: [
              {
                content: "― 啊，",
                effects: [],
                waitTime: 300,
              },
              {
                content: "老师",
                effects: [],
                waitTime: 700,
              },
              {
                content: "需要",
                effects: [],
                waitTime: 400,
              },
              {
                content: "喝点水吗？",
                effects: [],
                waitTime: 400,
              },
            ],
            stArgs: [[-1200, -530], "serial", 60],
            middle: true,
          }),
      },
      {
        name: "st-instant",
        command: () =>
          eventBus.emit("st", {
            text: [
              {
                content: "― 啊，",
                effects: [],
              },
              {
                content: "老师",
                effects: [],
              },
              {
                content: "需要",
                effects: [],
              },
              {
                content: "喝点水吗？",
                effects: [],
              },
            ],
            stArgs: [[-1200, -530], "instant", 60],
            middle: true,
          }),
      },
      {
        name: "st-smooth",
        command: () =>
          eventBus.emit("st", {
            text: [
              {
                content: "― 啊，",
                effects: [],
              },
              {
                content: "老师",
                effects: [],
              },
              {
                content: "需要",
                effects: [],
              },
              {
                content: "喝点水吗？",
                effects: [],
              },
            ],
            stArgs: [[-1200, -530], "smooth", 60],
            middle: true,
          }),
      },
    ],
  },
];

export default unitTestCollections;
