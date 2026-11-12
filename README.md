# Frameflow — Video Story Studio

在 `http://localhost:3100` 上傳影片，於本機完成轉錄、內容脈絡簡報、AI 品質 B-roll 與成片輸出：

- 台灣繁體中文逐字稿 `.txt`
- 依影片重點產生主標、必要副標與候選標題 `.json`
- 可編輯 PowerPoint `.pptx` 與單獨下載的簡報 `.pdf`
- B-roll 規劃表 `.csv` / `.json`
- 依逐字稿語意生成的本機品質 B-roll 與 1920×1080 MP4

## 影片重點與標題策略

若只需要讀影片重點、產生主標與必要副標，不需要啟動網站：

```bash
npm run title:strategy -- --input "/absolute/path/video.mp4" --language zh --context "人名、品牌或專有名詞"
```

也可以直接吃既有逐字稿：

```bash
npm run title:strategy -- --input "/absolute/path/transcript.txt" --output "/absolute/path/title-strategy.json"
```

輸出 JSON 會包含主標、副標、重點依據、觀眾承諾與多個候選標題。

## 啟動

需要 Node.js 20 以上。

```bash
npm install
npm run setup:visuals
npm start
```

開啟 <http://localhost:3100>。可先把 B-roll 片段數量設成「1 段」測試。`setup:visuals` 會設定本機 Python 影像生成環境並檢查模型，不需要付費 API，也不會上傳素材。

上傳真實影片時，第一次會由 `transcribe-video-locally` 技能自動建立 Whisper 環境並下載 `small` 模型，之後即可離線使用。新版轉錄會每 5 分鐘切段、啟用詞語時間戳，並依停頓補上繁中標點與段落。

## 隱私與暫存

- 逐字稿透過 `/Users/redball/.codex/skills/transcribe-video-locally/scripts/run.sh` 在本機產生。
- 影片、逐字稿、AI 提示詞與生成畫面都不會送到雲端。
- 原始上傳檔在專案處理完成或失敗後刪除。
- 下載成果保留在 `outputs/jobs/<job-id>/`，方便測試與重複下載。

## 本機 AI B-roll

系統會先從逐字稿找出櫻花、咖啡、列車、城市、山景、湖泊、產品、數據、關係討論等視覺概念，再使用本機 Stable Diffusion/LCM 模型產生高品質 16:9 keyframe，最後由 FFmpeg 做成 5 秒平滑推鏡 MP4。每段 B-roll 都會加上鏡頭檢查清單，要求主體、動作與道具明確；辦公室要有人或手部工作，紙張與白板要有抽象筆記痕跡，旅行或地點畫面要加入人物尺度或前景道具，關係題材要有實際人物互動，避免空景填充。

## PowerPoint

PowerPoint 以影片內容為主：先整理核心論點、例子與觀眾理解路徑，再用章節切入時間輔助剪入影片。產生後會跑版面 overflow 檢查，並同步輸出 PDF；是否把 PPT 畫面剪進完整成片可在功能選擇中獨立勾選。
