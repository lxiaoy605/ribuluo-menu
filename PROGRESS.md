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
| 5 | 构建验证 | ✅ 完成 |
| 6 | Cloudinary 图片上传对接 | ✅ 完成 |
| 7 | Supabase 数据持久化迁移 | ✅ 完成 |
| 8 | Supabase 订单表 | ✅ 表已建 |
| 9 | 订单前端界面 | ⏳ 明天继续 |
| 10 | Vercel 部署 | ⏳ 待执行 |

## 2026-06-04 工作总结

### Supabase 数据持久化迁移
- `useMenuData.js` 重写：Supabase 主存储 + 内存缓存(`menuCache`) + localStorage 缓存
- 所有 CRUD 操作实时写入 Supabase `menu_config` 表（id=1 单行 JSONB）
- 读操作从内存缓存同步读取，组件无感知
- 新增 `loadedFromServer` 标志位：检测到数据来自本地回退时自动推送到 Supabase

### 异步加载时序修复
- `App.vue` onMounted 改为 async/await，确保数据就绪后再初始化主题和语言
- `MenuView.vue` onMounted 改为 watch(sortedCategories)，数据到达后自动选中第一个二级分类
- `AdminDashboard.vue` 新增 watch(getMenuData) 响应式同步，解决后台数据为空
- `AdminDashboard.vue` importJSON 调用修复为 await

### 海报分页修复
- 换页判断从 `maxItems <= 0`（永不为 true）改为 `availH < ROW_H`
- 新增 TITLE_H=100px 扣除标题占用高度
- pageCount 直接使用 paginate() 结果，确保估算与实际一致

### 管理列表图片标注
- 菜品列表新增 📷（有图）/ ⚪（无图）状态指示

### Git 提交记录（今日 5 次）
1. `feat: 数据持久化迁移到Supabase，解决跨浏览器隔离问题`
2. `fix: 异步数据加载时序问题 + 自动初始化空Supabase表`
3. `fix: 海报分页计算修复 + 管理列表图片标注`
4. `fix: pageCount 无数据时兜底为1页`

## 下一步

1. 完整测试（`dist/index.html` 双击打开）验证数据同步
2. 订单前端界面开发
3. Vercel 部署
