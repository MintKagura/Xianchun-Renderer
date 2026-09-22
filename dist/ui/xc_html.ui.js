"use strict";
// ============================================================
// 衔春渲染器 — 网页通道
// Copyright 2026 Xianchun / 衔春 (矞 & 雪柳)
// Licensed under the Apache License, Version 2.0
// ============================================================

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Screen;

function Screen(ctx) {
  const [htmlUrl] = ctx.useState("_htmlUrl", "");
  const [height] = ctx.useState("_height", 240);

  const h = Number(height) || 240;

  return ctx.UI.Box({
    fillMaxWidth: true,
    padding: { horizontal: 2, vertical: 2 }
  }, [
    ctx.UI.WebView({
      height: Math.max(120, h),
      url: htmlUrl,
      javaScriptEnabled: true,
      domStorageEnabled: true,
      nestedScrollInterop: true
    })
  ]);
}