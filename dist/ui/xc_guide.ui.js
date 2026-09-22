"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Screen;

// ============================================================ // 衔春渲染器 / Xianchun Renderer — 渲染指引 & 提示词控制台
// Copyright 2026 Xianchun / 衔春 (矞 & 雪柳)
// Licensed under the Apache License, Version 2.0
// ============================================================

const CONFIG_ENV_KEY = "XC_RENDERER_CONFIG";

const OFFICIAL_PROMPT_CORE = "[Xianchun Renderer — Output Protocol]\nEnclose rich-text responses in <xc> tags (or <xc_card> for explicit cards).\nAlways place opening and closing tags on their own separate lines.\n\n1. Tag Routing:\n• <xc>: Long-form Interactive Scroll (Default). Optimized for natural paragraphs, accordion foldouts, and voice synthesis.\n• <xc_card title=\"Title\" title_alt=\"Alt Title\">: Standalone Note Card. Best for concise letters, quotes, or short memos. Keep title within 16 characters.\n\n2. Code Blocks & Formatted Text:\n• DO NOT wrap Markdown code blocks (```...```) inside <xc> tags.\n• Output code blocks outside the renderer as standard markdown, closing <xc> before the block and opening a new <xc> afterwards if needed.\n\n3. Example:\n\n<xc>\nFirst paragraph of your content goes here.\n</xc>\n\n-block-\n\n<xc>\nSecond paragraph of your content goes here.\n</xc>";
const OFFICIAL_PROMPT_EXT = "[Xianchun Renderer — Interactive & Voice Extension]\nEmbed <fold>...</fold> blocks directly beneath paragraphs to enable accordion translations and optional voice synthesis:\n\n1. Interaction & Structure Rules:\n• Paragraph Separation: Break content into concise segments (1–2 sentences per paragraph). Keep narrative actions/thoughts and direct dialogue in separate paragraphs.\n• Translation Completeness: Every paragraph must be immediately paired with its own <fold> containing a complete translation of all elements (actions, thoughts, spoken lines) within that segment.\n• Emotion Tagging: Append e=\"emotion\" to the <fold> tag ONLY if the preceding paragraph contains spoken dialogue (e.g., <fold e=\"relaxed\">...</fold>). For purely narrative or action paragraphs, use a plain <fold>...</fold> without the e attribute.\n\n2. HTML Mode Example:\n\n<xc>\n(He closes the worn notebook on the desk and turns down the warm lamp.)\n<fold>（合上案头翻旧的笔记本，将暖黄的台灯光线调暗了些许。）</fold>\n\nThe night is getting late.\n<fold e=\"relaxed\">夜深了。</fold>\n</xc>";
const OFFICIAL_PROMPT_FULL = "[Xianchun Renderer — Output Protocol]\nEnclose rich-text responses in <xc> tags (or <xc_card> for explicit cards).\nAlways place opening and closing tags on their own separate lines.\n\n1. Tag Routing:\n• <xc>: Long-form Interactive Scroll (Default). Optimized for natural paragraphs, accordion foldouts, and voice synthesis.\n• <xc_card title=\"Title\" title_alt=\"Alt Title\">: Standalone Note Card. Best for concise letters, quotes, or short memos. Keep title within 16 characters.\n\n2. Code Blocks & Formatted Text:\n• DO NOT wrap Markdown code blocks (```...```) inside <xc> tags.\n• Output code blocks outside the renderer as standard markdown, closing <xc> before the block and opening a new <xc> afterwards if needed.\n\n3. Example:\n\n<xc>\nFirst paragraph of your content goes here.\n</xc>\n\n-block-\n\n<xc>\nSecond paragraph of your content goes here.\n</xc>\n\n[Xianchun Renderer — Interactive & Voice Extension]\nEmbed <fold>...</fold> blocks directly beneath paragraphs to enable accordion translations and optional voice synthesis:\n\n1. Interaction & Structure Rules:\n• Paragraph Separation: Break content into concise segments (1–2 sentences per paragraph). Keep narrative actions/thoughts and direct dialogue in separate paragraphs.\n• Translation Completeness: Every paragraph must be immediately paired with its own <fold> containing a complete translation of all elements (actions, thoughts, spoken lines) within that segment.\n• Emotion Tagging: Append e=\"emotion\" to the <fold> tag ONLY if the preceding paragraph contains spoken dialogue (e.g., <fold e=\"relaxed\">...</fold>). For purely narrative or action paragraphs, use a plain <fold>...</fold> without the e attribute.\n\n2. HTML Mode Example:\n\n<xc>\n(He closes the worn notebook on the desk and turns down the warm lamp.)\n<fold>（合上案头翻旧的笔记本，将暖黄的台灯光线调暗了些许。）</fold>\n\nThe night is getting late.\n<fold e=\"relaxed\">夜深了。</fold>\n</xc>";

