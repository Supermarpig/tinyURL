# 短網址服務

## 資料夾結構

```bash
short-url-service/
├── app/
│   ├── api/
│   │   ├── [shortId]/
│   │   │   ├── route.ts
│   │   │   ├── update.ts
│   │   ├── redirect/
│   │   │   ├── [shortId]/
│   │   │   │   └── route.ts
│   │   ├── shorten/
│   │   │   └── route.ts
│   │   ├── test/
│   │   │   └── [shortId]/
│   │   │       └── route.ts
│   │   ├── trackClick/
│   │   │   └── route.ts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
├── components/
│   ├── ui/
│   │   ├── InfoDialog.tsx
│   │   ├── LoadingSpinner.tsx
├── lib/
│   └── mongodb.ts
├── models/
│   └── Url.ts
├── utils/
│   ├── httpStatusEnum.ts
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

```

## API 路由

POST /api/shorten
此路由用來縮短給定的 URL。

## 環境變數

MONGODB_URI - 用於連接到 MongoDB 資料庫的 URI。

## 授權條款

此專案使用 MIT 授權條款
