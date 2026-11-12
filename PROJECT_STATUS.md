# Frameflow Project Status

Last updated: 2026-07-17, Asia/Taipei
Workspace: `/Users/redball/Documents/New project`
Local site: `http://localhost:3100/`

This file is the handoff source for continuing the Frameflow AI video editor work in a fresh Codex task. Read this before touching code.

## Current State

- Product name shown in UI: Frameflow.
- Current pipeline version in `server.js`: `13`.
- The local server is managed persistently by the macOS LaunchAgent `com.openai.frameflow` and was running normally on port `3100` during the last check.
- LaunchAgent file: `/Users/redball/Library/LaunchAgents/com.openai.frameflow.plist`.
- The keep-alive behavior was verified by terminating the Node child once; launchd restarted it with a new PID and `/api/health` returned normally.
- `/api/health` reported:
  - local Whisper engine ready, model `small`
  - `speech-summary-polisher` ready and executable for AI proofread
  - `extract-verbatim-highlights` ready for extractive AI highlight drafts
  - local visual/B-roll stack ready
  - workflow skills ready
- Current frontend asset cache version:
  - `/app.js?v=20260717-editor-timeline-polish`
  - `/styles.css?v=20260717-editor-timeline-polish`
- Current output storage was about `17G` under `outputs/jobs`.
- Git does not have a clean baseline in this workspace; many project files appear untracked. Do not use destructive git commands.

## Product Direction

Quality is the hard rule. Speed matters only when it does not reduce output quality.

Frameflow should feel like a premium Chinese AI video workstation:

- Dark, clean, professional SaaS UI.
- No irrelevant internal/debug text in the user flow.
- No horizontal page scrolling.
- Each workflow stage should feel like its own page, not stacked or double-layered.
- The logo should remain visible and should return to the home page when clicked.
- The user should always know which stage they are in.
- Processing screens should be a single full-screen state, not a visible page layer plus an inner webpage/card.
- Any preview video/audio must pause when the user enters the next workflow step or switches to another production/review state.
- Recoverable processing failures should bring the user back to the latest usable project step instead of leaving them on a dead-end failure screen.
- Subtitle review preview must show the current editable subtitle over the video, otherwise users cannot judge timing.
- Subtitle review should follow the roughcut editor model: visible tool labels, a top return action, and V1/A1/S1 timeline tracks for material, audio, and subtitles.
- Roughcut preview should use the same native video control style as subtitle preview; the custom floating preview control bar should stay hidden.

## Main Workflow

The expected workflow is:

1. Upload video.
2. Generate original transcript first.
3. User reviews and manually fixes the original transcript.
4. After original transcript confirmation, generate both AI proofread and AI highlight transcript versions from the confirmed manual transcript.
5. User chooses which transcript version to use.
6. User chooses output features.
7. If roughcut is selected, generate roughcut draft and let the user adjust it first.
8. If subtitles are selected, enter subtitle review and confirmation.
9. Only after subtitle confirmation, start high-cost output generation:
   - PPT/PDF
   - AI B-roll
   - final video
   - editing package
10. Result page should show the final video first, then clean download sections.

Important: PPT and B-roll must use the confirmed transcript/timeline/subtitle state. They should not be generated from stale text before the user finishes subtitle edits.

## Non-Negotiable Rules

- Do not run duplicate transcription for different features. Reuse the shared transcript/timeline.
- Do not copy large `source.mp4` repeatedly when a shared source or hard link can be used.
- Refreshing the page should preserve current work. Closing/leaving the page schedules cleanup.
- User-downloaded outputs and program files must not be deleted by cleanup.
- If a single optional generation item fails, do not fail the whole job. Continue with available outputs and show a user-facing warning.
- Final video should preserve source quality as much as practical:
  - keep source fps where possible
  - avoid unnecessary bitrate collapse
  - avoid audio quality loss or volume drop
- Subtitles must be editable before burn-in.
- Subtitles should be one sentence per visual line when possible.
- Subtitle timing must match speech.
- If the user deletes all text for a transcript segment, that segment should be removed from the produced timeline/video.
- AI edits in transcript versions must remain visible to the user as markings.
- Roughcut and subtitle editors should behave like editing software:
  - timeline blocks are directly adjustable
  - preview follows edits
  - playhead maps edited time to source time
  - users can undo/restore or temporarily disable delete/mute blocks

## Implemented Recently

### Subtitle-First High-Cost Generation

The backend has helpers around:

- `prepareSubtitleReviewBeforeHighCost`
- `generateOutputsAfterConfirmedSubtitles`

