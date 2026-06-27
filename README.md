<div align="center">

# 命运之轮 — Decision Roulette

> 输入选项，生成炫酷轮盘，把选择困难变成一场仪式感体验。

[![License](https://img.shields.io/github/license/NOSOLUTIONLOVE/Decision_Roulette?style=for-the-badge)](LICENSE)
[![GitHub Repo](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/NOSOLUTIONLOVE/Decision_Roulette)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

<br />

[功能](#-features) · [快速开始](#-快速开始) · [技术栈](#%EF%B8%8F-tech-stack) · [本地开发](#-本地开发) · [许可证](#-license)

</div>

---

## ✨ Features

- **自定义选项管理** — 输入 2–50 个选项，支持拖拽排序与一键载入预设
- **物理阻尼轮盘** — Canvas 2D + CSS 3D Transform，真实物理减速
- **DOM 文字覆盖** — 扇区文字独立渲染，idle 旋转时仍保持正立可读
- **蓄力转动机制** — 按住按钮蓄力，松手释放，力度决定旋转时长
- **程序化音效** — Web Audio API 合成，无需音频文件
- **结果动画与粒子特效** — 仪式感拉满的结果展示
- **历史记录与预设** — IndexedDB 持久化，离线可用
- **三套主题** — 暖纸编辑风 / 霓虹夜 / 莫兰迪
- **中英双语** — 内置 i18n，一键切换语言
- **PWA 可安装** — 离线可用，可安装到主屏
- **分享卡生成** — 一键生成精美分享图，支持系统原生分享

## 🚀 快速开始

```bash
git clone git@github.com:NOSOLUTIONLOVE/Decision_Roulette.git
cd Decision_Roulette
npm install
npm run dev
```

打开浏览器访问 `http://localhost:5175/`。

## 🛠 Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Persistence | Dexie.js (IndexedDB) |
| Rendering | Canvas 2D + CSS 3D Transform |
| Audio | Web Audio API |
| PWA | vite-plugin-pwa |
| Testing | Vitest + Testing Library |
| Deploy | Vercel |

## 📦 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

## 📖 使用说明

1. 在输入框中添加你的选项（至少 2 个）
2. 长按"转动"按钮蓄力，松手释放
3. 等待轮盘停止，查看结果
4. 点击分享按钮，将结果分享给朋友
5. 历史记录自动保存到本地

### 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | 代码检查 (oxlint) |
| `npm run test` | 运行测试 |
| `npm run test:watch` | watch 模式测试 |
| `npm run test:coverage` | 测试覆盖率报告 |

## 📁 项目结构

```
src/
├── app/           # 应用入口与路由
├── components/    # UI 组件
│   ├── history/   # 历史记录与预设
│   ├── layout/    # 布局与导航
│   ├── options/   # 选项输入与管理
│   ├── result/    # 结果展示
│   ├── settings/  # 设置面板
│   ├── share/     # 分享面板
│   ├── ui/        # 基础 UI 组件
│   └── wheel/     # 轮盘相关
├── engine/        # 渲染引擎、物理引擎、音效、粒子
├── hooks/         # React hooks
├── lib/           # 工具函数与 i18n
├── pages/         # 页面组件
├── store/         # Zustand store
├── styles/        # 全局样式
└── types/         # TypeScript 类型定义
```

## 📄 License

MIT License — 见 [LICENSE](LICENSE)。
