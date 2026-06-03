# 日不落串吧东北烧烤 — 电子菜单 进度记录

## 最终目标

基于 Vue3 + Vite 构建的电子菜单 SPA，部署到 Vercel。支持顾客浏览、商家后台管理、四语言切换（中/亚美尼亚/英/俄）、3 种主题、html2canvas 图片导出、二维码分享。**数据持久化：Supabase (JSONB 单行表) + localStorage 缓存**。

## 检查点完成状态

| # | 检查点 | 状态 |
|---|--------|------|
| 1 | 项目脚手架 & 配置文件 | ✅ 完成 |
| 2 | 核心源文件（main.js, router, composables） | ✅ 完成 |
| 3 | Vue 组件（App, MenuView, AdminLogin, AdminDashboard） | ✅ 完成 |
| 4 | npm 依赖安装 | ✅ 完成 |
| 5 | 构建验证 (`vite build`) | ✅ 完成 |
| 6 | 功能审查 & Bug 修复（11 项页面问题） | ✅ 完成 |
| 7 | Cloudinary 图片上传对接 | ✅ 完成 |
| 8 | Supabase 数据持久化迁移 | ✅ 代码完成 ⏳ 待执行 SQL |
| 9 | Supabase 订单表 | ✅ 表已建 |
| 10 | GitHub 推送 & Vercel 部署 | ⏳ 待执行 |
| 11 | 订单前端界面 | ⏳ 待确认设计 |

## 技术架构

- **框架**: Vue 3 Composition API + Vite 5 + Vue Router (Hash 模式)
- **数据存储**: Supabase (`menu_config` 单行 JSONB 表, RLS 允许匿名读写)
- **图片存储**: Cloudinary unsigned upload (`dnpbszdiu` / `ribuluo_menu`)
- **认证**: 密码 SHA-256 哈希 + sessionStorage 会话
- **国际化**: 四语言 (zh/am/en/ru)
- **主题**: 3 套 (红金烧烤 / 经典纯红 / 雅致私厨)，CSS 变量驱动
- **海报导出**: html2canvas (1456×2048 PNG)
- **二维码**: qrcode 库

## 关键文件

| 文件 | 职责 |
|------|------|
| `src/composables/useMenuData.js` | 核心数据层：Supabase 读写 + 内存缓存 + localStorage 缓存 + CRUD |
| `src/composables/useSupabase.js` | Supabase 客户端（单例） |
| `src/composables/useCloudinary.js` | Cloudinary 图片上传 |
| `src/composables/useOrders.js` | 订单 CRUD（Supabase orders 表） |
| `src/composables/useTheme.js` | 3 套主题 CSS 变量 + 字体加载 |
| `src/composables/useI18n.js` | 四语言切换 + 翻译表 |
| `src/App.vue` | 顶栏（店名/语言/主题/编辑）+ 路由视图 |
| `src/views/MenuView.vue` | 顾客端：三级导航（固定底部一级 + 横向二级 + 垂直菜品列表） |
| `src/views/AdminDashboard.vue` | 管理端：分类/菜品 CRUD + 联系方式 + 数据导入导出 + 海报导出 |
| `src/views/AdminLogin.vue` | 密码登录页 |
| `supabase/menu_config_schema.sql` | 菜单配置表 DDL |
| `supabase/orders_schema.sql` | 订单表 DDL |

## 数据流（Supabase 迁移后）

```
读: 组件 → getMenuData() → menuCache (ref) → 上次从 Supabase 加载的数据
写: 组件 → CRUD() → saveToServer(data) → Supabase UPSERT + 更新 menuCache + 更新 localStorage
初始: App.vue onMounted → initDefaultData(defaultMenu)
       → loadFromServer() → Supabase SELECT → 有数据? 用服务器数据 : 写入默认数据
       → Supabase 不可用? 回退 localStorage
```

## 已修复的问题

1. 数据迁移重复触发 bug（`initDefaultData` 每次刷新覆盖用户数据）
2. 管理后台认证绕过（`authed` 永远为 true）
3. right/background 图片位置菜品重复渲染 → v-if/v-else-if 链
4. 页面刷新后语言偏好丢失
5. 图片上传无类型验证
6. 11 个 UI 问题（店名居中、按钮动效、禁止拖选、菜品图片、管理页按钮、海报修复等）
7. 海报一级分类重复显示 + 虚线问题 + 分页切割
8. localStorage 跨浏览器数据不同步 → 迁移到 Supabase

## 下一步

1. **在 Supabase SQL Editor 执行 `supabase/menu_config_schema.sql`**（必须！否则数据无法写入服务器）
2. 本地 `npm run dev` 完整功能测试
3. 推送代码到 GitHub，绑定 Vercel 自动部署
