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
                    value: ["100"],
                  },
                ],
              },
              {
                content: "樂園乐园乐园乐园",
                effects: [
                  {
                    name: "ruby",
                    value: ["ruby and ruby"],
                  },
                ],
              },
              {
                content: "。不存在於任何地方，也無跡可尋的場所。",
                effects: [
                  {
                    name: "fontsize",
                    value: ["30"],
                  },
                ],
              },
              {
                content: "不存在於任何地方，也無跡可尋的場所。",
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
      {
        name: "tooltip",
        command() {
          eventBus.emit("showText", {
            text: [
              {
                content: "左边",
                effects: [
                  {
                    name: "tooltip",
                    value: ["这是一段很长很长的tooltip以至于它都碰到左边界了"],
                  },
                ],
              },
              {
                content: ", 这是用来填充中间的空白的",
                effects: [],
              },
              {
                content: "中间",
                effects: [
                  {
                    name: "tooltip",
                    value: ["这是测试中间tooltip的"],
                  },
                ],
              },
              {
                content: ", 这是用来填充中间的空空空空空白白白白白的, ",
                effects: [],
              },
              {
                content: "这是一段用来测试换行的, 所以它很长很长很长很长",
                effects: [
                  {
                    name: "tooltip",
                    value: [
                      "这是测试换行tooltip的, 顺便测试右边界, 所以它也很长长长长",
                    ],
                  },
                ],
              },
            ],
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
