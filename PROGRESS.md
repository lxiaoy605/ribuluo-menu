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
| 9 | 订单前端界面 | ✅ 完成 |
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

### 2026-06-04 后半段优化

**管理后台顶栏精简**
- 移除 logo 和"风格切换"下拉框（管理页面）
- 新增"退出"按钮（清除 sessionStorage 登录状态，跳转登录页）
- 新增"重置密码"弹窗（SHA-256 加密，数据同步 Supabase）
- 顶栏按钮过多时支持左右滚动（`overflow-x: auto`）

**菜单页面优化**
- 一级分类字体 11px → 14px bold，图标 18px → 20px
- 店名从 h1 改为 span，字体 20px → 16px
- 右下角悬浮联系气泡（💬，主题色，脉冲动画，不遮挡底部导航）
- 联系方式弹窗：横列展示二维码，显示账户名 + 复制图标 📋，点击图片可保存

**联系方式管理重构**
- contacts 格式升级：`{wechat: '', ...}` → `{wechat: {url, name}, ...}`
- 旧格式自动迁移（string → {url, name}）
- 紧凑单行布局：标签 + 图片/上传区 + 账号输入框 + 保存按钮 + 移除按钮
- 账号名保存需手动点击"保存"按钮（不再自动同步）

**海报二维码**
- 每张海报最底部居中横列展示联系方式二维码（120×120px）
- 二维码下方显示账户名

**分享菜单**
- 根据当前 URL 生成二维码（qrcode 库）
- 支持下载二维码到本地（📥 按钮）

**Git 仓库清理**
- `doc/` 目录纳入 .gitignore，从版本控制中移除

**Git 提交记录**
5. `优化：联系方式重构+管理后台精简+菜单页气泡+海报/分享二维码`

### 2026-06-04 订单功能实现

**数据库迁移**
- `supabase/orders_v2_migration.sql`：订单表结构升级
  - id 改为 TEXT 类型（支持 RN+datetime 自定义格式）
  - 新增 status（pending/completed）、order_mode（dine_in/delivery）
  - delivery_address、device_id 字段

**购物车状态管理** (`src/composables/useCart.js`)
- 双层存储：`ribuluo_cart`（购物车数据）+ `ribuluo_order_ids`（本设备订单号列表）
- 核心方法：addItem/removeItem/setItemQty、clearCart、loadOrder（加载历史订单到当前预订）、addOrderId/getOrderIds
- 响应式导出：itemCount/totalAmount/cartItems/cartForm/editingOrderId

**国际化扩充** (`src/composables/useI18n.js`)
- 新增 35 个订单相关 key，覆盖中/英/亚美尼亚/俄四语言

**菜单页改造** (`src/views/MenuView.vue`)
- 售罄菜品：保持原布局，不显示数量控件
- 有图菜品：图片 + 双行布局（第一行名称+徽章，第二行价格+数量控件）
- 无图菜品：单行（名称+数量+价格）
- 数量控件：− / 输入框 / +，最小0最大999，支持直接输入

**顶栏购物车入口** (`src/App.vue`)
- 🔥 图标 → 🛒 + 红色角标（显示 itemCount，为0时隐藏）
- 点击跳转 /cart

**购物车页面** (`src/views/CartView.vue`)
- 双页签：当前预订 | 历史预订
- 当前预订：菜品明细表 + 预订表单（方式/地址/人数/时间/姓名/联系方式/备注）+ 提交/清空/继续点菜
- 历史预订：从 Supabase 按 localStorage 中的订单号批量同步，搜索过滤，折叠展开详情
- 修改功能：pending 订单可加载回当前预订 tab 重新编辑提交
- 冲突保护：当前预订非空时阻止加载历史订单修改
- 提交流程：校验 → 生成 RN 单号（ddhhmmss格式）→ Supabase 写入/更新 → 单号展示+复制
- 单号冲突自动重试（追加随机字符，最多3次）

**订单服务更新** (`src/composables/useOrders.js`)
- submitOrder 支持新字段（id/status/order_mode/delivery_address/device_id）
- 新增 updateOrderById（修改已有订单）
- 新增 getOrdersByIds 批量查询
- genOrderId 生成 RN+ddhhmmss 格式单号

**路由** (`src/router/index.js`)
- 新增 `/cart` 路由

**构建验证**：`npm run build` 无报错，6个 chunk 正常生成

### 2026-06-04 管理端订单功能

**数据库**
- `delivery_fee` 新增字段（INTEGER DEFAULT 0），追加到迁移脚本

**新依赖**
- `chart.js`：轻量图表库（~60KB gzipped），用于订单统计柱状图（年内各月 / 月内各日）

**提示音** (`src/composables/useAlertSound.js`)
- Web Audio API 生成三连提示音（880/1100/1320Hz 方波）
- 处理浏览器自动播放限制：首次用户交互时静默解锁 AudioContext，后续自动播放
- 管理员进入订单管理页时通过 `activate()` 激活

**订单管理页** (`src/views/AdminOrders.vue`，~400 行)
- 统计栏：今日待处理/已处理/已完成金额 + 本月订单数/金额 + "详细统计"链接
- 搜索区：订单号/下单时间/联系人/预订方式/联系类型/联系方式
- 双页签：待处理订单 / 已完成（分页，每页20条）
- 展开详情：菜品明细表 + 订单信息 + 操作按钮（同用户端风格）
- 操作功能：完成结算 / 结算撤回 / 编辑 / 删除，均含二次确认
- 配送费："追加配送费"按钮（prompt输入）→ 3秒 Toast "配送费更新成功"
- 编辑弹窗：菜品增删改（含"点菜"按钮→搜索菜单菜品选择）、表单编辑、提交更新
- 详细统计弹窗：本年/本月订单数+金额 + Chart.js 柱状图（月/日切换）
- 5秒轮询：统计栏自动刷新，pending 数量变化时播放提示音

**管理后台改造** (`src/views/AdminDashboard.vue`)
- "订单管理"按钮（红色脉冲角标显示 pending 数量）
- 5秒轮询 badging，新增订单时触发提示音
- 按钮宽度自适应（`.admin-top-btn` flex:1 + 窄间距）

**用户端更新** (`src/views/CartView.vue`)
- 历史订单详情：配送地址旁添加 📋 一键复制
- 配送订单显示 YandexGo / GG 跳转按钮（深链接拉起App）
- 配送费展示（仅显示，不可编辑）

**路由**
- 新增 `/admin/orders` 路由 → AdminOrders.vue（懒加载）

**涉及文件清单**

| 操作 | 文件 |
|------|------|
| 新增 | `src/composables/useAlertSound.js` |
| 新增 | `src/views/AdminOrders.vue` |
| 修改 | `supabase/orders_v2_migration.sql` |
| 修改 | `src/composables/useOrders.js` |
| 修改 | `src/views/AdminDashboard.vue` |
| 修改 | `src/views/CartView.vue` |
| 修改 | `src/router/index.js` |

## 下一步

1. ❗ 用户在 Supabase SQL Editor 中执行 `supabase/orders_v2_migration.sql`（包含 delivery_fee 字段）
2. 全流程测试（菜单加购 → 提交 → 管理端查单 → 编辑 → 完成结算 → 撤回 → 统计）
3. 三方配送 App 深链接实测（YandexGo/GG），确认能否拉起 App
4. 微信/WhatsApp/Telegram 联系类型统计（当前下拉框仅列出 4 种，用户自输不在搜索选项中）
5. Vercel 部署
