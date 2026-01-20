---
description: DashboardPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】檢查儀表板初始渲染
**範例輸入**：進入 /dashboard 頁面 (User: "TestUser", Role: "user")
**期待輸出**：
1. 顯示「Welcome, TestUser 👋」
2. 顯示「一般用戶」角色徽章
3. 不顯示「管理後台」連結
4. 顯示登出按鈕

---

## [x] 【前端元素】管理員權限顯示
**範例輸入**：進入 /dashboard 頁面 (Role: "admin")
**期待輸出**：
1. 顯示「管理員」角色徽章
2. 顯示「🛠️ 管理後台」連結，並連向 `/admin`

---

## [x] 【Mock API】成功載入商品列表
**範例輸入**：
1. Mock `productApi.getProducts` 回傳商品陣列
2. 進入 /dashboard 頁面
**期待輸出**：
1. 初始顯示「載入商品中...」
2. 載入完成後顯示商品列表
3. 每個商品卡片顯示正確的名稱、價格、描述

---

## [x] 【Mock API】載入商品失敗
**範例輸入**：
1. Mock `productApi.getProducts` reject with error message "網路錯誤"
2. 進入 /dashboard 頁面
**期待輸出**：
1. 顯示錯誤訊息 Banner：「網路錯誤」
2. 不顯示商品列表

---

## [x] 【function 邏輯】登出功能
**範例輸入**：
1. 點擊登出按鈕
**期待輸出**：
1. `logout` function 被呼叫
2. 導向至 `/login` 頁面
