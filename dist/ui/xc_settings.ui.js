"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Screen;

// ============================================================ // 衔春渲染器 / Xianchun Renderer — 预设配置 (v1.2.0)
// Copyright 2026 Xianchun / 衔春 (矞 & 雪柳)
// Licensed under the Apache License, Version 2.0
// ============================================================ 

const card_ui = __importDefault(require("./xc_card.ui.js"));
const CONFIG_ENV_KEY = "XC_RENDERER_CONFIG";

const THEMES = {
  rose: { bg: "#f8e8ee", bgDark: "#d4849a", paper: "#ffffff", ink: "#2d2d3f", muted: "#8e7e8a", accent: "#b06b8a", soft: "#faf2f5" },
  neriya: { bg: "#FADA7A", bgDark: "#03A791", paper: "#FBF8EF", ink: "#2D3F3A", muted: "#FCB454", accent: "#03A791", soft: "#B4EBE6" },
  grapefruit: { bg: "#F24855", bgDark: "#DCE225", paper: "#FFFDF9", ink: "#4A1525", muted: "#D47A82", accent: "#7e810c", soft: "#FCE1B6" },
  babyblue: { bg: "#3EA6D6", bgDark: "#8E3DBA", paper: "#F4F9FC", ink: "#1A2A50", muted: "#6A89CC", accent: "#8E3DBA", soft: "#D6EAF8" },
  vecher: { bg: "#7288ae", bgDark: "#35418f", paper: "#ffffff", ink: "#4b5694", muted: "#a993a4", accent: "#111844", soft: "#efece3" }
};

const PRESETS = [
  { id: "rose", label: "Rose" },
  { id: "neriya", label: "ネリヤカナヤ" },
  { id: "grapefruit", label: "GrapefruitMoon" },
  { id: "babyblue", label: "BABYBLUE" },
  { id: "vecher", label: "Вечер бродит" }
];

const SLOTS = [
  { key: "bg", en: "BG", zh: "背景" },
  { key: "bgDark", en: "Deep", zh: "深背景" },
  { key: "paper", en: "Paper", zh: "纸面" },
  { key: "ink", en: "Ink", zh: "文字" },
  { key: "muted", en: "Muted", zh: "辅文字" },
  { key: "accent", en: "Accent", zh: "强调" },
  { key: "soft", en: "Soft", zh: "淡色" }
];

const FONT_SIZES = [12, 13, 14, 15, 16, 18, 19, 20];
const LINE_HEIGHTS = [1.2, 1.4, 1.6, 1.8, 2];
const LETTER_SPACINGS = [0, 0.5, 1, 1.5, 2];
const WRITING_MODES = [
  { id: "horizontal-tb", label: "Horizontal 横排" },
  { id: "vertical-rl", label: "Vertical 竖排" }
];

const ALIGNS_H = [
  { id: "left", label: "Left 居左" },
  { id: "center", label: "Center 居中" },
  { id: "justify", label: "Justify 两端" }
];
const ALIGNS_V = [
  { id: "left", label: "Top 居上" },
  { id: "center", label: "Center 居中" },
  { id: "justify", label: "Justify 两端" }
];

const RUNTIME_MODES = [
  { id: "auto", label: "自动分流" },
  { id: "card", label: "指定 Card" },
  { id: "html", label: "指定 HTML" }
];

const INJECT_POSITIONS = [
  { id: "bottom", label: "末尾追加 (推荐)" },
  { id: "top", label: "置顶前置" }
];

const POEM_TITLE = "无题〔四〕";
const POEM_TITLE_ALT = "Untitled IV";
const POEM_BODY = [
  "隔江泥衔到你梁上，",
  "隔院泉挑到你怀里，",
  "海外的奢侈品舶来你胸前；",
  "我想要研究交通史。",
  "",
  "昨夜付出一片轻喟，",
  "今朝收你两朵微笑，",
  "付一支镜花，收一轮水月……",
  "我为你记下流水帐。"
];
const POEM_SIGN = "——卞之琳 《四月》〔1937〕";

const POEM_BODY_ALT = [
  "Mud across the river carried to your beams,",
  "Springs across the yard carried into your arms,",
  "Luxuries from overseas shipped before your breast;",
  "I should like to study the history of transport.",
  "",
  "Last night paid out a soft sigh,",
  "This morning received two smiles from you,",
  "Paid a flower in the mirror, received a moon in the water...",
  "I keep a running account for you."
];

const HINT_FONT_SIZE = 11;
const PRESET_NAME_MAX = 16;

const PREVIEW_MODES = [
  { id: "card", label: "Card 卡片" },
  { id: "html", label: "HTML 网页" }
];

const PREVIEW_H_HORIZONTAL = 220;
const PREVIEW_H_VERTICAL = 280;
const ROUTE_THRESHOLDS = [80, 120, 200, 300, 500, 800, 1200, 9999];

const DEFAULT_CONFIG = {
  theme: "rose",
  fontSize: 14,
  runtimeMode: "auto",
  promptInject: false,
  promptInjectPosition: "bottom",
  routeThreshold: 200,
  cardMaxHeight: 320,
  lineHeight: 1.6,
  letterSpacing: 0,
  writingMode: "horizontal-tb",
  textAlign: "left",
  serifTitle: true,
  voiceSupport: false,
  ttsEndpoint: "",
  overrides: {},
  customThemes: {},
  presetLabels: {},
  ttsCleanRegex: ["（[^）]+）", "｛[^｝]+｝", "\([^)]+\)"]
};

