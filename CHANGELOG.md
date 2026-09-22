# Changelog — Xianchun Renderer

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-09-23

### Added
- **LEGO-style Modular Prompt Console**: Completely overhauled the Prompt Guide (`xc_guide.ui.js`). Added stateful toggle buttons allowing users to dynamically assemble output protocols (Core, Bilingual Folds, and TTS Extensions) without manual text pasting.
- **In-place Prompt Editing**: Users can now directly tap the protocol console to edit prompt instructions on the fly, with dedicated Reset, Save, and Copy controls.
- **Interactive Setting Previews**:
  - **HTML Mode**: Restored real accordion fold preview (`<details class="xc-para-fold">`) matching actual chat rendering, with informative guidance on text tap interaction.
  - **Card Mode**: Added dedicated flip-card interaction preview instructions explaining dual-sided translation switching.
- **Dynamic Writing-Mode Badge**: Settings top-bar now explicitly displays real-time layout orientation and font size (e.g. `横排 · 14px` / `竖排 · 16px`).

### Changed
- **Visual Restoration to v1.1.1 Aesthetic**: Re-aligned all Guide badge tags to the right margin, paired with bold 4-character Chinese headings and Neriya Kanaya palette styling.
- **Deep & Muted Folding Accents**: HTML translation foldout borders now utilize the theme's `Deep` tone with text set in `Muted`, recovering visual depth and reading comfort.
- **Preset Identity**: Restored the authentic Russian preset name `Вечер бродит` in the palette collection.
- **Purged Default Overrides**: Cleared internal dev endpoints, custom regex patterns, and non-core prompts from default factory configurations. Default prompt is strictly initialized to Core Protocol only.

### Fixed
- **TTS Empty Button Render**: Fixed a bug where single-sentence TTS playback buttons (`▷`) were still rendered on narrative paragraphs when speech text was emptied by custom cleaning regex.
- **Container Gesture Deadlock**: Switched the Guide page container to `LazyColumn`, eliminating gesture interception and ensuring smooth scrolling to the footer actions.
- **Button Alignment**: Ensured strict horizontal and vertical center alignment for all primary action buttons.

---

## [1.1.1] - 2026-09-21

### Fixed
- **Settings Preview Crash**: Resolved app crash when toggling between Card and HTML previews by avoiding instant destructive unmounting of `ctx.UI.WebView` across Compose rendering passes.
- **Unintended TTS Button Appearance**: Fixed an issue where single-sentence TTS play buttons (`▷`) appeared in HTML rendered paragraphs even when `Voice Support` was turned off in Settings.
- **WebView Zoom In/Out Drift**: Configured strict viewport scaling (`user-scalable=no, minimum-scale=1.0, maximum-scale=1.0`) and CSS touch constraints to prevent awkward zooming and page displacement into blank areas.

### Changed
- **Modular Prompt Guide**: Replaced legacy system prompt with universal English output protocols in the Guide page. Added 4-tier step-by-step copy buttons (Core only, Core + Bilingual Folds, Core + TTS Voice Tags, and Copy All).
- **Universal Documentation**: Clarified that sentence-level emotion attributes are safely ignored if voice support is disabled.

---

## [1.0.1] - 2026-09-20

### Added
- **Dynamic TTS endpoint configuration**: Added UI text field in Settings under `Voice Support` allowing users to specify custom TTS endpoints (supports local proxies like GPT-SoVITS or HTTPS endpoints).
- **TTS Text Cleaner Regex**: Added multiline regex configuration area in Settings to strip action descriptions and stage directions (e.g. `（...）`, `｛...｝`, `(...)`) before sending text to TTS backend.
- **Collapsible Voice Settings panel**: Made the voice configuration section in Settings collapsible to keep UI clean for users who only use text cards.
- **Native Clipboard fallback in Guide**: Resolved UI-thread clipboard failure using Android native `ClipboardManager` via Java Bridge, ensuring prompt copy buttons always succeed.
- **WebView gesture guidance in Guide**: Added explicit tips reminding users that Operit's long-press context menu must be summoned from outside the HTML rendered card frame.

### Fixed
- **Paragraph & Voice index misalignment**: Fixed a bug where plain action/thought paragraphs shifted the sequential mapping of `<fold>` voices, causing audio buttons and alt details to link to the wrong paragraphs.
- **Hardcoded local IP removed**: Purged internal dev IP (`192.168.0.103:3000`) from `main.js`. Endpoint is now strictly loaded from user settings with safety validation.

---

## [0.7] - 2026-07-27

### Summary
First **live tag rendering** phase. Card structure solidified; height auto-fit implemented; bilingual fold compatibility confirmed. Version number re-anchored: windows prior (花屋 base + UI modules + fold bug fixes) retroactively labeled ≤0.6; current window starts 0.6 → 0.7; 1.0.0 reserved for market/GitHub release.

### Added
- **Bilingual fold compatibility**: `<fold>` inside `<xc>` parsed by us (original/translation split), outside `<xc>` handled by bilingual-fold plugin; no double-processing
- **Card flip** button in header (icon + badge); tap to toggle original ↔ translation
- **Paragraph array rendering** for body text (preserves blank lines between paragraphs)
- **Title serif font** toggle
- **Settings preview** now `require`s actual card implementation (no longer a separate mock structure)

### Changed
- **Card frame**: `bg` color no longer a full底纸 layer; now **2px outline** only
- **Rounded corners**: outer `paper` layer → **sharp** (0 radius); only inner `soft` → rounded
- `estimateBodyHeight` introduced to **fit card height to content** (workaround for lack of `maxHeight` in types)
- **Guide module**: added `fillMaxSize` to eliminate black/white边 in dark/light themes

### Fixed
- **Fold rendering**: translation text extracted but not counted toward route threshold (card vs HTML split logic)
- **Settings preview**: icon and body text now match actual card output

---

## [≤0.6] - 2026-07-24 to 2026-07-26

### Summary (Retroactive Label)
Work done in prior windows:
1. **花屋 renderer v2** as base (no LICENSE; decided to rewrite rather than risk gray zone)
2. **UI modules added** (settings / guide / preview)
3. **Card fold bug fix**: initial version had collapse UI but no interaction event to view folded content

### Core Decisions Made
- **License**: Apache 2.0 (chosen over MIT for mandatory change documentation requirement)
- **NOTICE acknowledgments**: 花屋 v1 (liebetee), 花屋 v2 (ljrlty), Moodlet (独立提示词模块灵感), 双语折叠 (fold 标签兼容)
- **400 upstream_error avoidance protocol** drafted (segmented writes, copy-over-recreate, etc.)