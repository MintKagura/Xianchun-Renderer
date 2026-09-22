"use strict";
// ============================================================
// 衔春渲染器 — 卡片通道
// Copyright 2026 Xianchun / 衔春 (矞 & 雪柳)
// Licensed under the Apache License, Version 2.0
//
// 版式约定：
//   三层套叠 = bg 底纸 / paper 外框 / soft 内芯
//   正文超高时内部滚动，不截断、不折叠
//   段落成节点，段间留白由 spacing 决定，空行得以保留
//   挂了 <fold> 时可点击翻面，原文与译文各自独立版面
//
// 已知限制：
//   Compose 的 Text 不支持 lineHeight / letterSpacing / textAlign，
//   故行间距、字间距、对齐三项仅对 HTML 通道生效。
//   此处以段间距 GAP_PARA 近似承担行间的呼吸感。
// ============================================================

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Screen;

const FALLBACK_COLORS = {
  bg: "#f8e8ee", bgDark: "#d4849a", paper: "#ffffff",
  ink: "#2d2d3f", muted: "#8e7e8a", accent: "#b06b8a", soft: "#faf2f5"
};

// 上下留白成对，页眉行不再额外吃掉纵向空间，
// 避免此前「上 14 下 10」那种头重脚轻的观感。
// 外框改为「bg 描边 + paper 直角面」两层，不再用 bg 铺一整圈底纸：
// 三层圆角套叠会显得钝重，尤其在无衬线字体下更明显。
const BORDER_W = 2;
const PAD_OUTER_H = 13;
const PAD_OUTER_V = 13;
const PAD_INNER_H = 15;
const PAD_INNER_V = 14;
const GAP_SECTION = 8;

// 正文高度估算。
// 一行容纳的全角字数按气泡宽度反推，行数取各段之和，
// 再加上段间距，最后以 limit 截顶。
// 估值偏差可接受：短文本贴合内容比精确更重要，
// 溢出部分交给 LazyColumn 内部滚动。
function estimateBodyHeight(list, fontSize, lineHeight, gapPara, limit) {
  const fs = Number(fontSize) || 14;
  const lh = Number(lineHeight) || 1.6;
  // 考虑卡片内边距后，实际文本排版宽度约240dp
  const perLine = Math.max(8, Math.floor(240 / fs));
  let lines = 0;
  (list || []).forEach(p => {
    const len = String(p || "").replace(/\s+/g, "").length;
    lines += Math.max(1, Math.ceil(len / perLine));
  });
  const gaps = Math.max(0, (list || []).length - 1) * (Number(gapPara) || 6);
  // 加足16dp缓冲，彻底消除由于Android字体下延笔画引起的意外内部滚动
  const h = Math.ceil(lines * fs * lh) + gaps + 16;
  return Math.min(Number(limit) || 320, Math.max(fs * 2, h));
}

