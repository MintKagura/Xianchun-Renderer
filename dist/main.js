function stripWrapper(xml, tagName) {
  const tag = escapeRe(tagName || "");
  return String(xml || "")
    .replace(new RegExp("^\s*<\s*" + tag + "\b[^>]*>", "i"), "")
    .replace(new RegExp("<\s*\/\s*" + tag + "\s*>\s*$", "i"), "");
}
"use strict";
// ============================================================
// 衔春渲染器 / Xianchun Renderer
// Copyright 2026 Xianchun / 衔春 (矞 & 雪柳)
// Licensed under the Apache License, Version 2.0
// ============================================================

var __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};

const card_ui = __importDefault(require("./ui/xc_card.ui.js"));
const html_ui = __importDefault(require("./ui/xc_html.ui.js"));
const settings_ui = __importDefault(require("./ui/xc_settings.ui.js"));
const guide_ui = __importDefault(require("./ui/xc_guide.ui.js"));

const CONFIG_ENV_KEY = "XC_RENDERER_CONFIG";

const THEMES = {
  rose: { bg: "#f8e8ee", bgDark: "#d4849a", paper: "#ffffff", ink: "#2d2d3f", muted: "#8e7e8a", accent: "#b06b8a", soft: "#faf2f5" },
  neriya: { bg: "#FADA7A", bgDark: "#03A791", paper: "#FBF8EF", ink: "#2D3F3A", muted: "#FCB454", accent: "#03A791", soft: "#B4EBE6" },
  grapefruit: { bg: "#F24855", bgDark: "#DCE225", paper: "#FFFDF9", ink: "#4A1525", muted: "#D47A82", accent: "#7e810c", soft: "#FCE1B6" },
  babyblue: { bg: "#3EA6D6", bgDark: "#8E3DBA", paper: "#F4F9FC", ink: "#1A2A50", muted: "#6A89CC", accent: "#8E3DBA", soft: "#D6EAF8" },
  vecher: { bg: "#7288ae", bgDark: "#35418f", paper: "#ffffff", ink: "#4b5694", muted: "#a993a4", accent: "#111844", soft: "#efece3" }
};

const SLOT_KEYS = ["bg", "bgDark", "paper", "ink", "muted", "accent", "soft"];

const DEFAULTS = {
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
  ttsCleanRegex: ["（[^）]+）", "｛[^｝]+｝", "\([^)]+\)"]
};

function readConfig() {
  try {
    const raw = typeof getEnv === "function" ? getEnv(CONFIG_ENV_KEY) : "";
    if (!raw) return Object.assign({}, DEFAULTS);
    const parsed = JSON.parse(String(raw));
    return Object.assign({}, DEFAULTS, parsed && typeof parsed === "object" ? parsed : {});
  } catch (_) {
    return Object.assign({}, DEFAULTS);
  }
}

function getColors(config) {
  const custom = (config.customThemes && typeof config.customThemes === "object") ? config.customThemes : {};
  const base = custom[config.theme] || THEMES[config.theme] || THEMES.rose;
  const ov = (config.overrides && config.overrides[config.theme]) || {};
  const out = {};
  SLOT_KEYS.forEach(k => { out[k] = ov[k] || base[k] || THEMES.rose[k]; });
  return out;
}

function escapeRe(s) {
  var specials = ["-", "[", "]", "/", "{", "}", "(", ")", "*", "+", "?", ".", "\\", "^", "$", "|"];
  var str = String(s || "");
  for (var k = 0; k < specials.length; k++) { str = str.split(specials[k]).join("\\" + specials[k]); }
  return str;
  const tag = escapeRe(tagName || "");
  return String(xml || "")
    .replace(new RegExp("^\\s*<\\s*" + tag + "\\b[^>]*>", "i"), "")
    .replace(new RegExp("<\\s*\\/\\s*" + tag + "\\s*>\\s*$", "i"), "");
}

function stripFold(text) {
  return String(text || "").replace(/<\s*fold\b[^>]*>[\s\S]*?<\s*\/\s*fold\s*>/gi, "");
}

function splitBilingual(text) {
  const s = String(text || "");
  const re = /<\s*fold(?:\s+e="([^"]*)")?\s*>([\s\S]*?)<\s*\/\s*fold\s*>/gi;
  const srcParts = [];
  const tgtParts = [];
  const emotions = [];
  let last = 0;
  let m;
  while ((m = re.exec(s))) {
    const srcSegment = s.slice(last, m.index);
    srcParts.push(srcSegment);
    tgtParts.push(String(m[2] || ""));
    emotions.push(m[1] || "default");
    last = m.index + m[0].length;
  }
  srcParts.push(s.slice(last));
  return {
    source: normalizeBlank(srcParts.join("")),
    target: normalizeBlank(tgtParts.join("\n\n")),
    emotions: emotions,
    hasFold: tgtParts.length > 0
  };
}

