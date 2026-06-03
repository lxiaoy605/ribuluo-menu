# 日不落串吧东北烧烤 — 电子菜单 进度记录

## 最终目标

基于 Vue3 + Vite 构建的电子菜单 SPA，部署到 Vercel。支持顾客浏览、商家后台管理、四语言切换（中/亚美尼亚/英/俄）、3 种主题、html2canvas 图片导出、二维码分享，数据存储于 localStorage。

详见方案文件：`C:\Users\levi\.claude\plans\html-vercel-3174-4490-rippling-bubble.md`

## 检查点完成状态

| # | 检查点 | 状态 |
|---|--------|------|
| 1 | 项目脚手架 & 配置文件 | ✅ 完成 |
| 2 | 核心源文件（main.js, router, composables, 默认数据 18分类/121菜品） | ✅ 完成 |
| 3 | Vue 组件（App, MenuView, AdminLogin, AdminDashboard） | ✅ 完成 |
| 4 | npm 依赖安装 | ✅ 完成 |
| 5 | 构建验证 (`vite build`) — 115模块, 938ms | ✅ 完成 |
| 6 | 功能审查 & Bug 修复 | ✅ 完成 |
| 7 | 联系方式（微信/WhatsApp/Telegram 二维码占位） | ✅ 完成 |
| 8 | 浏览器测试 | ⏳ 待执行 |
| 9 | GitHub 推送 & Vercel 部署 | ⏳ 待执行 |

## 已修复的问题

1. **严重**: 管理后台认证绕过（`authed` 永远为 true）→ 改用 sessionStorage 会话验证
2. **严重**: right/background 图片位置菜品重复渲染 → 改用 v-if/v-else-if 链
3. **中等**: 页面刷新后语言偏好丢失 → 添加 initLang() 恢复
4. **中等**: 图片上传无类型验证 → 添加 MIME 类型检查
5. **中等**: 多处文本硬编码中文 → 添加到四语言翻译表

## 关键决策

- Hash 路由模式（`#/` 顾客端，`#/admin` 商家端），适配 Vercel 静态托管
- 所有文本字段四语言对象 `{zh, am, en, ru}`，UI 切换按钮
- 图片 6 种位置：top / bottom / left / right / background / none
- 导出分辨率预设：手机版(1080×1920) / 海报版(2480×3508) / 高清版(3174×4490) / 自定义
- 商家后台需密码登录，sessionStorage 会话 + SHA-256 密码哈希
- 联系方式预留微信 + WhatsApp + Telegram 二维码位置（商家上传实际图片）

## 下一步

1. 商家上传实际二维码图片到联系方式区域
2. 本地 `npm run dev` 浏览器完整功能测试
3. 推送代码到 GitHub，绑定 Vercel 自动部署