function Screen(ctx) {
  const [title] = ctx.useState("_title", "");
  const [titleAlt] = ctx.useState("_titleAlt", "");
  const [subtitle] = ctx.useState("_subtitle", "");
  const [paras] = ctx.useState("_paras", []);
  const [parasAlt] = ctx.useState("_parasAlt", []);
  const [voiceList] = ctx.useState("_voiceList", []);
  const [hasAlt] = ctx.useState("_hasAlt", false);
  const [colors] = ctx.useState("_colors", FALLBACK_COLORS);
  const [fontSize] = ctx.useState("_fontSize", 14);
  const [lineHeight] = ctx.useState("_lineHeight", 1.6);
  const [maxHeight] = ctx.useState("_maxHeight", 320);
  // 标题衬线：宿主未暴露字体设置读取接口，无法判断用户是否上传了自有字体，
  // 故不做自动判断，改为可关。上传了自有字体而觉得别扭的人关掉即可。
  const [serifTitle] = ctx.useState("_serifTitle", true);

  // 翻面状态：false=原文面，true=译文面
  const [flipped, setFlipped] = ctx.useState("_flipped", false);

  const fs = Number(fontSize) || 14;
  const lh = Number(lineHeight) || 1.6;
  const limit = Number(maxHeight) || 320;

  // 行间距无法直接设置，改用段间距近似传达版式意图
  const gapPara = Math.max(6, Math.round(fs * (lh - 1)));

  const showAlt = hasAlt && flipped;
  const srcList = Array.isArray(paras) ? paras : [];
  const altList = Array.isArray(parasAlt) ? parasAlt : [];
  const list = showAlt ? altList : srcList;

  // 译文面用 accent 作正文色（案甲），与原文面的 ink 形成鲜明雅致的双语反转
  const bodyColor = showAlt ? colors.accent : colors.ink;

  // ---- 头部标识行 ----
  // 仅在存在译文时才给右上角标签绑定点击翻面，避免整卡点击冲突
  const flipBtnProps = {
    text: showAlt ? "Original ⇄" : "Translate ⇄",
    fontSize: 10,
    fontWeight: "medium",
    color: colors.accent,
    maxLines: 1
  };
  if (hasAlt) {
    flipBtnProps.modifier = ctx.Modifier.clickable(() => { setFlipped(!flipped); });
  }

  const headerRow = [
    ctx.UI.Icon({ name: "eco", tint: colors.bgDark, size: 16 }),
    ctx.UI.Text({
      text: "·", fontSize: 16, fontWeight: "bold", color: colors.bgDark
    })
  ];
  if (hasAlt) {
    headerRow.push(ctx.UI.Text(flipBtnProps));
  }

  // ---- 正文段落 ----
  const bodyNodes = list.map((p, i) => {
    return ctx.UI.Row({
      key: "p" + i,
      fillMaxWidth: true
    }, [
      ctx.UI.Text({
        text: String(p || ""),
        style: "bodyMedium",
        fontSize: fs,
        color: bodyColor,
        softWrap: true,
        weight: 1
      })
    ]);
  });

  // ---- 内芯 ----
  const inner = [];
  const currentTitle = showAlt ? (titleAlt || title) : title;
  if (currentTitle) {
    const titleProps = {
      text: currentTitle,
      style: "titleMedium",
      fontSize: fs + 3,
      fontWeight: "bold",
      color: colors.ink,
      softWrap: true,
      maxLines: 2
    };
    // 无衬线加粗的标题配上圆角会显得肉，衬线能立住字形
    if (serifTitle) titleProps.fontFamily = "serif";
    inner.push(ctx.UI.Text(titleProps));
  }
  if (subtitle) {
    inner.push(ctx.UI.Text({
      text: subtitle,
      style: "bodySmall",
      fontSize: Math.max(10, fs - 2),
      color: colors.muted,
      softWrap: true,
      maxLines: 2
    }));
  }

  if (bodyNodes.length > 0) {
    if (title || subtitle) {
      inner.push(ctx.UI.Spacer({ height: 4 }));
    }
    // types 里没有 maxHeight，height 一写死短文本下方就空一大片。
    // 故按段数与字数估出所需高度，再用 limit 截顶：
    // 短则贴合内容，长则到顶后由 LazyColumn 内部滚动。
    inner.push(ctx.UI.LazyColumn({
      spacing: gapPara,
      fillMaxWidth: true,
      height: estimateBodyHeight(list, fs, lh, gapPara, limit)
    }, bodyNodes));
  }

  // ---- 落款 ----
  const footer = ctx.UI.Row({
    verticalAlignment: "center",
    spacing: 6
  }, [
    ctx.UI.Text({
      text: "✦ 衔春",
      style: "labelSmall",
      fontSize: 10,
      fontWeight: "medium",
      color: colors.bgDark,
      maxLines: 1
    })
  ]);

  // ---- 两层：bg 描边 + paper 直角面，内芯 soft 保留圆角 ----
  // bg 原先铺成一整圈底纸，三层圆角套叠显得钝重。
  // 改为只承担 2px 外描边：颜色仍然落地，但不再占面积。
  const outerProps = {
    containerColor: colors.paper,
    // 直角。棱角能立住版面，圆角只留给内芯。
    shape: { cornerRadius: 0 },
    border: { width: BORDER_W, color: colors.bg },
    elevation: 0,
    fillMaxWidth: true
  };

  return ctx.UI.Card(outerProps, [
    ctx.UI.Column({
      padding: { horizontal: PAD_OUTER_H, vertical: PAD_OUTER_V },
      spacing: GAP_SECTION,
      fillMaxWidth: true
    }, [
      ctx.UI.Row({
        spacing: 6,
        verticalAlignment: "center",
        fillMaxWidth: true
      }, headerRow),
      ctx.UI.Card({
        containerColor: colors.soft,
        shape: { cornerRadius: 8 },
        elevation: 0,
        fillMaxWidth: true
      }, [
        ctx.UI.Column({
          padding: { horizontal: PAD_INNER_H, vertical: PAD_INNER_V },
          spacing: 6,
          fillMaxWidth: true
        }, inner)
      ]),
      footer
    ])
  ]);
}