function normalizeBlank(text) {
  return String(text || "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitParagraphs(text) {
  const s = normalizeBlank(text);
  if (!s) return [];
  return s.split(/\n{2,}/).map(function(p) { return p.trim(); }).filter(function(p) { return p.length > 0; });
}

function measureLength(text) {
  let s = stripFold(text);
  s = s.replace(/<[^>]*>/g, "");
  s = s.replace(/s+/g, "");
  return s.length;
}

function unwrapNestedTags(text) {
  return String(text || "").replace(/<\s*\/?\s*xc(_card|_html)?\b[^>]*>/gi, "");
}

function splitHeading(text) {
  const s = String(text || "").trim();
  if (!s) return { title: "", body: "" };
  const colon = s.search(/[：:]/);
  if (colon > 0 && colon <= 24) {
    return { title: s.slice(0, colon).trim(), body: s.slice(colon + 1).trim() };
  }
  const dash = s.search(/[—–-]{1,2}/);
  if (dash > 0 && dash <= 24) {
    return { title: s.slice(0, dash).trim(), body: s.slice(dash).replace(/^[—–-]+/, "").trim() };
  }
  return { title: s.slice(0, 24).trim(), body: s.slice(24).trim() };
}

function parseAttrs(xml, tagName) {
  const re = new RegExp("^\\s*<\\s*" + escapeRe(tagName) + "\\b([^>]*)", "i");
  const m = String(xml || "").match(re);
  if (!m || !m[1]) return {};
  const attrs = {};
  const attrRe = /([a-zA-Z0-9_-]+)s*=s*"([^"]*)"/g;
  let am;
  while ((am = attrRe.exec(m[1]))) {
    attrs[am[1]] = decodeXml(am[2]);
  }
  return attrs;
}

function decodeXml(s) {
  const AMP = String.fromCharCode(38);
  const named = [
    [AMP + "quot;", String.fromCharCode(34)],
    [AMP + "apos;", String.fromCharCode(39)],
    [AMP + "lt;", String.fromCharCode(60)],
    [AMP + "gt;", String.fromCharCode(62)]
  ];
  let out = String(s || "");
  named.forEach(pair => { out = out.split(pair[0]).join(pair[1]); });
  out = out.split(AMP + "amp;").join(AMP);
  return out;
}