function Screen(ctx) {
  const [config, setConfig] = ctx.useState("config", readConfig(ctx));
  const [slotStatus, setSlotStatus] = ctx.useState("slotStatus", "点击色块可编辑色值，改动自动即时生效。");
  const [activeSlot, setActiveSlot] = ctx.useState("activeSlot", "");
  const [slotBuf, setSlotBuf] = ctx.useState("slotBuf", "");
  const [presetName, setPresetName] = ctx.useState("presetName", "");
  const [previewMode, setPreviewMode] = ctx.useState("previewMode", "html");
  const [presetEditing, setPresetEditing] = ctx.useState("presetEditing", false);
  const [cardFlipped, setCardFlipped] = ctx.useState("preview_flipped", false);
  const [ttsEditing, setTtsEditing] = ctx.useState("ttsEditing", false);
  const [ttsBuf, setTtsBuf] = ctx.useState("ttsBuf", config.ttsEndpoint || "");
  const [cleanEditing, setCleanEditing] = ctx.useState("cleanEditing", false);
  const [cleanBuf, setCleanBuf] = ctx.useState("cleanBuf", Array.isArray(config.ttsCleanRegex) ? config.ttsCleanRegex.join("\n") : (config.ttsCleanRegex || ""));

  const [block1Open, setBlock1Open] = ctx.useState("b1_open", true);
  const [block2Open, setBlock2Open] = ctx.useState("b2_open", false);
  const [block3Open, setBlock3Open] = ctx.useState("b3_open", false);

  const colors = resolveColors(config);

  async function persist(next, okText) {
    setConfig(next);
    try {
      if (!ctx.setEnv) throw new Error("当前 UI 上下文没有 setEnv 能力");
      await ctx.setEnv(CONFIG_ENV_KEY, JSON.stringify(next));
      if (okText) setSlotStatus(okText);
    } catch (e) {
      setSlotStatus("保存失败：" + (e && e.message ? e.message : String(e)));
    }
  }

  function update(key, value, okText) {
    persist(Object.assign({}, config, { [key]: value }), okText);
  }

  function selectSlot(key) {
    if (activeSlot === key) {
      setActiveSlot("");
      setSlotStatus("点击色块可编辑色值，改动自动即时生效。");
      return;
    }
    setActiveSlot(key);
    setSlotBuf(hexBody(colors[key]));
    setSlotStatus("正在编辑色位 [" + key + "]");
  }

  function onSlotInput(raw) {
    const body = hexBody(raw);
    setSlotBuf(body);
    const full = "#" + body;
    if (!isValidHex(full)) return;
    const themeId = config.theme || "rose";
    const allOv = Object.assign({}, config.overrides || {});
    const themeOv = Object.assign({}, allOv[themeId] || {});
    themeOv[activeSlot] = full.toLowerCase();
    allOv[themeId] = themeOv;
    persist(Object.assign({}, config, { overrides: allOv }), "已应用色值：" + activeSlot + " → " + full);
  }

  function resetSlot() {
    const themeId = config.theme || "rose";
    const allOv = Object.assign({}, config.overrides || {});
    const themeOv = Object.assign({}, allOv[themeId] || {});
    delete themeOv[activeSlot];
    allOv[themeId] = themeOv;
    const next = Object.assign({}, config, { overrides: allOv });
    setSlotBuf(hexBody(baseColors(next)[activeSlot]));
    persist(next, "已重置色位：" + activeSlot);
  }

  function saveAsPreset() {
    const name = String(presetName || "").trim();
    if (!name) {
      setSlotStatus("请先输入预设名称");
      return;
    }
    const id = nextThemeId(config);
    const customThemes = Object.assign({}, config.customThemes || {});
    customThemes[id] = Object.assign({}, colors);
    const presetLabels = Object.assign({}, config.presetLabels || {});
    presetLabels[id] = name;
    const fromId = config.theme || "rose";
    const allOv = Object.assign({}, config.overrides || {});
    delete allOv[fromId];
    delete allOv[id];
    setPresetName("");
    setActiveSlot("");
    persist(Object.assign({}, config, {
      customThemes: customThemes,
      presetLabels: presetLabels,
      overrides: allOv,
      theme: id
    }), "已保存并切换至新预设：" + name);
  }

  function deletePreset(id) {
    if (THEMES[id]) {
      setSlotStatus("内置预设受系统保护，不可删除");
      return;
    }
    const customThemes = Object.assign({}, config.customThemes || {});
    delete customThemes[id];
    const allOv = Object.assign({}, config.overrides || {});
    delete allOv[id];
    const presetLabels = Object.assign({}, config.presetLabels || {});
    delete presetLabels[id];
    setActiveSlot("");
    persist(Object.assign({}, config, {
      customThemes: customThemes,
      overrides: allOv,
      presetLabels: presetLabels,
      theme: config.theme === id ? "rose" : config.theme
    }), "已删除预设：" + id);
  }

  const content = [];
  content.push(header(ctx, colors));

  // ============================================================ // BLOCK 1: 排版与配色 (Typography & Palette)
  // ============================================================ 
  const wmLabel = (config.writingMode === "vertical-rl") ? "竖排" : "横排";
  const block1Tag = wmLabel + " · " + (config.fontSize || 14) + "px";
  const block1Header = sectionFoldHeader(ctx, colors, "排版与配色", "Typography & Palette", block1Open, () => setBlock1Open(!block1Open), block1Tag);
  const block1Body = [];

  if (block1Open) {
    // 预设网格
    block1Body.push(sectionCard(ctx, colors, "配色预设 / Presets", [
      chipGrid(ctx, colors, presetItems(config), 2, id => {
        setActiveSlot("");
        persist(Object.assign({}, config, { theme: id }), "已切换预设：" + id);
      }, config.theme, deletePreset)
    ]));

    // 色板 + 色值编辑 + 色板下方专属提示（已按要求移入此处）
    const paletteChildren = [
      swatchRow(ctx, colors, activeSlot, selectSlot),
      swatchLabelRow(ctx, colors, activeSlot)
    ];
    if (activeSlot) {
      paletteChildren.push(colorInputRow(ctx, colors, activeSlot, slotBuf, onSlotInput, resetSlot));
    }
    paletteChildren.push(ctx.UI.Text({
      text: slotStatus,
      style: "labelSmall",
      fontSize: HINT_FONT_SIZE,
      color: activeSlot ? colors.accent : colors.muted,
      fontWeight: activeSlot ? "bold" : "normal"
    }));
    block1Body.push(sectionCard(ctx, colors, "色板与编辑 / Palette", paletteChildren));

    // 排版参数卡片
    block1Body.push(sectionCard(ctx, colors, "正文字号 / Font Size", [
      chipGrid(ctx, colors, FONT_SIZES.map(n => ({ id: n, label: String(n) })), 4,
        n => update("fontSize", n), config.fontSize)
    ]));

    block1Body.push(sectionCard(ctx, colors, "正文行高 / Line Height", [
      chipGrid(ctx, colors, LINE_HEIGHTS.map(n => ({ id: n, label: String(n) })), 5,
        n => update("lineHeight", n), config.lineHeight)
    ]));

    block1Body.push(sectionCard(ctx, colors, "字间距 / Letter Spacing", [
      chipGrid(ctx, colors, LETTER_SPACINGS.map(n => ({ id: n, label: String(n) })), 5,
        n => update("letterSpacing", n), config.letterSpacing)
    ]));

    block1Body.push(sectionCard(ctx, colors, "排版方向 / Writing Mode", [
      chipGrid(ctx, colors, WRITING_MODES, 2,
        id => update("writingMode", id), config.writingMode)
    ]));

    const vertical = (config.writingMode || "horizontal-tb") === "vertical-rl";
    block1Body.push(sectionCard(ctx, colors, "对齐方式 / Text Align", [
      chipGrid(ctx, colors, vertical ? ALIGNS_V : ALIGNS_H, 2,
        id => update("textAlign", id), config.textAlign || "left")
    ]));

    block1Body.push(sectionCard(ctx, colors, "标题衬线 / Serif Title", [
      ctx.UI.Row({ spacing: 8, verticalAlignment: "center" }, [
        ctx.UI.Text({
          text: "Card 标题使用衬线体",
          style: "bodySmall",
          fontSize: 14,
          color: colors.ink,
          weight: 1
        }),
        ctx.UI.Switch({
          checked: config.serifTitle !== false,
          onCheckedChange: v => update("serifTitle", !!v),
          checkedTrackColor: colors.accent,
          checkedThumbColor: colors.paper
        })
      ]),
      ctx.UI.Text({
        text: "若你上传了自有字体，建议关闭，以免标题被强制替换",
        style: "labelSmall",
        fontSize: HINT_FONT_SIZE,
        color: colors.muted
      })
    ]));

    // 实时预览
    block1Body.push(sectionCard(ctx, colors, "实时预览 / Preview", [
      ctx.UI.Row({ horizontalArrangement: "end" }, [
        ctx.UI.Text({
          text: previewMode === "card"
            ? "Card: colors only / 卡片只吃配色"
            : "HTML: colors + typography / 网页吃配色与排版",
          style: "labelSmall",
          fontSize: HINT_FONT_SIZE,
          color: colors.muted,
          maxLines: 1
        })
      ]),
      chipGrid(ctx, colors, PREVIEW_MODES, 2, id => setPreviewMode(id), previewMode),
      ctx.UI.Box({ fillMaxWidth: true }, [
        ctx.UI.Box({
          fillMaxWidth: true,
          modifier: previewMode === "card" ? ctx.Modifier : ctx.Modifier.size(0, 0)
        }, [
          cardPreview(ctx, colors, config, cardFlipped, setCardFlipped)
        ]),
        ctx.UI.Box({
          fillMaxWidth: true,
          modifier: previewMode === "html" ? ctx.Modifier : ctx.Modifier.size(0, 0)
        }, [
          ctx.UI.Card({ containerColor: colors.paper, shape: { cornerRadius: 10 }, elevation: 0 }, [
            ctx.UI.WebView({
              height: vertical ? PREVIEW_H_VERTICAL : PREVIEW_H_HORIZONTAL,
              url: poemPreviewUrl(config, colors),
              javaScriptEnabled: true,
              domStorageEnabled: false,
              nestedScrollInterop: true
            })
          ])
        ])
      ]),
      ctx.UI.Text({
        text: previewMode === "card"
          ? "文字内容仅预览，实际语言由提示词决定，有翻译或额外内容时，左上角translate可点击显示翻译或额外内容，再次点击回到原文。"
          : "文字内容仅预览，实际语言由提示词决定。长文支持内部滑动浏览与风琴折叠展开。双语时，点击文字可展开对应翻译。",
        style: "labelSmall",
        fontSize: 10,
        color: colors.muted,
        maxLines: 2
      }),
      ctx.UI.Text({
        text: "theme " + (config.theme || "rose") + " / " + config.fontSize + "px / line "
          + config.lineHeight + " / space " + config.letterSpacing + "px / "
          + (config.writingMode || "horizontal-tb") + " / " + (config.textAlign || "left"),
        style: "labelSmall",
        fontSize: HINT_FONT_SIZE,
        color: colors.muted,
        maxLines: 2
      })
    ]));

    // 保存为新预设
    block1Body.push(sectionCard(ctx, colors, "保存新预设 / Save Preset", [
      ctx.UI.Row({ horizontalArrangement: "end" }, [
        ctx.UI.Text({
          text: "max " + PRESET_NAME_MAX + " chars / 最多 " + PRESET_NAME_MAX + " 字",
          style: "labelSmall",
          fontSize: HINT_FONT_SIZE,
          color: colors.muted,
          maxLines: 1
        })
      ]),
      ctx.UI.Row({ spacing: 8, verticalAlignment: "center" }, [
        presetEditing
          ? ctx.UI.Card({ containerColor: colors.soft, shape: { cornerRadius: 8 }, elevation: 0, weight: 1 }, [
              ctx.UI.TextField({
                value: presetName,
                onValueChange: v => {
                  const trimmed = String(v || "").slice(0, PRESET_NAME_MAX);
                  setPresetName(trimmed);
                },
                placeholder: "Preset name / 预设名",
                singleLine: true,
                maxLines: 1,
                style: { color: colors.ink, fontSize: 14, fontWeight: "medium" },
                padding: { horizontal: 10, vertical: 4 }
              })
            ])
          : ctx.UI.Card({
              containerColor: colors.soft,
              shape: { cornerRadius: 8 },
              elevation: 0,
              weight: 1,
              modifier: ctx.Modifier.clickable(() => setPresetEditing(true))
            }, [
              ctx.UI.Box({ padding: { horizontal: 12, vertical: 10 }, fillMaxWidth: true }, [
                ctx.UI.Text({
                  text: presetName || "+ Tap to name / 点此输入预设名",
                  fontSize: 14,
                  color: presetName ? colors.ink : colors.muted,
                  maxLines: 1
                })
              ])
            ]),
        ctx.UI.Button({
          text: "Save",
          onClick: () => {
            setPresetEditing(false);
            saveAsPreset();
          },
          containerColor: colors.accent,
          contentColor: colors.paper
        })
      ]),
      ctx.UI.Text({
        text: presetName ? "→ " + presetName : "→ ······",
        style: "labelSmall",
        fontSize: HINT_FONT_SIZE,
        color: colors.ink,
        maxLines: 1
      })
    ]));

    block1Body.push(ctx.UI.Row({ spacing: 8, horizontalArrangement: "end", padding: { bottom: 4, top: 2 } }, [
      ctx.UI.Button({
        text: "Reset Colors / 重置当前配色",
        onClick: () => {
          const themeId = config.theme || "rose";
          const allOv = Object.assign({}, config.overrides || {});
          delete allOv[themeId];
          setActiveSlot("");
          setSlotBuf("");
          persist(Object.assign({}, config, { overrides: allOv }), "已重置当前配色：" + themeId);
        },
        containerColor: colors.soft,
        contentColor: colors.accent
      })
    ]));
  }
  content.push(flatBlockWrapper(ctx, block1Header, block1Body));

  // ============================================================ // BLOCK 2: 运行模式与提示词 (Runtime & Prompt)
  // ============================================================ 
  const block2Header = sectionFoldHeader(ctx, colors, "运行模式与提示词", "Runtime & Prompt", block2Open, () => setBlock2Open(!block2Open), (config.runtimeMode === "card" ? "指定Card" : config.runtimeMode === "html" ? "指定HTML" : "自动分流") + (config.promptInject ? " · 注入ON" : ""));
  const block2Body = [];

  if (block2Open) {
    block2Body.push(sectionCard(ctx, colors, "通道模式 / Runtime Mode", [
      chipGrid(ctx, colors, RUNTIME_MODES, 3, id => update("runtimeMode", id, "通道模式已切换：" + id), config.runtimeMode || "auto"),
      ctx.UI.Text({
        text: "自动分流：默认智能分流；指定Card：纯卡片（旁路语音）；指定HTML：长卷网页。",
        style: "labelSmall",
        fontSize: HINT_FONT_SIZE,
        color: colors.muted
      })
    ]));

    block2Body.push(sectionCard(ctx, colors, "分流阈值 / Route Threshold", [
      chipGrid(ctx, colors, ROUTE_THRESHOLDS.map(n => ({ id: n, label: String(n) })), 4,
        n => update("routeThreshold", n, "分流阈值已设为：" + n), config.routeThreshold || DEFAULT_CONFIG.routeThreshold),
      ctx.UI.Text({
        text: "仅在「自动分流」模式下生效：字数不足此值走 Card，超过则走 HTML 网页。",
        style: "labelSmall",
        fontSize: HINT_FONT_SIZE,
        color: colors.muted
      })
    ]));

    block2Body.push(sectionCard(ctx, colors, "自动注入协议 / Auto Inject", [
      ctx.UI.Row({ spacing: 8, verticalAlignment: "center" }, [
        ctx.UI.Text({
          text: "启用系统提示词自动注入",
          style: "bodySmall",
          fontSize: 13.5,
          fontWeight: "bold",
          color: colors.ink,
          weight: 1
        }),
        ctx.UI.Switch({
          checked: config.promptInject === true,
          onCheckedChange: v => update("promptInject", !!v, v ? "已开启提示词自动注入 ✓" : "已关闭提示词自动注入"),
          checkedTrackColor: colors.accent,
          checkedThumbColor: colors.paper
        })
      ]),
      ctx.UI.Text({
        text: "开启后，无需手动复制，渲染器将在后台自动将格式协议注入系统提示词。",
        style: "labelSmall",
        fontSize: HINT_FONT_SIZE,
        color: colors.muted
      }),
      config.promptInject === true ? ctx.UI.Column({ spacing: 6, padding: { top: 6 } }, [
        ctx.UI.Text({ text: "注入位置：", fontSize: 12, fontWeight: "bold", color: colors.ink }),
        chipGrid(ctx, colors, INJECT_POSITIONS, 2, id => update("promptInjectPosition", id, "注入位置已设为：" + id), config.promptInjectPosition || "bottom")
      ]) : ctx.UI.Box(),
      ctx.UI.Spacer({ height: 4 }),
      ctx.UI.Text({
        text: "※ 具体提示词内容请前往「渲染指引」页面查看、定制或一键复制。",
        fontSize: 11,
        color: colors.accent,
        fontWeight: "bold"
      })
    ]));
  }
  content.push(flatBlockWrapper(ctx, block2Header, block2Body));

  // ============================================================ // BLOCK 3: 单句语音支持 (Voice & TTS)
  // ============================================================ 
  const block3Header = sectionFoldHeader(ctx, colors, "单句语音", "Voice & TTS", block3Open, () => setBlock3Open(!block3Open), config.voiceSupport ? "已启用" : "未开启");
  const block3Body = [];

  if (block3Open) {
    block3Body.push(sectionCard(ctx, colors, "单句发音 / Voice Support", [
      ctx.UI.Row({ spacing: 8, verticalAlignment: "center" }, [
        ctx.UI.Text({
          text: "启用单句语音渲染",
          style: "bodySmall",
          fontSize: 13.5,
          fontWeight: "bold",
          color: colors.ink,
          weight: 1
        }),
        ctx.UI.Switch({
          checked: config.voiceSupport === true,
          onCheckedChange: v => update("voiceSupport", !!v, v ? "单句语音渲染已启用 ✓" : "单句语音渲染已关闭"),
          checkedTrackColor: colors.accent,
          checkedThumbColor: colors.paper
        })
      ]),
      ctx.UI.Text({
        text: "支持单句发音时仅走 HTML 网页格式；若上方开启「指定Card」，此处自动旁路关闭。",
        style: "labelSmall",
        fontSize: HINT_FONT_SIZE,
        color: colors.muted
      }),
      ctx.UI.Text({
        text: "默认关闭：完全遵循分流指令，保留纯净 Card 卡片，无多余按键干扰排版。",
        style: "labelSmall",
        fontSize: HINT_FONT_SIZE,
        color: colors.muted
      })
    ]));

    if (config.voiceSupport === true) {
      block3Body.push(sectionCard(ctx, colors, "接口地址 / Endpoint", [
        ctx.UI.Row({ spacing: 8, verticalAlignment: "center" }, [
          ttsEditing
            ? ctx.UI.Card({ containerColor: colors.soft, shape: { cornerRadius: 8 }, elevation: 0, weight: 1 }, [
                ctx.UI.TextField({
                  value: ttsBuf,
                  onValueChange: v => setTtsBuf(String(v || "")),
                  placeholder: "https://your-tts-host.com/tts_proxy",
                  singleLine: true,
                  maxLines: 1,
                  style: { color: colors.ink, fontSize: 13 },
                  padding: { horizontal: 10, vertical: 6 }
                })
              ])
            : ctx.UI.Card({
                containerColor: colors.soft,
                shape: { cornerRadius: 8 },
                elevation: 0,
                weight: 1,
                modifier: ctx.Modifier.clickable(() => {
                  setTtsBuf(config.ttsEndpoint || "");
                  setTtsEditing(true);
                })
              }, [
                ctx.UI.Box({ padding: { horizontal: 10, vertical: 8 }, fillMaxWidth: true }, [
                  ctx.UI.Text({
                    text: config.ttsEndpoint || "+ Tap to set TTS URL / 点此配置接口地址",
                    fontSize: 13,
                    color: config.ttsEndpoint ? colors.ink : colors.muted,
                    maxLines: 1
                  })
                ])
              ]),
          ctx.UI.Card({
            containerColor: colors.accent,
            shape: { cornerRadius: 8 },
            elevation: 0,
            modifier: ctx.Modifier.clickable(() => {
              if (ttsEditing) {
                const nextUrl = String(ttsBuf || "").trim();
                update("ttsEndpoint", nextUrl, nextUrl ? "TTS 地址已保存 ✓" : "TTS 地址已清空");
                setTtsEditing(false);
              } else {
                setTtsBuf(config.ttsEndpoint || "");
                setTtsEditing(true);
              }
            })
          }, [
            ctx.UI.Text({
              text: ttsEditing ? "Save / 保存" : "Edit / 编辑",
              fontSize: 12,
              fontWeight: "bold",
              color: colors.paper,
              padding: { horizontal: 12, vertical: 8 }
            })
          ])
        ]),
        ctx.UI.Text({
          text: "提示：接口支持 {text}、{emotion} 等 URL 参数，需为 HTTPS 或支持局域网直接访问。",
          style: "labelSmall",
          fontSize: HINT_FONT_SIZE,
          color: colors.muted
        })
      ]));

      const customList = Array.isArray(config.ttsCleanRegex) ? config.ttsCleanRegex : [];
      const hasCustom = customList.length > 0;

      block3Body.push(sectionCard(ctx, colors, "正则清洗 / Cleaner", [
        ctx.UI.Row({ verticalAlignment: "center", horizontalArrangement: "spaceBetween" }, [
          ctx.UI.Text({
            text: "发音前过滤匹配文本 (每行一条)",
            style: "bodySmall",
            fontSize: 13,
            color: colors.ink
          }),
          ctx.UI.Row({ spacing: 6 }, [
            cleanEditing
              ? ctx.UI.Card({
                  containerColor: colors.soft,
                  shape: { cornerRadius: 6 },
                  elevation: 0,
                  modifier: ctx.Modifier.clickable(() => setCleanEditing(false))
                }, [
                  ctx.UI.Text({ text: "取消", fontSize: 12, color: colors.ink, padding: { horizontal: 8, vertical: 5 } })
                ])
              : ctx.UI.Box(),
            ctx.UI.Card({
              containerColor: colors.accent,
              shape: { cornerRadius: 6 },
              elevation: 0,
              modifier: ctx.Modifier.clickable(() => {
                if (cleanEditing) {
                  const lines = String(cleanBuf || "")
                    .split(/\r?\n/)
                    .map(l => l.trim())
                    .filter(l => l.length > 0);
                  update("ttsCleanRegex", lines, lines.length > 0 ? ("已保存 " + lines.length + " 条自定义正则 ✓") : "已恢复默认清理规则");
                  setCleanEditing(false);
                } else {
                  const cur = Array.isArray(config.ttsCleanRegex) ? config.ttsCleanRegex.join("\n") : "";
                  setCleanBuf(cur);
                  setCleanEditing(true);
                }
              })
            }, [
              ctx.UI.Text({
                text: cleanEditing ? "Save / 保存" : "Edit / 编辑",
                fontSize: 12,
                fontWeight: "bold",
                color: colors.paper,
                padding: { horizontal: 10, vertical: 5 }
              })
            ])
          ])
        ]),
        cleanEditing
          ? ctx.UI.Card({ containerColor: colors.soft, shape: { cornerRadius: 8 }, elevation: 0, fillMaxWidth: true }, [
              ctx.UI.TextField({
                value: cleanBuf,
                onValueChange: v => setCleanBuf(String(v || "")),
                placeholder: "每行一条正则表达式。例如：\n（[^）]+）\n｛[^｝]+｝\n\\([^)]+\\)",
                singleLine: false,
                maxLines: 6,
                style: { color: colors.ink, fontSize: 12 },
                padding: { horizontal: 12, vertical: 10 }
              })
            ])
          : ctx.UI.Card({
              containerColor: colors.soft,
              shape: { cornerRadius: 8 },
              elevation: 0,
              fillMaxWidth: true,
              modifier: ctx.Modifier.clickable(() => {
                const cur = hasCustom ? customList.join("\n") : "";
                setCleanBuf(cur);
                setCleanEditing(true);
              })
            }, [
              ctx.UI.Column({ padding: { horizontal: 12, vertical: 10 }, fillMaxWidth: true }, [
                ctx.UI.Text({
                  text: hasCustom ? ("已配置 " + customList.length + " 条过滤规则：") : "未配置自定义正则 (点此或按 Edit 添加)",
                  fontSize: 11.5,
                  fontWeight: hasCustom ? "bold" : "normal",
                  color: hasCustom ? colors.accent : colors.muted
                }),
                hasCustom ? ctx.UI.Spacer({ height: 4 }) : ctx.UI.Box(),
                hasCustom ? ctx.UI.Text({
                  text: customList.join("\n"),
                  fontSize: 12,
                  lineHeight: 1.45,
                  color: colors.ink,
                  maxLines: 6
                }) : ctx.UI.Box()
              ])
            ])
      ]));
    }
  }
  content.push(flatBlockWrapper(ctx, block3Header, block3Body));

  return ctx.UI.Card({
    containerColor: colors.bg,
    shape: { cornerRadius: 20 },
    elevation: 0,
    modifier: ctx.Modifier.safeDrawingPadding()
  }, [
    ctx.UI.LazyColumn({ padding: { horizontal: 14, vertical: 14 }, spacing: 10 }, content)
  ]);

  function presetItems(cfg) {
    const items = PRESETS.map(p => ({ id: p.id, label: p.label, custom: false }));
    const custom = cfg.customThemes || {};
    const labels = cfg.presetLabels || {};
    Object.keys(custom).forEach(id => {
      if (!THEMES[id]) items.push({ id: id, label: labels[id] || id, custom: true });
    });
    return items;
  }
}