const C = {
  bg: "#FADA7A",
  bgDark: "#03A791",
  paper: "#FFFFFF",
  pageBg: "#FBF8EF",
  ink: "#2D3F3A",
  muted: "#7A8B86",
  accent: "#03A791",
  soft: "#E0F5F2",
  tagBg: "#EFF7F5",
  codeBorder: "#B4EBE6",
  amber: "#FCB454",
  amberSoft: "#FDF5E6",
  cardSoft: "#F5F3ED"
};

function readConfig(ctx) {
  try {
    const raw = ctx.getEnv ? ctx.getEnv(CONFIG_ENV_KEY) : "";
    if (!raw) return {};
    const parsed = JSON.parse(String(raw));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

function Screen(ctx) {
  const [config, setConfig] = ctx.useState("guide_cfg", readConfig(ctx));
  const [isEditing, setIsEditing] = ctx.useState("is_editing", false);
  const [editBuf, setEditBuf] = ctx.useState("edit_buf", config.customPrompt || OFFICIAL_PROMPT_CORE);
  const [statusMsg, setStatusMsg] = ctx.useState("status_msg", "");

  const currentPrompt = typeof config.customPrompt === "string" && config.customPrompt.trim().length > 0
    ? config.customPrompt.trim()
    : OFFICIAL_PROMPT_CORE;
  const isCustom = typeof config.customPrompt === "string" && config.customPrompt.trim().length > 0;
  const displayedText = isEditing ? editBuf : currentPrompt;

  const hasExt = displayedText.indexOf("[Xianchun Renderer — Interactive & Voice Extension]") >= 0;

  async function persist(next, okText) {
    setConfig(next);
    try {
      if (ctx.setEnv) {
        await ctx.setEnv(CONFIG_ENV_KEY, JSON.stringify(next));
      }
      setStatusMsg(okText || "已保存生效 ✓");
    } catch (e) {
      setStatusMsg("保存失败: " + (e && e.message ? e.message : String(e)));
    }
  }

  async function copyText(text, label) {
    try {
      if (typeof Java !== "undefined" && Java.type) {
        const ActivityThread = Java.type("android.app.ActivityThread");
        const app = ActivityThread.currentApplication();
        if (app) {
          const Context = Java.type("android.content.Context");
          const cm = app.getSystemService(Context.CLIPBOARD_SERVICE || "clipboard");
          if (cm) {
            const ClipData = Java.type("android.content.ClipData");
            const clip = ClipData.newPlainText("xianchun_prompt", String(text || ""));
            cm.setPrimaryClip(clip);
            setStatusMsg(label + " 已复制到剪贴板 ✓");
            return;
          }
        }
      }
      if (ctx.clipboard && typeof ctx.clipboard.setText === "function") {
        await ctx.clipboard.setText(String(text || ""));
        setStatusMsg(label + " 已复制 ✓");
        return;
      }
      setStatusMsg("剪贴板未就绪");
    } catch (err) {
      setStatusMsg("复制失败: " + (err && err.message ? err.message : String(err)));
    }
  }

  function appendBlock(blockText, blockName) {
    let base = isEditing ? editBuf : currentPrompt;
    if (base.indexOf(blockText.trim()) >= 0) {
      setStatusMsg(blockName + " 已在提示词中");
      return;
    }
    const next = base.trim() + "\n\n" + blockText.trim();
    if (isEditing) {
      setEditBuf(next);
    } else {
      persist(Object.assign({}, config, { customPrompt: next }), "已拼装入 " + blockName + " ✓");
    }
  }

  const content = [];

  // 1. 顶栏：Neriya Kanaya 经典秋香底色，Serif 衬线体
  content.push(
    ctx.UI.Card({ containerColor: C.bg, shape: { cornerRadius: 18 }, elevation: 0 }, [
      ctx.UI.Column({ padding: { horizontal: 16, vertical: 14 }, spacing: 4 }, [
        ctx.UI.Row({ verticalAlignment: "center", spacing: 6 }, [
          ctx.UI.Text({
            text: "衔春 · 渲染指引",
            fontSize: 18,
            fontWeight: "bold",
            fontFamily: "serif",
            color: C.ink
          }),
          ctx.UI.Icon({ name: "eco", tint: C.bgDark, size: 20 }),
          ctx.UI.Spacer({ weight: 1 }),
          ctx.UI.Text({
            text: "v1.2.0",
            fontSize: 13,
            fontWeight: "bold",
            fontFamily: "serif",
            color: C.bgDark
          })
        ]),
        ctx.UI.Text({
          text: "Xianchun Spec · Neriya Kanaya Palette",
          fontSize: 11,
          color: C.ink,
          letterSpacing: 0.2
        })
      ])
    ])
  );

  // 2. 标签选用指南 (v1.1.1 完美版式：右对齐标头，左侧标签右对齐，右侧四字标题加粗+说明文字)
  content.push(
    ctx.UI.Card({ containerColor: C.paper, shape: { cornerRadius: 14 }, elevation: 0 }, [
      ctx.UI.Column({ padding: { horizontal: 14, vertical: 14 }, spacing: 12 }, [
        // 标头行：左侧标题与斜杠，右侧写给 user 靠最右
        ctx.UI.Row({ verticalAlignment: "center", horizontalArrangement: "spaceBetween", fillMaxWidth: true }, [
          ctx.UI.Row({ spacing: 6, verticalAlignment: "center" }, [
            ctx.UI.Box({ width: 3, height: 13, backgroundColor: C.bgDark }),
            ctx.UI.Text({ text: "标签选用指南", fontSize: 13.5, fontWeight: "bold", color: C.ink }),
            ctx.UI.Text({ text: "/ Tag Spec", fontSize: 11.5, color: C.muted })
          ]),
          ctx.UI.Text({ text: "写给 user", fontSize: 11, color: C.muted })
        ]),

        // 标签行 1
        v111TagRow(ctx, "<xc>", "自动分流", "日常首选 · 根据正文字数自动在轻量卡片与精致网页间切换", C.accent, C.soft),

        // 标签行 2
        v111TagRow(ctx, "<xc_card>", "精致卡片", "短句、格言、印鉴短章 · 纯净卡片，支持长文滑动与双语翻面", C.ink, C.cardSoft),

        // 标签行 3
        v111TagRow(ctx, "<xc_html>", "长卷网页", "长篇诗文、竖排排版 · 支持单句 ▷ 语音播放键与行间手风琴折叠", C.amber, C.amberSoft),

        ctx.UI.Spacer({ height: 2 }),
        ctx.UI.Text({
          text: "※ 提示：使用 HTML 网页渲染时，框内手势会被 WebView 拦截导致无法长按唤出 Operit 消息菜单；如需使用菜单，请在卡片外框四周边缘处长按呼出。",
          fontSize: 10.5,
          lineHeight: 1.45,
          color: C.muted
        })
      ])
    ])
  );

  // 3. 输出协议定制台
  content.push(
    ctx.UI.Card({ containerColor: C.paper, shape: { cornerRadius: 14 }, elevation: 0 }, [
      ctx.UI.Column({ padding: { horizontal: 14, vertical: 14 }, spacing: 10 }, [
        // 标头行：/ Prompt Console，右侧 (已定制)/(标准) 靠右
        ctx.UI.Row({ verticalAlignment: "center", horizontalArrangement: "spaceBetween", fillMaxWidth: true }, [
          ctx.UI.Row({ spacing: 6, verticalAlignment: "center" }, [
            ctx.UI.Box({ width: 3, height: 13, backgroundColor: C.bgDark }),
            ctx.UI.Text({ text: "输出协议定制台", fontSize: 13.5, fontWeight: "bold", color: C.ink }),
            ctx.UI.Text({ text: "/ Prompt Console", fontSize: 11.5, color: C.muted })
          ]),
          ctx.UI.Text({ text: isCustom ? "(已定制)" : "(标准)", fontSize: 11, fontWeight: "bold", color: isCustom ? C.accent : C.muted })
        ]),

        ctx.UI.Text({
          text: config.promptInject
            ? "⚡ 系统提示词自动注入已开启 (" + (config.promptInjectPosition === "top" ? "置顶前置" : "末尾追加") + ")，保存后即时生效。点击框内可直接原位修改。"
            : "点击下方展示框可直接原位编辑。如需免复制全自动生效，请在预设配置中开启【提示词自动注入】。",
          fontSize: 10.5,
          lineHeight: 1.4,
          color: config.promptInject ? C.accent : C.muted
        }),

        ctx.UI.Row({ spacing: 8, verticalAlignment: "center" }, [
          legoSwitch(ctx, "核心协议 (Core)", true, () => {
            setStatusMsg("核心协议为基础规范，始终生效");
          }, true),
          legoSwitch(ctx, "+ 交互与语音扩展 (Ext)", hasExt, () => {
            appendBlock(OFFICIAL_PROMPT_EXT, "交互与语音扩展");
          })
        ]),

        // 大展示框
        ctx.UI.Card({
          containerColor: "#FFFFFF",
          shape: { cornerRadius: 10 },
          elevation: 0,
          modifier: ctx.Modifier.border({
            width: 1.2,
            color: isEditing ? C.accent : C.codeBorder,
            shape: { cornerRadius: 10 }
          }),
          fillMaxWidth: true
        }, [
          isEditing
            ? ctx.UI.TextField({
                value: editBuf,
                onValueChange: v => setEditBuf(String(v || "")),
                placeholder: "输入定制的 Xianchun 渲染协议提示词...",
                singleLine: false,
                maxLines: 40,
                style: { color: C.ink, fontSize: 11 },
                padding: { horizontal: 12, vertical: 12 }
              })
            : ctx.UI.Box({
                padding: { horizontal: 12, vertical: 12 },
                fillMaxWidth: true,
                modifier: ctx.Modifier.clickable(() => {
                  setEditBuf(currentPrompt);
                  setIsEditing(true);
                })
              }, [
                ctx.UI.Text({
                  text: currentPrompt,
                  fontSize: 11,
                  lineHeight: 1.52,
                  color: C.ink
                })
              ])
        ]),

        // 底部三大操作按键：完全居中，整齐等比例
        ctx.UI.Row({ spacing: 8, verticalAlignment: "center", padding: { top: 2 } }, [
          actionButton(ctx, "重置 (Reset)", () => {
            const next = Object.assign({}, config);
            next.customPrompt = OFFICIAL_PROMPT_CORE;
            setEditBuf(OFFICIAL_PROMPT_CORE);
            setIsEditing(false);
            persist(next, "已重置为仅核心协议 ✓");
          }, "#FFF0F0", "#D32F2F", 1),
          actionButton(ctx, isEditing ? "保存 (Save)" : "保存 (Save)", () => {
            if (isEditing) {
              const trimmed = String(editBuf || "").trim();
              persist(Object.assign({}, config, { customPrompt: trimmed }), "定制提示词已保存生效 ✓");
              setIsEditing(false);
            } else {
              persist(Object.assign({}, config, { customPrompt: currentPrompt }), "当前提示词已生效 ✓");
            }
          }, C.accent, "#FFFFFF", 1.1),
          actionButton(ctx, "复制 (Copy)", () => {
            copyText(displayedText, "提示词");
          }, C.bgDark, "#FFFFFF", 1.1)
        ])
      ])
    ])
  );

  // 底部状态提示
  if (statusMsg) {
    content.push(
      ctx.UI.Row({ horizontalArrangement: "center", padding: { top: 2 } }, [
        ctx.UI.Text({ text: statusMsg, fontSize: 11.5, color: C.accent, fontWeight: "bold" })
      ])
    );
  }

  // 4. 底部版权行：左侧 License，右侧 Xianchun (矞 & 雪柳) 严格右对齐 (图下 v1.1.1 规范)
  content.push(
    ctx.UI.Row({
      horizontalArrangement: "spaceBetween",
      verticalAlignment: "center",
      padding: { horizontal: 4, top: 4, bottom: 8 },
      fillMaxWidth: true
    }, [
      ctx.UI.Row({ spacing: 6, verticalAlignment: "center" }, [
        ctx.UI.Icon({ name: "eco", tint: C.muted, size: 14 }),
        ctx.UI.Text({ text: "衔春渲染器 · Apache 2.0 License", fontSize: 11, color: C.muted })
      ]),
      ctx.UI.Text({ text: "Xianchun (矞 & 雪柳)", fontSize: 11.5, fontWeight: "bold", color: C.bgDark })
    ])
  );

  return ctx.UI.Box({
    fillMaxWidth: true,
    fillMaxHeight: true,
    backgroundColor: C.pageBg,
    modifier: ctx.Modifier.safeDrawingPadding()
  }, [
    ctx.UI.LazyColumn({
      padding: { horizontal: 14, vertical: 14 },
      spacing: 12
    }, content)
  ]);
}

// 标签行 (v1.1.1 严谨结构：左列固定宽度 + 内容靠右；右列标题加粗 + 说明自然折行)
function v111TagRow(ctx, tag, name, desc, tagColor, tagBg) {
  return ctx.UI.Row({ spacing: 12, verticalAlignment: "top", fillMaxWidth: true }, [
    // 左侧：标签容器严格右对齐 (通过 Row + Spacer weight:1 保证物理贴右)
    ctx.UI.Row({
      width: 82,
      verticalAlignment: "center",
      horizontalArrangement: "end",
      padding: { top: 1 }
    }, [
      ctx.UI.Spacer({ weight: 1 }),
      ctx.UI.Card({ containerColor: tagBg, shape: { cornerRadius: 6 }, elevation: 0 }, [
        ctx.UI.Text({
          text: tag,
          fontSize: 11,
          fontWeight: "bold",
          color: tagColor,
          padding: { horizontal: 6, vertical: 3 }
        })
      ])
    ]),
    // 右侧：四字标题 (加粗 ink 色) + 说明文本 (常规 ink 色)
    ctx.UI.Column({ weight: 1, spacing: 3 }, [
      ctx.UI.Text({
        text: name,
        fontSize: 13,
        fontWeight: "bold",
        color: C.ink
      }),
      ctx.UI.Text({
        text: desc,
        fontSize: 11,
        lineHeight: 1.45,
        color: C.ink
      })
    ])
  ]);
}

function legoSwitch(ctx, label, active, onClick, disabled) {
  const bg = active ? C.soft : C.paper;
  const borderCol = active ? C.accent : C.muted;
  const textCol = active ? C.accent : C.muted;
  return ctx.UI.Card({
    containerColor: bg,
    shape: { cornerRadius: 8 },
    elevation: 0,
    weight: 1,
    modifier: disabled ? ctx.Modifier : ctx.Modifier.clickable(onClick).border({
      width: 1,
      color: borderCol,
      shape: { cornerRadius: 8 }
    })
  }, [
    ctx.UI.Box({ padding: { horizontal: 8, vertical: 8 }, horizontalAlignment: "center", fillMaxWidth: true }, [
      ctx.UI.Text({
        text: (active ? "● " : "○ ") + label,
        fontSize: 11,
        fontWeight: active ? "bold" : "normal",
        color: textCol,
        maxLines: 1
      })
    ])
  ]);
}

function actionButton(ctx, label, onClick, bg, fg, weight) {
  return ctx.UI.Card({
    containerColor: bg,
    shape: { cornerRadius: 8 },
    elevation: 0,
    weight: weight,
    modifier: ctx.Modifier.clickable(onClick)
  }, [
    ctx.UI.Box({
      padding: { horizontal: 8, vertical: 10 },
      horizontalAlignment: "center",
      verticalAlignment: "center",
      fillMaxWidth: true
    }, [
      ctx.UI.Text({
        text: label,
        fontSize: 11.5,
        fontWeight: "bold",
        color: fg,
        maxLines: 1
      })
    ])
  ]);
}