Behavior:

- Roughcut confirmation now prepares subtitle review first.
- PPT/B-roll/final generation is deferred until subtitle confirmation.
- Confirmed subtitle/timeline data is passed into downstream generation.

### B-roll Resilience

`scripts/generate_local_broll.py` was updated so:

- each B-roll segment can try up to 4 attempts
- a model exception affecting one segment is recorded as skipped instead of aborting the whole batch
- one failed segment is skipped instead of failing the whole job
- successful segments remain usable
- result notices include skipped segment reasons
- reuse requires semantic identity match:
  - prompt
  - negative prompt
  - source phrase
  - semantic core
  - visual concept
- reused images are still re-checked for face/modesty/duplicate quality issues

`lib/media.js` and `server.js` now also isolate the motion-export stage:

- each 5-second B-roll MP4 is exported independently after the set-level semantic/diversity QA
- one FFmpeg/export failure is returned as `skipped-export`
- successful clips remain available and final-video generation continues with those clips
- combined JSON/CSV clip manifests are rewritten from the successful exports
- the frontend warning area receives both keyframe-generation and clip-export failures

### Roughcut Reuse

Existing roughcut output can be reused based on the actual saved plan removals. This avoids re-rendering when the saved edit plan did not change. Reuse now also probes the existing video and confirms its duration is within tolerance of the planned result, so an interrupted/non-empty partial MP4 is not mistaken for a finished roughcut.

### 2026-07-16 Real-Video Recovery

The real 5-minute, 1080p59.94 project `64a5d576-208f-49c8-9f22-30574d23e2dd` was run through roughcut confirmation after the latest fixes.

- CPU `libx264` roughcut rendering was replaced on macOS with high-bitrate VideoToolbox segmented rendering for practical completion time while preserving 1920×1080 and approximately 59.94 fps.
- The completed roughcut is 292.87 seconds, has video and audio, and passed a full FFmpeg decode.
- Subtitle overlap handling no longer creates an overlap when adjacent starts are less than 80 ms apart.
- Multiple revised sentences sharing one source interval are distributed across that interval by text length instead of collapsing one sentence to 1 ms.
- The active subtitle draft has 37 captions, zero overlaps, zero embedded line breaks, ASS `WrapStyle: 2`, and a 0.841-second minimum caption duration.
- The project correctly stops at `subtitle-review` with `awaitingSubtitleApproval: true`; PPT, B-roll preview, and final-video URLs remain null until the user confirms subtitles.
- Cleanup scheduling returns `deleteAfter: null` for a persisted project, so pagehide cleanup cannot delete a completed project directory.

### Result Notices

The frontend has a `generation-notices` warning area. If B-roll is skipped or an optional output falls back, the user should be told clearly without blocking the rest of the result.

### Transcript Source Selection UI

The transcript review screen now owns the downstream transcript choice:

- the initial original-transcript review page hides the top-left radio circle because there is no transcript source choice yet
- after AI proofread/highlight versions exist, the original, AI-proofread, and AI-highlight rows keep their normal left-side radio controls for selecting the downstream transcript source
- opening a row only previews/edits it; it does not silently change the production source
- the selected version ID is carried directly into the later `/generate` request
- the next feature-selection screen no longer repeats the choice with three transcript cards
- user-facing copy no longer exposes internal mapping labels such as `near` or `loose`

### Timeline Drag Scrolling

Both editing timelines now support click-and-hold horizontal panning:

- roughcut and subtitle timelines start at `2.0x` zoom
- dragging the empty timeline/ruler pans horizontally with capped inertial glide
- releasing after a drag does not trigger an accidental seek or select a segment
- a short click on the roughcut timeline background still seeks normally
- roughcut segment dragging/resizing, subtitle block selection, and timeline toolbars remain excluded from background panning
- roughcut red delete ranges visually span both the video/material lane and the audio lane, so the UI does not imply that only sound will be removed

### Processing Screen Single-Layer Layout

The processing screen now hides the topbar, fills the full viewport from `inset: 0`, disables its own scrollbar, and removes the framed card styling from the inner progress container. This prevents the page from looking like a second webpage or modal stacked inside the main site.

### Preview Playback State

The frontend now uses a shared `pauseAllPreviewMedia()` helper before entering processing, changing workflow/transcript pages, re-rendering results, returning home, or opening roughcut/subtitle editors. This pauses all `<video>` and `<audio>` previews, including final output, B-roll cards, roughcut preview, and subtitle preview, so media cannot keep playing after the user moves to the next step.