// ============================================================ // 扁平化无嵌套组件（彻底告别层层套娃与崩溃）
// ============================================================ 

function sectionFoldHeader(ctx, colors, titleZh, titleEn, isOpen, onToggle, tagText) {
  return ctx.UI.Card({
    containerColor: colors.paper,
    shape: { cornerRadius: 14 },
    elevation: 0,
    modifier: ctx.Modifier.clickable(onToggle)
  }, [
    ctx.UI.Row({
      spacing: 10,
      verticalAlignment: "center",
      padding: { horizontal: 14, vertical: 12 },
      fillMaxWidth: true
    }, [
      ctx.UI.Text({
        text: isOpen ? "▼" : "▶",
        fontSize: 12,
        fontWeight: "bold",
        color: colors.accent
      }),
      ctx.UI.Column({ spacing: 2, weight: 1 }, [
        ctx.UI.Text({
          text: titleZh,
          style: "titleSmall",
          fontSize: 14.5,
          fontWeight: "bold",
          color: colors.ink
        }),
        ctx.UI.Text({
          text: titleEn,
          fontSize: 11,
          color: colors.muted,
          letterSpacing: 0.2
        })
      ]),
      tagText ? ctx.UI.Card({
        containerColor: colors.soft,
        shape: { cornerRadius: 6 },
        elevation: 0
      }, [
        ctx.UI.Text({
          text: tagText,
          fontSize: 11,
          fontWeight: "bold",
          color: colors.accent,
          padding: { horizontal: 8, vertical: 4 }
        })
      ]) : ctx.UI.Box()
    ])
  ]);
}

