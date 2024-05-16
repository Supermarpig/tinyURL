# 短網址服務

## 資料夾結構

short-url-service/
├── app/
│   ├── api/
│   │   ├── [shortId]/
│   │   │   └── route.ts
│   │   └── shorten/
│   │       └── route.ts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── mongodb.ts
├── models/
│   └── Url.ts
├── public/
├── .env.local
├── .eslintrc.json
├── .gitignore
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json

## 專案結構

app/ - 包含 Next.js 的頁面和 API 路由。
api/ - 包含 API 路由處理程序。
[shortId]/route.ts - 處理短網址重定向的 API 路由。
shorten/route.ts - 處理縮短 URL 的 API 路由。
globals.css - 使用 TailwindCSS 的全局樣式。
layout.tsx - 應用程式的佈局元件。
page.tsx - 應用程式的首頁。
lib/ - 包含實用函數和 MongoDB 連接邏輯。
mongodb.ts - MongoDB 連接邏輯。
models/ - 包含 Mongoose 模型。
Url.ts - URL 的 Mongoose 模型。
public/ - 包含靜態文件。
.env.local - 環境變數。
.eslintrc.json - ESLint 配置。
.gitignore - Git 忽略文件。
next.config.mjs - Next.js 配置。
package.json - 專案的相依套件和腳本。
pnpm-lock.yaml - pnpm 的鎖定文件。
postcss.config.mjs - PostCSS 配置。
README.md - 本 README 文件。
tailwind.config.ts - TailwindCSS 配置。
tsconfig.json - TypeScript 配置。

## API 路由

POST /api/shorten
此路由用來縮短給定的 URL。

請求體：

json
複製程式碼
{
  "originalUrl": "<https://example.com>"
}
回應：

json
複製程式碼
{
  "shortUrl": "<http://localhost:3000/abcdef>"
}
GET /api/[shortId]
此路由用來重定向到對應短 ID 的原始 URL。

## 環境變數

MONGODB_URI - 用於連接到 MongoDB 資料庫的 URI。

## 授權條款

此專案使用 MIT 授權條款。
