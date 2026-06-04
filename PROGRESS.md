# 日不落串吧东北烧烤 — 电子菜单 项目文档

## 项目概况

基于 Vue3 + Vite 构建的电子菜单 SPA，部署到 Vercel。支持顾客浏览+下单、商家后台管理、四语言切换、三种主题、海报导出、二维码分享。

- **仓库**: https://github.com/lxiaoy605/ribuluo-menu
- **部署**: https://ribuluo-menu.vercel.app (hash路由 `/#/`)
- **开发周期**: 2026-06-03 ~ 2026-06-04（41 次提交）
- **Git 用户**: afeng

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API, `<script setup>`) |
| 构建 | Vite 5 |
| 路由 | Vue Router 4 (createWebHashHistory) |
| 后端 | Supabase (menu_config 单行 JSONB + orders 表) |
| 图片 | Cloudinary (上传/存储) |
| 图表 | Chart.js 4 (按月/按日柱状图) |
| 二维码 | qrcode (分享菜单 + 海报底部) |
| 海报 | html2canvas (DOM → PNG, 1456×2048) |
| 字体 | Google Fonts: Noto Sans SC, Noto Serif SC, Ma Shan Zheng |

## 项目结构

```
ribuluoMenu/
├── src/
│   ├── main.js                          # 入口
│   ├── App.vue                          # 顶栏(店名/语言/主题/购物车)/路由出口
│   ├── router/index.js                  # 5条路由 + beforeEach守卫
│   ├── composables/
│   │   ├── useMenuData.js               # Supabase CRUD + 内存缓存 + localStorage
│   │   ├── useTheme.js                  # 3主题CSS变量管理 + 字体加载
│   │   ├── useI18n.js                   # 4语言翻译(zh/am/en/ru)
│   │   ├── useCart.js                   # 购物车状态(localStorage双层存储)
│   │   ├── useOrders.js                 # Supabase订单CRUD
│   │   ├── useSupabase.js               # Supabase客户端初始化
│   │   ├── useCloudinary.js             # Cloudinary图片上传
│   │   └── useAlertSound.js             # Web Audio API新订单提示音
│   ├── views/
│   │   ├── MenuView.vue                 # 顾客菜单页(分类/菜品/加购)
│   │   ├── CartView.vue                 # 购物车页(当前预订/历史预订)
│   │   ├── AdminLogin.vue               # 管理员登录
│   │   ├── AdminDashboard.vue           # 管理后台(菜单CRUD/海报/分享/联系)
│   │   └── AdminOrders.vue              # 订单管理(统计/搜索/操作/编辑)
│   └── data/
│       └── defaultMenu.js               # 默认菜单(用于初始化空Supabase表)
├── supabase/
│   ├── menu_config_schema.sql           # menu_config表DDL
│   ├── orders_schema.sql                # orders表DDL
│   └── orders_v2_migration.sql          # 订单表迁移(status/order_mode/delivery_fee)
├── public/themes/                       # 3主题背景图(1456×2048 PNG)
├── vite.config.js
└── package.json
```

## 路由

| 路径 | 组件 | 权限 | 说明 |
|------|------|------|------|
| `/` | MenuView | 公开 | 顾客菜单浏览 |
| `/cart` | CartView | 公开 | 购物车(当前预订/历史) |
| `/admin` | AdminLogin | 公开 | 管理员登录(用户名+SHA-256密码) |
| `/admin/dashboard` | AdminDashboard | requiresAuth | 菜单CRUD/海报/分享 |
| `/admin/orders` | AdminOrders | requiresAuth | 订单管理/统计 |

路由守卫：`beforeEach` 同步检查 `sessionStorage.ribuluo_admin_auth`，防止刷新闪烁。

## 数据模型

### Supabase menu_config 表 (单行 JSONB, id=1)

```json
{
  "categories": [{ "id": "cat_001", "name": {"zh":"烧烤","am":"...","en":"...","ru":"..."}, "sort": 0,
    "children": [{ "id": "sub_001", "name": {...}, "sort": 0,
      "items": [{ "id": "item_001", "name": {...}, "price": 3500, "image": "url", "imagePosition": "top", "recommended": false, "soldOut": false }]
    }]
  }],
  "shopName": {"zh": "日不落串吧", "am": "...", "en": "...", "ru": "..."},
  "contacts": {
    "wechat": {"url": "", "name": ""},
    "whatsapp": {"url": "", "name": ""},
    "telegram": {"url": "", "name": ""}
  },
  "theme": "bbq-red-gold",
  "password": "sha256哈希"
}
```