function flatBlockWrapper(ctx, headerNode, bodyChildren) {
  const list = [headerNode];
  if (bodyChildren && bodyChildren.length > 0) {
    for (let i = 0; i < bodyChildren.length; i++) {
      list.push(bodyChildren[i]);
    }
  }
  return ctx.UI.Column({ spacing: 8, fillMaxWidth: true }, list);
}

function header(ctx, colors) {
  return ctx.UI.Row({ spacing: 6, verticalAlignment: "center", padding: { horizontal: 4, bottom: 2 } }, [
    ctx.UI.Icon({ name: "eco", tint: colors.bgDark, size: 16 }),
    ctx.UI.Text({ text: "衔春 · 预设配置", style: "titleSmall", fontSize: 15, fontWeight: "bold", color: colors.accent }),
    ctx.UI.Text({ text: "v1.2.0", style: "labelSmall", fontSize: 10, color: colors.muted })
  ]);
}

function sectionCard(ctx, colors, title, children) {
  const inner = [
    ctx.UI.Text({ text: title, style: "titleSmall", fontSize: 13.5, fontWeight: "bold", color: colors.accent })
  ].concat(children);
  return ctx.UI.Card({ containerColor: colors.paper, shape: { cornerRadius: 14 }, elevation: 0 }, [
    ctx.UI.Column({ padding: { horizontal: 12, vertical: 11 }, spacing: 8 }, inner)
  ]);
}