function fingerprint(input) {
  const s = String(input || "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function estimateHeightHorizontal(len, fontSize, lineHeight) {
  const fs = Number(fontSize) || 14;
  const lh = Number(lineHeight) || 1.6;
  const perLine = Math.max(8, Math.floor(300 / fs));
  const lines = Math.max(1, Math.ceil(len / perLine));
  const padding = 32;
  const h = Math.ceil(lines * fs * lh) + padding;
  return Math.min(500, Math.max(60, h));
}

function verticalColumnCapacity(height, fontSize, lineHeight) {
  const fs = Number(fontSize) || 14;
  const lh = Number(lineHeight) || 1.6;
  const usable = Math.max(40, height - 32);
  return Math.max(4, Math.floor(usable / (fs * lh)));
}

function resolveWritingMode(config, len) {
  const wm = config.writingMode || "horizontal-tb";
  if (wm !== "vertical-rl") return wm;
  const cap = verticalColumnCapacity(280, config.fontSize, config.lineHeight);
  if (len < cap * 2) return "horizontal-tb";
  return "vertical-rl";
}

function resolveHeight(config, len, wm) {
  if (wm === "vertical-rl") return 280;
  return estimateHeightHorizontal(len, config.fontSize, config.lineHeight);
}

const DEFAULT_INJECT_PROMPT = [
  "[Xianchun Renderer — Output Protocol]",
  "Enclose rich-text responses in <xc> tags (or <xc_card> for explicit cards).",
  "Always place opening and closing tags on their own separate lines.",
  "",
  "1. Tag Routing:",
  "• <xc>: Long-form Interactive Scroll (Default). Optimized for natural paragraphs, accordion foldouts, and voice synthesis.",
  "• <xc_card title=\"Title\" title_alt=\"Alt Title\">: Standalone Note Card. Best for concise letters, quotes, or short memos. Keep title within 16 characters.",
  "",
  "2. Code Blocks & Formatted Text:",
  "• DO NOT wrap Markdown code blocks (```...```) inside <xc> tags.",
  "• Output code blocks outside the renderer as standard markdown, closing <xc> before the block and opening a new <xc> afterwards if needed.",
  "",
  "[Xianchun Renderer — Interactive & Voice Extension]",
  "Embed <fold>...</fold> blocks directly beneath paragraphs to enable accordion translations and optional voice synthesis:",
  "",
  "1. Interaction & Structure Rules:",
  "• Paragraph Separation: Break content into concise segments (1–2 sentences per paragraph). Keep narrative actions/thoughts and direct dialogue in separate paragraphs.",
  "• Translation Completeness: Every paragraph must be immediately paired with its own <fold> containing a complete translation of all elements (actions, thoughts, spoken lines) within that segment.",
  "• Emotion Tagging: Append e=\"emotion\" to the <fold> tag ONLY if the preceding paragraph contains spoken dialogue (e.g., <fold e=\"relaxed\">...</fold>). For purely narrative or action paragraphs, use a plain <fold>...</fold> without the e attribute.",
  "",
  "2. HTML Mode Example:",
  "<xc>",
  "(He closes the worn notebook on the desk and turns down the warm lamp.)",
  "<fold>（合上案头翻旧的笔记本，将暖黄的台灯光线调暗了些许。）</fold>",
  "",
  "The night is getting late.",
  "<fold e=\"relaxed\">夜深了。</fold>",
  "</xc>"
].join("\n");

function onSystemPromptCompose(event) {
  try {
    const config = readConfig();
    if (config.promptInject !== true) return null;
    const payload = (event && event.eventPayload) || {};
    const baseSystemPrompt = String(payload.systemPrompt || "");
    const customPrompt = typeof config.customPrompt === "string" && config.customPrompt.trim().length > 0
      ? config.customPrompt.trim()
      : DEFAULT_INJECT_PROMPT;
    if (config.promptInjectPosition === "top") {
      return { systemPrompt: customPrompt + "\n\n" + baseSystemPrompt };
    }
    return { systemPrompt: baseSystemPrompt + "\n\n" + customPrompt };
  } catch (err) {
    console.error("[XianchunRenderer] onSystemPromptCompose error:", err);
    return null;
  }
}

function registerToolPkg() {
  try {
    ToolPkg.registerXmlRenderPlugin({
      id: "xc_card_render",
      tag: "xc_card",
      function: onCardRender
    });
    ToolPkg.registerXmlRenderPlugin({
      id: "xc_html_render",
      tag: "xc_html",
      function: onHtmlRender
    });
    ToolPkg.registerXmlRenderPlugin({
      id: "xc_auto_render",
      tag: "xc",
      function: onAutoRender
    });
    ToolPkg.registerToolboxUiModule({
      id: "xianchun_presets",
      runtime: "compose_dsl",
      screen: settings_ui.default,
      params: {},
      title: { zh: "衔春 · 预设配置", en: "Xianchun Presets", default: "Xianchun Presets" }
    });
    ToolPkg.registerToolboxUiModule({
      id: "xianchun_guide",
      runtime: "compose_dsl",
      screen: guide_ui.default,
      params: {},
      title: { zh: "衔春 · 渲染指引", en: "Xianchun Guide", default: "Xianchun Guide" }
    });
    if (typeof ToolPkg.registerSystemPromptComposeHook === "function") {
      ToolPkg.registerSystemPromptComposeHook({
        id: "xc_system_prompt_injector",
        function: onSystemPromptCompose
      });
    }
  } catch (err) {
    console.error("[XianchunRenderer] registerToolPkg error:", err);
  }
  return true;
}

function onAutoRender(event) {
  const payload = event.eventPayload || {};
  if (payload.tagName !== "xc") return { handled: false };
  const xml = String(payload.xmlContent || "");
  const attrs = parseAttrs(xml, "xc");
  const raw = stripWrapper(xml, "xc").trim();
  if (!raw) return { handled: false };
  const config = readConfig();
  const mode = config.runtimeMode || "auto";
  if (mode === "card") {
    return buildCard(xml, raw, attrs, config);
  }
  if (mode === "html") {
    return buildHtml(xml, raw, attrs, config);
  }
  if (config.voiceSupport === true && /<s*fold[^>]*es*=/i.test(raw)) {
    return buildHtml(xml, raw, attrs, config);
  }
  const len = measureLength(raw);
  const threshold = Number(config.routeThreshold) || DEFAULTS.routeThreshold;
  if (len <= threshold) {
    return buildCard(xml, raw, attrs, config);
  }
  return buildHtml(xml, raw, attrs, config);
}

function onCardRender(event) {
  const payload = event.eventPayload || {};
  if (payload.tagName !== "xc_card") return { handled: false };
  const xml = String(payload.xmlContent || "");
  const attrs = parseAttrs(xml, "xc_card");
  const raw = stripWrapper(xml, "xc_card").trim();
  if (!raw && !attrs.title) return { handled: false };
  const config = readConfig();
  if (config.voiceSupport === true && /<s*fold[^>]*es*=/i.test(raw)) {
    return buildHtml(xml, raw, attrs, config);
  }
  return buildCard(xml, raw, attrs, config);
}

function onHtmlRender(event) {
  const payload = event.eventPayload || {};
  if (payload.tagName !== "xc_html") return { handled: false };
  const xml = String(payload.xmlContent || "");
  const attrs = parseAttrs(xml, "xc_html");
  const raw = stripWrapper(xml, "xc_html").trim();
  if (!raw) return { handled: false };
  return buildHtml(xml, raw, attrs, readConfig());
}

function buildCard(xml, raw, attrs, config) {
  const colors = getColors(config);
  const safe = unwrapNestedTags(raw);
  const bilingual = splitBilingual(safe);
  const clean = bilingual.source.trim();
  let title = attrs.title || "";
  let body = clean;
  if (!title) {
    const head = firstSentence(clean);
    const split = splitHeading(head);
    title = split.title;
    const rest = clean.slice(head.length).trim();
    body = (split.body ? split.body + (rest ? "\n\n" + rest : "") : rest);
  }
  const targetBody = bilingual.target.trim();
  const titleAlt = attrs.title_alt || attrs.titleAlt || title;
  return {
    handled: true,
    composeDsl: {
      screen: card_ui.default,
      state: {
        _title: title || "衔春",
        _titleAlt: titleAlt || title || "衔春",
        _subtitle: attrs.subtitle || "",
        _paras: splitParagraphs(body),
        _parasAlt: splitParagraphs(targetBody),
        _voiceList: bilingual.emotions || [],
        _hasAlt: targetBody.length > 0,
        _colors: colors,
        _fontSize: Number(config.fontSize) || DEFAULTS.fontSize,
        _lineHeight: Number(config.lineHeight) || DEFAULTS.lineHeight,
        _letterSpacing: Number(config.letterSpacing) || 0,
        _textAlign: config.textAlign || DEFAULTS.textAlign,
        _maxHeight: Number(config.cardMaxHeight) || DEFAULTS.cardMaxHeight,
        _serifTitle: config.serifTitle !== false
      },
      memo: { fingerprint: fingerprint(xml), title: title },
      moduleSpec: { id: "xc_card_" + fingerprint(xml), runtime: "compose_dsl" }
    }
  };
}

function buildHtml(xml, raw, attrs, config) {
  const colors = getColors(config);
  const safe = unwrapNestedTags(raw);
  const bilingual = splitBilingual(safe);
  const len = measureLength(raw);
  const wm = resolveWritingMode(config, len);
  const explicitHeight = attrs.height ? (parseInt(attrs.height, 10) || 0) : 0;
  let finalHeight = explicitHeight > 0 ? explicitHeight : resolveHeight(config, len, wm);
  if (bilingual.hasFold && !explicitHeight) {
    finalHeight = Math.min(500, Math.max(finalHeight, finalHeight + 40));
  }
  return {
    handled: true,
    composeDsl: {
      screen: html_ui.default,
      state: {
        _htmlUrl: wrapHtml(safe, config, colors, wm),
        _height: finalHeight
      },
      memo: { fingerprint: fingerprint(xml), title: attrs.title || "HTML" },
      moduleSpec: { id: "xc_html_" + fingerprint(xml), runtime: "compose_dsl" }
    }
  };
}

function firstSentence(text) {
  const s = String(text || "");
  const m = s.match(/^[\s\S]*?[。．.!?！？\n]/);
  return m ? m[0] : s;
}

function wrapHtml(rawText, config, colors, wm) {
  const fs = Number(config.fontSize) || 14;
  const lh = Number(config.lineHeight) || 1.6;
  const ls = Number(config.letterSpacing) || 0;
  const ta = config.textAlign || "left";
  const safe = unwrapNestedTags(rawText);
  const paragraphs = splitParagraphs(safe);
  const foldRe = /<\s*fold(?:\s+e="([^"]*)")?\s*>([\s\S]*?)<\s*\/\s*fold\s*>/i;
  const htmlBody = paragraphs
    .map(p => {
      const match = p.match(foldRe);
      if (match) {
        const srcText = p.slice(0, match.index).trim();
        const emotion = (match[1] || "default").trim();
        const altText = String(match[2] || "").trim();
        const speakText = srcText || altText;
        let btn = "";
        let cleanedForBtn = speakText;
        const cleanList = Array.isArray(config.ttsCleanRegex) ? config.ttsCleanRegex : [];
        if (cleanList.length > 0) {
          for (let ci = 0; ci < cleanList.length; ci++) {
            if (!cleanList[ci]) continue;
            try {
              cleanedForBtn = cleanedForBtn.replace(new RegExp(cleanList[ci], 'g'), '');
            } catch(_) {}
          }
        } else {
          cleanedForBtn = cleanedForBtn.replace(/（[^）]+）/g, '').replace(/([^)]+)/g, '').replace(/｛[^｝]+｝/g, '').replace(/【[^】]+】/g, '');
        }
        cleanedForBtn = cleanedForBtn.trim();
        if (config.voiceSupport === true && cleanedForBtn.length > 0) {
          const payload = encodeURIComponent(JSON.stringify({ text: speakText, emotion: emotion }));
          btn = ' <span class="play-btn" data-payload="' + payload + '" onclick="event.stopPropagation();event.preventDefault();playTts(this)">▷</span>';
        }

        if (srcText && altText) {
          return '<details class="xc-para-fold">'
            + '<summary class="xc-para-head">' + escapeHtml(srcText) + btn + '</summary>'
            + '<div class="xc-para-alt">' + escapeHtml(altText) + '</div>'
            + '</details>';
        }
        if (altText) {
          return '<details class="xc-para-fold xc-standalone-fold">'
            + '<summary class="xc-para-head"><span style="color:' + colors.accent + ';font-size:0.9em;font-weight:600;opacity:0.8">▾</span>' + btn + '</summary>'
            + '<div class="xc-para-alt">' + escapeHtml(altText) + '</div>'
            + '</details>';
        }
      }

      return '<p class="xc-para">' + escapeHtml(p) + '</p>';
    })
    .join("");

  const css = "* { margin:0; padding:0; box-sizing:border-box; touch-action:pan-x pan-y; } "
    + "html, body { width:100%; height:100%; } "
    + "body { "
    + "font-family: system-ui, -apple-system, sans-serif; "
    + "font-size: " + fs + "px; "
    + "line-height: " + lh + "; "
    + "letter-spacing: " + ls + "px; "
    + "color: " + colors.ink + "; "
    + "background: " + colors.paper + "; "
    + "writing-mode: " + wm + "; "
    + "text-align: " + ta + "; "
    + "padding: 14px 16px; "
    + (wm === "vertical-rl" ? "overflow-x: auto; overflow-y: hidden; " : "overflow-y: auto; overflow-x: hidden; ")
    + "word-break: break-word; "
    + "} "
    + ".xc-para { margin-bottom: 0.8em; } "
    + ".xc-para:last-child { margin-bottom: 0; } "
    + ".xc-para-fold { margin-bottom: 0.8em; } "
    + ".xc-para-fold:last-child { margin-bottom: 0; } "
    + ".xc-para-head { cursor: pointer; list-style: none; outline: none; } "
    + ".xc-para-head::-webkit-details-marker { display: none; } "
    + ".xc-para-alt { "
    + "margin-top: 0.35em; "
    + "padding: 0 0 0 8px; "
    + "color: " + colors.muted + "; "
    + "font-size: 0.9em; "
    + "line-height: " + lh + "; "
    + "border-left: 2px solid " + colors.bgDark + "; "
    + "} "
    + ".play-btn { "
    + "display: inline-block; "
    + "font-size: 0.85em; "
    + "color: " + colors.accent + "; "
    + "margin-left: 4px; "
    + "padding: 0 4px; "
    + "cursor: pointer; "
    + "user-select: none; "
    + "vertical-align: middle; "
    + "opacity: 0.85; "
    + "} "
    + ".play-btn:active { opacity: 1; transform: scale(1.1); } "
    + ".play-btn.playing { color: " + colors.bgDark + "; font-weight: bold; } "
    + ".play-btn.loading { opacity: 0.5; }";

  const ttsEndpoint = String(config.ttsEndpoint || "").trim();
  const cleanRegexList = Array.isArray(config.ttsCleanRegex) ? config.ttsCleanRegex : [];

  const script = "<script>"
    + "let currentAudio = null;"
    + "let currentPlayingBtn = null;"
    + "const TTS_ENDPOINT = " + JSON.stringify(ttsEndpoint) + ";"
    + "const CLEAN_REGEX_LIST = " + JSON.stringify(cleanRegexList) + ";"
    + "function cleanTtsText(raw) {"
    + "  let t = String(raw || '');"
    + "  if (CLEAN_REGEX_LIST && CLEAN_REGEX_LIST.length) {"
    + "    for (let i = 0; i < CLEAN_REGEX_LIST.length; i++) {"
    + "      const pat = CLEAN_REGEX_LIST[i];"
    + "      if (!pat) continue;"
    + "      try {"
    + "        const re = new RegExp(pat, 'g');"
    + "        t = t.replace(re, '');"
    + "      } catch(e) {"
    + "        console.warn('[XianchunRenderer] Invalid clean regex:', pat, e);"
    + "      }"
    + "    }"
    + "  }"
    + "  return t.trim();"
    + "}"
    + "async function playTts(el) {"
    + "  if (el.classList.contains('loading')) return;"
    + "  if (!TTS_ENDPOINT) {"
    + "    console.warn('[XianchunRenderer] TTS endpoint is not configured in preset settings.');"
    + "    el.innerText = '✕';"
    + "    setTimeout(() => { if (el.innerText === '✕') el.innerText = '▷'; }, 1500);"
    + "    return;"
    + "  }"
    + "  const rawData = el.getAttribute('data-payload');"
    + "  if (!rawData) return;"
    + "  let data = {};"
    + "  try { data = JSON.parse(decodeURIComponent(rawData)); } catch(e) { return; }"
    + "  const targetText = cleanTtsText(data.text);"
    + "  if (!targetText) return;"
    + "  el.classList.remove('playing');"
    + "  el.classList.add('loading');"
    + "  el.innerText = '◌';"
    + "  try {"
    + "    const text = encodeURIComponent(targetText);"
    + "    const emo = encodeURIComponent(data.emotion || 'default');"
    + "    let sep = TTS_ENDPOINT.indexOf('?') >= 0 ? '&' : '?';"
    + "    let url = TTS_ENDPOINT;"
    + "    if (url.indexOf('{text}') >= 0) {"
    + "      url = url.split('{text}').join(text).split('{emotion}').join(emo);"
    + "    } else {"
    + "      url = url + sep + 'text=' + text + '&emotion=' + emo + '&text_lang=ja&prompt_lang=ja&speed=1.0';"
    + "    }"
    + "    if (currentAudio) { currentAudio.pause(); currentAudio = null; }"
    + "    const audio = new Audio(url);"
    + "    currentAudio = audio;"
    + "    audio.onplay = () => { el.classList.remove('loading'); el.classList.add('playing'); el.innerText = '▶'; };"
    + "    audio.onended = () => { el.classList.remove('playing'); el.innerText = '▷'; currentAudio = null; };"
    + "    audio.onerror = () => { el.classList.remove('loading', 'playing'); el.innerText = '↺'; currentAudio = null; };"
    + "    await audio.play();"
    + "  } catch (err) {"
    + "    el.classList.remove('loading', 'playing');"
    + "    el.innerText = '↺';"
    + "  }"
    + "}"
    + "</script>";

  const html = "<!DOCTYPE html><html><head>"
    + '<meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no">'
    + "<style>" + css + "</style></head><body>"
    + htmlBody
    + script
    + "</body></html>";
  return "data:text/html;charset=utf-8," + encodeURIComponent(html);
}

function escapeHtml(text) {
  const AMP = String.fromCharCode(38);
  const LT = String.fromCharCode(60);
  const GT = String.fromCharCode(62);
  const QUOT = String.fromCharCode(34);
  const APOS = String.fromCharCode(39);
  return String(text || "")
    .split(AMP).join(AMP + "amp;")
    .split(LT).join(AMP + "lt;")
    .split(GT).join(AMP + "gt;")
    .split(QUOT).join(AMP + "quot;")
    .split(APOS).join(AMP + "#39;");
}

exports.registerToolPkg = registerToolPkg;
exports.onCardRender = onCardRender;
exports.onHtmlRender = onHtmlRender;
exports.onAutoRender = onAutoRender;
exports.onSystemPromptCompose = onSystemPromptCompose;