### Supabase orders 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | RN + ddhhmmss (如 RN04143045) |
| items | JSONB | [{id, name, price, qty}] |
| total_amount | NUMERIC | 订单总金额 |
| status | TEXT | 'pending' / 'completed' |
| order_mode | TEXT | 'dine_in' / 'delivery' |
| customer_name | TEXT | 称呼 |
| contact_type | TEXT | phone/whatsapp/telegram/wechat |
| contact_info | TEXT | 号码 |
| guest_count | INT | 人数 |
| expected_time | TIMESTAMPTZ | 预期到店/配送时间 |
| notes | TEXT | 备注 |
| delivery_address | TEXT | 配送地址(仅delivery) |
| delivery_fee | INT | 配送费(管理端追加) |
| device_id | TEXT | 设备标识 |
| created_at | TIMESTAMPTZ | DEFAULT now() |

## 主题系统

| ID | 名称 | 底色 | 强调色 | 标题字体 | 背景图 |
|----|------|------|--------|----------|--------|
| `bbq-red-gold` | 红金烧烤 | #3A1612 深棕 | #D4AF37 金 | Ma Shan Zheng | 有装饰边框(~185px) |
| `classic-red` | 经典纯红 | #8B1E23 红 | #F5D58B 金 | Ma Shan Zheng | 无边框 |
| `private-kitchen` | 雅致私厨 | #F6F1E8 米 | #7D2F2F 深红 | Ma Shan Zheng | 无边框 |

- CSS变量动态注入 `document.documentElement.style`
- 背景图仅用于海报导出(html2canvas)，页面背景使用纯色
- 海报常量：`PAGE_W=1456, PAGE_H=2048, PAGE_PAD=80, PAGE_PAD_BBQ=220`
- 红金主题 PAGE_PAD_BBQ=220 使内容区(~1016×1608)避开装饰边框

## 功能清单

### 顾客端 (MenuView + CartView)
- [x] 四级导航：一级/二级分类标签 + 菜品网格
- [x] 四语言切换 (zh/am/en/ru)，记忆到 localStorage
- [x] 三种主题切换，记忆到 Supabase
- [x] 菜品加购：−/输入框/+，最小0最大999，售罄禁购
- [x] 有图菜品：图片 + 双行(名称+徽章 / 价格+数量)
- [x] 无图菜品：单行(名称/价格/数量)
- [x] 顶栏购物车按钮 + 红色角标(脉冲动画)
- [x] 右下角悬浮联系气泡(💬, 脉冲动画)
- [x] 联系方式弹窗(微信/WhatsApp/Telegram二维码+账户名+复制)
- [x] 当前预订：菜品明细 + 预订表单 + 提交/清空/继续点菜
- [x] 历史预订：localStorage订单号 → Supabase批量同步 → 搜索/折叠/修改
- [x] 订单号：RN+ddhhmmss格式，可复制，详情顶部显示
- [x] 修改保护：当前预订非空时阻止加载历史订单
- [x] 提交后自动跳转历史预订tab
- [x] 配送订单显示配送费(YandexGo/GG按钮仅管理端)
- [x] 地址一键复制📋

### 管理端 (AdminDashboard + AdminOrders)
- [x] 用户名+密码登录(SHA-256)，sessionStorage保持
- [x] 路由守卫防止刷新闪烁
- [x] 菜单CRUD：一级/二级分类 + 菜品(名称/价格/图片/位置/推荐/售罄)
- [x] 菜品图片Cloudinary上传(5M限制，JPG/PNG/WebP)
- [x] 图片位置6种(top/bottom/left/right/background/none)
- [x] 联系方式二维码上传 + 账户名保存
- [x] 店名四语言编辑
- [x] 重置密码(SHA-256)
- [x] 海报导出：选语言 → html2canvas分页 → 多张PNG下载
- [x] 海报分页算法：基于可用高度动态分批，含图片行高度差异
- [x] 海报底部联系方式二维码(120×120)+账户名
- [x] 分享二维码生成(qrcode) + 下载 + 复制链接
- [x] 数据JSON导入/导出(完整备份)
- [x] **订单管理**：统计 + 搜索 + 双页签(pending/completed) + 分页
- [x] 订单操作：完成结算/撤回/编辑/删除(均二次确认)
- [x] 订单详情：菜品明细 + 订单信息 + 订单号可复制
- [x] 编辑弹窗：菜品增删改(含菜单搜索) + 表单编辑
- [x] 配送费追加(prompt输入)
- [x] 三方配送跳转(YandexGo深链接/GG Play商店)
- [x] Chart.js统计：年/月订单数+金额柱状图
- [x] 5秒轮询统计 + 新订单提示音
- [x] 订单管理角标(pending数量，红色脉冲)

## 数据流

```
菜单数据：
  Supabase menu_config → useMenuData(menuCache) → Vue响应式组件
                     ↕
  localStorage(ribuluo_menu_data) ← 本地缓存/回退

订单数据：
  CartView → useCart(localStorage) → useOrders → Supabase orders
  AdminOrders → useOrders → Supabase orders
  历史同步：localStorage(ribuluo_order_ids) → getOrdersByIds → Supabase
```