function chipGrid(ctx, colors, items, perRow, onPick, current, onDelete) {
  const rows = [];
  for (let i = 0; i < items.length; i += perRow) {
    const cells = items.slice(i, i + perRow).map(it => {
      const active = sameValue(it.id, current);
      const del = (onDelete && it.custom && active) ? (() => onDelete(it.id)) : null;
      return chip(ctx, colors, it.label, active, () => onPick(it.id), del);
    });
    while (cells.length < perRow) {
      cells.push(ctx.UI.Column({ weight: 1 }, [ctx.UI.Spacer({ height: 1 })]));
    }
    rows.push(ctx.UI.Row({ spacing: 8, verticalAlignment: "center" }, cells));
  }
  return ctx.UI.Column({ spacing: 8 }, rows);
}

function chip(ctx, colors, label, active, onClick, onDelete) {
  const labelColor = active ? colors.accent : colors.ink;
  const body = [
    ctx.UI.Text({
      text: label,
      style: "bodySmall",
      fontSize: 13.5,
      fontWeight: active ? "bold" : "medium",
      color: labelColor,
      maxLines: 1,
      weight: onDelete ? 1 : undefined
    })
  ];
  if (onDelete) {
    body.push(ctx.UI.Icon({
      name: "close",
      tint: labelColor,
      size: 16,
      modifier: ctx.Modifier.clickable(onDelete)
    }));
  }
  return ctx.UI.Card({
    containerColor: active ? colors.soft : colors.paper,
    shape: { cornerRadius: 10 },
    elevation: active ? 0 : 1,
    weight: 1,
    modifier: ctx.Modifier.clickable(onClick)
  }, [
    onDelete
      ? ctx.UI.Row({ padding: { horizontal: 10, vertical: 10 }, spacing: 6, verticalAlignment: "center" }, body)
      : ctx.UI.Column({ padding: { horizontal: 10, vertical: 10 }, horizontalAlignment: "center" }, body)
  ]);
}

