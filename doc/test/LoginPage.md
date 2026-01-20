---
description: LoginPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】檢查登入頁面初始渲染
**範例輸入**：進入 /login 頁面
**期待輸出**：
1. 顯示「歡迎回來」標題
2. 顯示 Email 輸入框 (type="text", empty)
3. 顯示密碼輸入框 (type="password", empty)
4. 顯示登入按鈕 (enabled)

---

## [x] 【function 邏輯】驗證 Email 格式錯誤
**範例輸入**：
1. Email 輸入 "invalid-email"
2. 點擊登入按鈕
**期待輸出**：
1. Email 輸入框下方顯示「請輸入有效的 Email 格式」
2. 不會觸發 API 請求

---

## [x] 【function 邏輯】驗證密碼長度不足
**範例輸入**：
1. Email 輸入 "valid@example.com"
2. 密碼輸入 "1234567" (7 chars)
3. 點擊登入按鈕
**期待輸出**：
1. 密碼輸入框下方顯示「密碼必須至少 8 個字元」
2. 不會觸發 API 請求

---

## [x] 【function 邏輯】驗證密碼缺少英文字母或數字
**範例輸入**：
1. Email 輸入 "valid@example.com"
2. 密碼輸入 "12345678" (only numbers)
3. 點擊登入按鈕
**期待輸出**：
1. 密碼輸入框下方顯示「密碼必須包含英文字母和數字」
2. 不會觸發 API 請求

---

## [x] 【Mock API】模擬登入成功
**範例輸入**：
1. Email 輸入 "user@example.com"
2. 密碼 輸入 "password123"
3. Mock `login` resolve
4. 點擊登入按鈕
**期待輸出**：
1. 顯示 Loading 狀態 (按鈕變為「登入中...」)
2. `login` function 被呼叫
3. 成功後導向至 `/dashboard`

---

## [x] 【Mock API】模擬登入失敗 (API 錯誤)
**範例輸入**：
1. Email 輸入 "user@example.com"
2. 密碼 輸入 "wrongpassword123"
3. Mock `login` reject with message "帳號或密碼錯誤"
4. 點擊登入按鈕
**期待輸出**：
1. 顯示 Loading 狀態後恢復
2. 顯示錯誤訊息 Banner：「帳號或密碼錯誤」

---

## [x] 【驗證權限】已登入狀態自動導向
**範例輸入**：
1. 設定 `isAuthenticated` 為 true
2. 進入 /login 頁面
**期待輸出**：
1. 自動導向至 `/dashboard`

---

## [] 【function 邏輯】顯示登入過期訊息
**範例輸入**：
1. 設定 `authExpiredMessage` 為 "連線逾時，請重新登入"
2. 進入 /login 頁面
**期待輸出**：
1. 顯示錯誤訊息 Banner：「連線逾時，請重新登入」
2. 呼叫 `clearAuthExpiredMessage`