## 关键设计决策

1. **Hash路由**：Vercel SPA兼容，无需服务端配置
2. **单行JSONB**：menu_config仅id=1一行，避免关系查询，适合菜单数据规模
3. **双层缓存**：useMenuData使用内存cache + localStorage，读为零延迟
4. **订单号格式RN+ddhhmmss**：人类可读，包含时间信息，含日期含小时分秒
5. **localStorage订单号列表**：跨浏览器隔离(换浏览器历史为空)，无需登录
6. **海报双常量**：PAGE_PAD(80) vs PAGE_PAD_BBQ(220)，红金主题背景图自带装饰边框
7. **Web Audio API提示音**：无需音频文件，方波合成，需用户交互解锁AudioContext

## 待完成

1. ❗ 用户在 Supabase SQL Editor 执行 `supabase/orders_v2_migration.sql`
2. Vercel 部署
3. 全流程测试（加购→提交→管理端查单→编辑→结算→撤回→统计）
4. 三方配送App深链接实测(YandexGo/GG)
5. 微信/WhatsApp/Telegram联系类型统计扩展

## 完整提交历史 (41 commits)

```
0e14c14 fix: 红金/经典主题店名字体统一为马善政 + 统计栏内部间距收紧
7044345 fix: 红金海报内容区内收35px + 购物车"展开"按钮化
ef7cf8a fix: 订单详情加可复制订单号 + CartView单号不截断 + 红金海报内容区修正
ff51ec8 fix: 历史订单列表列对齐 — 展开/修改列纳入flex布局
8fc5dd1 fix: 海报有图菜品去下边框 + 红金主题内容区padding修正
676fb7b fix: 路由守卫防止管理端页面刷新时闪烁用户端页面
5b8d870 fix: 提交成功后关闭弹窗自动滚回顶部确保页签可见
7c8d00c fix: 海报菜品图片尺寸 80→180×120
3d66a60 fix: 表单校验修正 — 称呼选填 + 预订时间必填默认当前
acad347 fix: 分享二维码+表单校验+配送费条件显示+UI间距调整
2dfbf54 feat: 海报招牌标识改文字徽章 + 菜品图片渲染
e2f5462 fix: GG改回Play商店链接 + 统计栏行距加大
4cbade1 fix: 订单列表行内展开按钮与金额增加间距
5e2b3aa fix: 页面加载时初始化已完成计数
ce5a257 fix: 完成结算后刷新全部页签计数 + 订单详情加边框阴影
6ad3ec6 fix: GG直开+手动输入新菜品修复+管理端提示音修复
62b2a8e fix: 菜品名中文默认+展开按钮+GG Intent修正
88e06ce fix: 管理端UI优化 — 统计栏+订单层次+图表主题+三方配送+placeholder
8d72dab fix: 购物车脚标脉冲+数量输入框blur更新+提交后跳转历史
1dd539f fix: 用户端UI优化 — 购物车按钮+菜品间距+表单重构+名称显示
d240fa3 fix: 海报多语言支持 + 店名居中 + 语言控件移动端优化
460fef9 feat: 订单功能（用户端+管理端）完整实现
7dadab6 fix: 二维码下载按钮触发+消除主题加载闪烁
020db0c fix: 主题下拉修复+白字对比度+QR文字+移动端下载
b02695b fix: 主题切换恢复+保存提示+按钮对比度+滑动区域
0245199 优化：联系方式重构+管理后台精简+菜单页气泡+海报/分享二维码
00714e6 feat: 联系方式帐号名+下载复制 + 管理退出+分享二维码下载
442db34 feat: 菜单页联系方式悬浮气泡 + 海报底部二维码展示
d98f4a4 fix: 一级分类字体加大 + 重置密码 + 图片上传提示
e3535c1 fix: pageCount 无数据时兜底为1页
789f35d fix: 海报分页计算修复 + 管理列表图片标注
7022bbb fix: 异步数据加载时序问题 + 自动初始化空Supabase表
24ec078 feat: 数据持久化迁移到Supabase
2bc1295 fix: 店名居中+按钮动效+菜品图片+海报修复+禁止拖选
96ec4f7 feat: 菜单版式重构 + 修复数据迁移Bug + Cloudinary/Supabase集成
3bfd204 全面重构：主题系统 + 海报导出 + 视觉风格
d0576d0 重构：嵌套三级数据结构 + 纯红主题 + 海报导出
2c38458 修复数据迁移 + 双列布局 + 第三套主题
9b9d855 重构：三级数据结构 + 主题重设计
890cebc fix: 登录加用户名 + 后台二维码上传配置 + 联系方式三码
47d663f init: 日不落串吧东北烧烤电子菜单
```