function swatchRow(ctx, colors, activeSlot, onPick) {
  return ctx.UI.Row({ spacing: 6, verticalAlignment: "center" }, SLOTS.map(s =>
    ctx.UI.Card({
      containerColor: colors[s.key],
      shape: { cornerRadius: 8 },
      elevation: activeSlot === s.key ? 3 : 1,
      weight: 1,
      modifier: ctx.Modifier.clickable(() => onPick(s.key))
    }, [
      ctx.UI.Spacer({ height: 38 })
    ])
  ));
}

function swatchLabelRow(ctx, colors, activeSlot) {
  return ctx.UI.Row({ spacing: 6, verticalAlignment: "top" }, SLOTS.map(s =>
    ctx.UI.Column({ weight: 1, horizontalAlignment: "center", spacing: 0 }, [
      ctx.UI.Text({
        text: s.en,
        style: "labelSmall",
        fontSize: 10,
        fontWeight: activeSlot === s.key ? "bold" : "normal",
        color: activeSlot === s.key ? colors.accent : colors.muted,
        maxLines: 1
      }),
      ctx.UI.Text({
        text: s.zh,
        style: "labelSmall",
        fontSize: 9,
        color: activeSlot === s.key ? colors.accent : colors.muted,
        maxLines: 1
      })
    ])
  ));
}

