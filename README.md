# AI University — v2 視覺 × 多班級版

學生端視覺完整沿用「AI University 一鍵啟動版 v2」。
多班級資訊只由網址參數帶入，不增加學生端 UI。

## 學生網址範例
- A班：`?term=115-1&course=genai-system-design&class=A`
- B班：`?term=115-1&course=genai-system-design&class=B`
- EMBA班：`?term=115-1&course=genai-system-design&class=EMBA`

## 教師後台
`teacher.html`

正式收資料前，請把 `config.js` 的 `apiUrl` 改成 Google Apps Script Web App `/exec` 網址。
