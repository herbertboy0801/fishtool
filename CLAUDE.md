# Fishtool Web - 闲鱼运营助手

## 项目概述
1:1 复刻 yuanfangge.com 的闲鱼运营助手工具，面向闲鱼卖家的运营工具箱 PWA。

## 技术栈
- **前端**: Next.js 16 (App Router) + React 19 + TypeScript (Strict) + Tailwind CSS v4
- **状态管理**: Zustand + localStorage (xianyu_ 前缀)
- **部署**: Vercel (Serverless)
- **后端**: Next.js API Routes (Phase 2+)

## 项目结构
```
src/
├── app/
│   ├── (auth)/          # 认证路由组 (login, register)
│   ├── (main)/          # 主路由组 (首页, 工具列表, 设置) - 带底部导航
│   ├── (tools)/         # 工具路由组 (各工具页面) - 全屏无底部导航
│   └── api/             # API Routes (Phase 2+)
├── components/
│   ├── ui/              # 基础 UI 组件 (toast, modal)
│   ├── layout/          # 布局组件 (bottom-nav, page-header, tab-bar)
│   └── tools/           # 工具专属组件
├── lib/
│   ├── store.ts         # localStorage 封装
│   └── auth.ts          # 认证状态 (Zustand)
└── hooks/               # 自定义 Hooks
```

## 开发命令
```bash
cd fishtool-web
npm run dev      # 开发服务器
npm run build    # 构建
npm run lint     # ESLint 检查
```

## 设计规范
- 暗色主题: 背景 #0f1120, 卡片 #1a1d35, 边框 #2a2d45
- 主色: #f5c518 (金黄色, 和原站一致)
- 移动优先, PWA 支持
- 所有工具页面使用 PageHeader 组件 (返回按钮 + 标题)

## 编码约定
- 组件: PascalCase, 函数/变量: camelCase
- 优先 Server Components, 交互组件用 "use client"
- localStorage key 统一 xianyu_ 前缀
- 使用 Zod 验证 API 输入 (Phase 2+)