function colorInputRow(ctx, colors, activeSlot, buf, onInput, onReset) {
  const slot = SLOTS.filter(s => s.key === activeSlot)[0] || SLOTS[0];
  return ctx.UI.Card({ containerColor: colors.soft, shape: { cornerRadius: 10 }, elevation: 0 }, [
    ctx.UI.Row({ spacing: 7, verticalAlignment: "center", padding: { horizontal: 9, vertical: 7 } }, [
      ctx.UI.Column({ spacing: 2, horizontalAlignment: "center" }, [
        ctx.UI.Card({ containerColor: colors[activeSlot], shape: { cornerRadius: 6 }, elevation: 0 }, [
          ctx.UI.Spacer({ width: 28, height: 20 })
        ]),
        ctx.UI.Text({
          text: slot.en,
          style: "labelSmall",
          fontSize: HINT_FONT_SIZE,
          fontWeight: "bold",
          color: colors.ink,
          maxLines: 1
        }),
        ctx.UI.Text({
          text: buf ? "#" + buf : "#······",
          style: "labelSmall",
          fontSize: HINT_FONT_SIZE,
          color: colors.ink,
          maxLines: 1
        })
      ]),
      ctx.UI.Text({ text: "#", fontSize: 14, fontWeight: "bold", color: colors.ink }),
      ctx.UI.Card({ containerColor: colors.paper, shape: { cornerRadius: 8 }, elevation: 0, weight: 1 }, [
        ctx.UI.TextField({
          value: buf,
          onValueChange: onInput,
          placeholder: "2d2d3f",
          singleLine: true,
          maxLines: 1,
          style: { color: colors.ink, fontSize: 13.5, fontWeight: "medium" },
          padding: { horizontal: 8, vertical: 2 }
        })
      ]),
      ctx.UI.Card({
        containerColor: colors.paper,
        shape: { cornerRadius: 8 },
        elevation: 0,
        modifier: ctx.Modifier.clickable(onReset)
      }, [
        ctx.UI.Text({
          text: "Reset",
          style: "labelSmall",
          fontSize: 11,
          color: colors.accent,
          padding: { horizontal: 8, vertical: 6 }
        })
      ])
    ])
  ]);
}