### Subtitle Draft Validation

The subtitle draft safety check no longer requires exact full-text equality when a selected speech timeline is present. For long timeline-aligned drafts, small transcription/subtitle wording drift is allowed only when the subtitle draft covers the selected timeline's speech segments and the subtitle text length remains close to the selected transcript. This fixed the false failure `字幕草稿沒有完整套用目前選定的逐字稿` on project `6415378b-2325-4960-a87d-5b09a72b63f5`, while keeping short wrong-version checks strict.

### Recoverable Failure UX

When processing reports an error, the frontend now re-fetches the active project with `cache: "no-store"`. If the saved project is already at a usable step, such as roughcut review, subtitle review, transcript review, or has completed video outputs, the failure overlay is hidden and the app renders that step immediately with a toast explaining that it returned to a recoverable state. This prevents users from being stranded on `這次沒有完成` when the project has enough state to continue.

### Subtitle Preview Overlay

The subtitle review editor now wraps the base video in a dedicated player frame and overlays `#subtitle-preview-caption` above the video controls. The overlay reads the current editable caption rows, respects temporarily disabled/deleted rows, and updates on playback, seeking, timeline changes, text edits, and timing edits. This keeps subtitle timing review possible before burn-in.

### Editor Timeline Polish

Subtitle review now includes visible subtitle segment toolbar labels (`資訊`, `暫時隱藏`, `刪除`) and a roughcut-style three-lane timeline: `V1` material thumbnails, `A1` audio waveform/reference, and `S1` editable subtitle blocks. It should not expose a `返回結果` detour inside the active roughcut/subtitle editing workflow; confirmation is the forward path. When subtitle-specific thumbnails/waveforms are unavailable, the UI reuses the roughcut review thumbnails/waveform already generated for the same source instead of showing an empty editor. Roughcut preview now uses native video controls like the subtitle preview and hides the older floating custom preview controls.

## Skills Used By The App

The app currently recognizes the following workflow skills through `lib/skill-registry.js`; `/api/health` must report each as `ready: true`.

| Workflow area | Skill | Integration mode | Purpose |
| --- | --- | --- | --- |
| Upload / transcript | `transcribe-video-locally` | `direct-executable` | Runs local Whisper transcription and creates the shared editable transcript/timeline. |
| AI proofread draft | `speech-summary-polisher` | `spec-synchronized` | Produces the AI 校稿版 only. It should not be used to generate AI 精華摘要稿. |
| AI highlight draft | `extract-verbatim-highlights` | `spec-synchronized` | Produces AI 精華摘要稿 by selecting verbatim source lines only. It is select/delete only: no paraphrase, no rewriting, and output must preserve source order and timeline keep ranges. |
| Rough cut | `roughcut-video-locally` | `shared-project-engine` | Plans and renders rough cuts using the chosen transcript version, editable keep ranges, and smooth cut boundaries. |
| Subtitle review / burn-in | `subtitle-video-locally` | `direct-executable` | Creates SRT/ASS subtitles, powers subtitle review, and burns final subtitles. |
| PPT / PDF | `video-context-timeline-ppt` | `spec-synchronized` | Creates audience-facing PPT/PDF from the chosen transcript/content, avoiding production metadata and duplicate content. |
| B-roll | `generate-local-broll` | `direct-executable` | Plans, generates, checks, and exports local B-roll clips with sentence fit, keyword diversity, and visual QA. |
| Naming | `video-title-summarizer` | `spec-synchronized` | Generates fallback titles/file names from the whole transcript/content without clickbait. |

Do not replace these with unrelated internal heuristics unless the skill is unavailable and the fallback is explicitly documented to the user. Especially do not route AI 精華摘要稿 back through `speech-summary-polisher`; highlight generation must remain extractive via `extract-verbatim-highlights`.

## Key Files

- `server.js`: backend pipeline, routing, generation orchestration, cleanup behavior.
- `public/app.js`: main frontend workflow state and UI rendering.
- `public/styles.css`: UI styling.
- `scripts/generate_local_broll.py`: local B-roll generation and QA.
- `test/workflow-resilience.test.js`: tests around B-roll resilience and workflow behavior.
- `outputs/jobs`: generated project/job data. Be careful; this can be large.

## Commands

Start site:

```bash
npm start
```

Persistent site service (preferred for normal use):

```bash
launchctl kickstart -k gui/$(id -u)/com.openai.frameflow
launchctl print gui/$(id -u)/com.openai.frameflow
```

Service logs:

```text
logs/frameflow.stdout.log
logs/frameflow.stderr.log
```

Dev watch mode:

```bash
npm run dev
```

Validation commands:

```bash
node --check public/app.js
node --check server.js
.visual-venv/bin/python -m py_compile scripts/generate_local_broll.py
git diff --check
npm test
```

Last known validation result:

- `node --check public/app.js`: passed
- `node --check server.js`: passed
- `.visual-venv/bin/python -m py_compile scripts/generate_local_broll.py`: passed
- `git diff --check`: passed
- `npm test`: 76 tests passed
- Real roughcut FFmpeg full-decode verification: passed
- Browser verification: real mouse drag passed on both the roughcut and 37-caption subtitle timelines at `2.0x`; drag did not seek/select, and roughcut short-click seeking still passed
- 2026-08-24 selected-script roughcut fix: post-transcript generation now prioritizes the currently selected/checked transcript version before prior `usedVersionId`, and roughcut review records the transcript version/kind/label plus forced keep-range source when a selected script supplies keep ranges.
- 2026-08-24 highlight roughcut quality fix: AI highlight transcript selection is no longer tied to `aiBrollCount`; highlight segment scoring now penalizes dangling half-sentence endings, expands selected ranges to complete nearby ideas, and trims selections by the main content line (problem/cause/example/solution/conclusion) instead of only keyword/zone scoring.
- 2026-08-24 subtitle selected-script tracking fix: subtitle review generation now carries `transcriptVersionId`, `transcriptVersionKind`, `transcriptVersionLabel`, and `transcriptSource` through `prepareSubtitleReviewBeforeHighCost()` and roughcut-confirmed subtitle review, so subtitles can be verified against the selected script instead of falling back to ambiguous project state.
- 2026-08-25 roughcut script playback alignment fix: the roughcut review video element plays the source proxy and skips deletion ranges at playback time, so the script panel must highlight by the video element's actual source `currentTime`; do not convert that time through `editedTimeToSourceTime()` again. Gap highlighting now chooses the nearer previous/next transcript line instead of sticking to a stale previous line.
- 2026-08-25 highlight generation flow fix: AI 精華摘要稿 content now comes from the extract-verbatim-highlights-style extractive script (`extractVerbatimHighlightText`) and the backend only maps those selected original lines back to source timecodes (`mapVerbatimHighlightTextToTimeline`). Do not let `chooseHighlightSegments()` or any backend scoring become the final highlight text again.

## Known Residual Risks

The roughcut-to-subtitle-review portion has now passed a full real-video run. Remaining expensive validation begins only after the user reviews and confirms the current subtitle draft.

Next real-video validation should confirm after explicit subtitle approval:

- subtitle confirmation launches PPT/B-roll/final generation
- PPT/B-roll/final use the selected transcript and confirmed subtitle timing
- a single B-roll generation failure shows a warning and does not fail the final video
- a single B-roll MP4 export failure also shows a warning and preserves the other clips/final video
- final video preserves fps/audio quality as much as practical
- result page shows the final video first

A synthetic local export check has already confirmed one valid clip can finish while one deliberately missing clip is returned as skipped. The remaining risk is the expensive full real-video workflow above.

## Current User Priorities

The user currently cares most about:

- no stale transcript/timeline causing wrong subtitles, PPT, B-roll, or roughcut
- selected AI proofread/highlight scripts must drive roughcut/subtitles/PPT/B-roll/final output; do not let an old `usedVersionId` override the currently checked script
- AI highlight text must be the extractive skill result; backend scoring may not re-select different highlight content after the skill result
- AI highlight roughcuts must not select isolated half-sentences such as dangling “如果 / 應該”; selected highlight ranges should preserve a readable content arc, not only silence removal
- subtitle review must carry the same selected transcript identity as roughcut; do not allow subtitle/PPT/B-roll/final flows to infer from stale or ambiguous state
- roughcut script playback must stay aligned with the selected/checked script using source-time cues from the current preview video; avoid double-converting preview time
- high-quality final video
- B-roll semantic correctness and non-repetition
- PPT usefulness and no text overflow
- clean UI without extra/internal text
- workflow speed improvements only when they do not reduce quality
- app stability during preview/playback/editing

## Handoff Instruction For New Task

Before making changes in a new task:

1. Read this file fully.
2. Check the current `server.js`, `public/app.js`, and `public/styles.css` state.
3. Verify the local site responds at `http://localhost:3100/`.
4. Do not redo already completed fixes unless evidence shows they regressed.
5. Start from the residual risks and current user priorities above.