function poemPreviewUrl(config, colors) {
  const fs = Number(config.fontSize) || 14;
  const lh = Number(config.lineHeight) || 1.6;
  const ls = Number(config.letterSpacing) || 0;
  const wm = config.writingMode || "horizontal-tb";
  const ta = config.textAlign || "left";

  const paras = POEM_BODY.join("\n").split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 0);
  const parasAlt = POEM_BODY_ALT.join("\n").split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 0);

  const bodyHtml = paras.map((p, i) => {
    const alt = parasAlt[i] || "";
    const pLines = p.split("\n").join("<br>");
    const altLines = alt.split("\n").join("<br>");
    return '<details class="xc-para-fold" open>'
      + '<summary class="xc-para-head">' + pLines + '</summary>'
      + '<div class="xc-para-alt">' + altLines + '</div>'
      + '</details>';
  }).join("");

  const html = '<!DOCTYPE html><html><head>'
    + '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">'
    + '<style>'
    + '*{margin:0;padding:0;box-sizing:border-box;touch-action:pan-x pan-y}'
    + 'html,body{height:100%}'
    + 'body{font-family:system-ui,-apple-system,sans-serif;'
    + 'font-size:' + fs + 'px;color:' + colors.ink + ';background:' + colors.paper + ';'
    + 'line-height:' + lh + ';letter-spacing:' + ls + 'px;'
    + 'writing-mode:' + wm + ';text-align:' + ta + ';'
    + 'padding:14px;overflow:auto}'
    + 'h1{font-size:1.15em;font-weight:700;color:' + colors.accent + ';margin-bottom:0.6em;' + (config.serifTitle !== false ? 'font-family:serif;' : '') + '}'
    + '.xc-para-fold{margin-bottom:0.8em}'
    + '.xc-para-fold:last-child{margin-bottom:0}'
    + '.xc-para-head{cursor:pointer;list-style:none;outline:none}'
    + '.xc-para-head::-webkit-details-marker{display:none}'
    + '.xc-para-alt{margin-top:0.35em;padding:0 0 0 8px;color:' + colors.muted + ';font-size:0.9em;line-height:' + lh + ';border-left:2px solid ' + colors.bgDark + ';}'
    + '.sign{color:' + colors.muted + ';font-size:0.85em;margin-top:0.8em}'
    + '</style></head><body>'
    + '<h1>' + POEM_TITLE + '</h1>'
    + bodyHtml
    + '<p class="sign">' + POEM_SIGN + '</p>'
    + '</body></html>';
  return "data:text/html;charset=utf-8," + encodeURIComponent(html);
}

function cardPreview(ctx, colors, config, flipped, setFlipped) {
  const paras = POEM_BODY.join("\n").split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 0);
  const parasAlt = POEM_BODY_ALT.join("\n").split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 0);
  const activeParas = flipped ? parasAlt : paras;
  const activeTitle = flipped ? POEM_TITLE_ALT : POEM_TITLE;
  const fs = Number(config.fontSize) || 14;
  const lh = Number(config.lineHeight) || 1.6;

  const flipBtnProps = {
    text: flipped ? "Original ⇄" : "Translate ⇄",
    fontSize: 10,
    fontWeight: "medium",
    color: colors.accent,
    maxLines: 1,
    modifier: ctx.Modifier.clickable(() => { setFlipped(!flipped); })
  };

  return ctx.UI.Card({
    containerColor: colors.paper,
    shape: { cornerRadius: 12 },
    elevation: 0,
    modifier: ctx.Modifier.fillMaxWidth()
  }, [
    ctx.UI.Column({ padding: { horizontal: 16, vertical: 14 }, spacing: 10 }, [
      ctx.UI.Row({
        verticalAlignment: "center",
        spacing: 6,
        fillMaxWidth: true
      }, [
        ctx.UI.Icon({ name: "eco", tint: colors.bgDark, size: 16 }),
        ctx.UI.Text({ text: "·", fontSize: 16, fontWeight: "bold", color: colors.bgDark }),
        ctx.UI.Text(flipBtnProps)
      ]),
      ctx.UI.Column({ spacing: 2 }, [
        ctx.UI.Text({
          text: activeTitle,
          fontSize: 15,
          fontWeight: "bold",
          color: colors.ink,
          fontFamily: config.serifTitle !== false ? "serif" : undefined
        }),
        ctx.UI.Text({ text: POEM_SIGN, fontSize: 11, color: colors.muted })
      ]),
      ctx.UI.Column({ spacing: Math.max(6, Math.round(fs * (lh - 1))) },
        activeParas.map((p, i) => ctx.UI.Row({ key: "p" + i, fillMaxWidth: true }, [
          ctx.UI.Text({
            text: p,
            style: "bodyMedium",
            fontSize: fs,
            color: flipped ? colors.accent : colors.ink,
            softWrap: true,
            weight: 1
          })
        ]))
      )
    ])
  ]);
}

function hexBody(raw) {
  let s = String(raw == null ? "" : raw).trim();
  s = s.replace(/[^0-9a-fA-F]/g, "");
  if (s.length > 8) s = s.slice(0, 8);
  return s;
}

function isValidHex(s) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(String(s || ""));
}

function baseColors(config) {
  const custom = config.customThemes && typeof config.customThemes === "object" ? config.customThemes : {};
  const base = custom[config.theme] || THEMES[config.theme] || THEMES.rose;
  const out = {};
  SLOTS.forEach(s => { out[s.key] = base[s.key] || THEMES.rose[s.key]; });
  return out;
}

function resolveColors(config) {
  const base = baseColors(config);
  const ov = (config.overrides && config.overrides[config.theme]) || {};
  const out = {};
  SLOTS.forEach(s => { out[s.key] = ov[s.key] || base[s.key]; });
  return out;
}

function nextThemeId(config) {
  const custom = (config && config.customThemes) || {};
  let max = 0;
  Object.keys(custom).forEach(k => {
    const m = /^theme_(\d+)$/.exec(k);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  });
  return "theme_" + (max + 1);
}

function sameValue(a, b) {
  if (typeof a === "number" || typeof b === "number") return Number(a) === Number(b);
  return String(a) === String(b);
}

function readConfig(ctx) {
  try {
    const raw = ctx.getEnv ? ctx.getEnv(CONFIG_ENV_KEY) : "";
    if (!raw) return Object.assign({}, DEFAULT_CONFIG);
    const parsed = JSON.parse(String(raw));
    return Object.assign({}, DEFAULT_CONFIG, parsed && typeof parsed === "object" ? parsed : {});
  } catch (_) {
    return Object.assign({}, DEFAULT_CONFIG);
  }
}
