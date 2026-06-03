// 默认菜单数据 — 日不落串吧东北烧烤
// 价格单位：亚美尼亚德拉姆 (AMD)

function m(zh, am, en, ru) {
  return { zh, am: am || '', en: en || '', ru: ru || '' }
}

const products = []

// ========== 火锅-锅底 ==========
products.push(
  { id: 'p001', name: m('鸳鸯锅底'), price: 5000, categoryId: 'cat_hotpot_base', recommended: true },
  { id: 'p002', name: m('麻辣锅底'), price: 0, categoryId: 'cat_hotpot_base' },
  { id: 'p003', name: m('番茄锅底'), price: 0, categoryId: 'cat_hotpot_base' },
  { id: 'p004', name: m('清汤锅底'), price: 0, categoryId: 'cat_hotpot_base' },
  { id: 'p005', name: m('菌菇锅底'), price: 0, categoryId: 'cat_hotpot_base' },
  { id: 'p006', name: m('小料（每人）'), price: 500, categoryId: 'cat_hotpot_base' }
)

// ========== 火锅-肉类 ==========
products.push(
  { id: 'p010', name: m('羊肉卷'), price: 4000, categoryId: 'cat_hotpot_meat', recommended: true },
  { id: 'p011', name: m('牛肉卷'), price: 3000, categoryId: 'cat_hotpot_meat' },
  { id: 'p012', name: m('五花肉卷'), price: 3000, categoryId: 'cat_hotpot_meat' },
  { id: 'p013', name: m('小酥肉'), price: 5000, categoryId: 'cat_hotpot_meat' },
  { id: 'p014', name: m('虾滑'), price: 5000, categoryId: 'cat_hotpot_meat' }
)

// ========== 火锅-海鲜类 ==========
products.push(
  { id: 'p020', name: m('大虾'), price: 3000, categoryId: 'cat_hotpot_seafood' },
  { id: 'p021', name: m('海虹'), price: 3000, categoryId: 'cat_hotpot_seafood' },
  { id: 'p022', name: m('花甲'), price: 3000, categoryId: 'cat_hotpot_seafood' },
  { id: 'p023', name: m('鲍鱼'), price: 3000, categoryId: 'cat_hotpot_seafood' },
  { id: 'p024', name: m('海蛎子'), price: 3000, categoryId: 'cat_hotpot_seafood' },
  { id: 'p025', name: m('蟹棒'), price: 1500, categoryId: 'cat_hotpot_seafood' }
)

// ========== 火锅-特色食材 ==========
products.push(
  { id: 'p030', name: m('牛百叶'), price: 5000, categoryId: 'cat_hotpot_special' }
)

// ========== 火锅-豆制品 ==========
products.push(
  { id: 'p040', name: m('冻豆腐'), price: 1500, categoryId: 'cat_hotpot_tofu' },
  { id: 'p041', name: m('豆皮'), price: 1500, categoryId: 'cat_hotpot_tofu' },
  { id: 'p042', name: m('腐竹'), price: 1500, categoryId: 'cat_hotpot_tofu' },
  { id: 'p043', name: m('豆腐泡'), price: 1500, categoryId: 'cat_hotpot_tofu' }
)

// ========== 火锅-蛋类 ==========
products.push(
  { id: 'p050', name: m('鹌鹑蛋'), price: 1000, categoryId: 'cat_hotpot_egg' }
)

// ========== 火锅-蔬菜类 ==========
products.push(
  { id: 'p060', name: m('海带'), price: 1500, categoryId: 'cat_hotpot_veg' },
  { id: 'p061', name: m('木耳'), price: 1000, categoryId: 'cat_hotpot_veg' },
  { id: 'p062', name: m('蘑菇'), price: 1300, categoryId: 'cat_hotpot_veg' },
  { id: 'p063', name: m('土豆片'), price: 500, categoryId: 'cat_hotpot_veg' },
  { id: 'p064', name: m('油麦菜'), price: 600, categoryId: 'cat_hotpot_veg' },
  { id: 'p065', name: m('菠菜'), price: 600, categoryId: 'cat_hotpot_veg' },
  { id: 'p066', name: m('萝卜'), price: 500, categoryId: 'cat_hotpot_veg' },
  { id: 'p067', name: m('白菜'), price: 500, categoryId: 'cat_hotpot_veg' },
  { id: 'p068', name: m('香菜'), price: 500, categoryId: 'cat_hotpot_veg' }
)

// ========== 火锅-主食 ==========
products.push(
  { id: 'p070', name: m('米饭'), price: 500, categoryId: 'cat_hotpot_staple' },
  { id: 'p071', name: m('蛋炒饭'), price: 2000, categoryId: 'cat_hotpot_staple' },
  { id: 'p072', name: m('炒方便面'), price: 2000, categoryId: 'cat_hotpot_staple' },
  { id: 'p073', name: m('手工水饺（每份）'), price: 2000, categoryId: 'cat_hotpot_staple' },
  { id: 'p074', name: m('手擀面炸酱面'), price: 3000, categoryId: 'cat_hotpot_staple' }
)

// ========== 火锅-面点 ==========
products.push(
  { id: 'p080', name: m('韭菜盒子（4个）'), price: 3000, categoryId: 'cat_hotpot_pastry' },
  { id: 'p081', name: m('土豆丝卷饼（3个）'), price: 2000, categoryId: 'cat_hotpot_pastry' },
  { id: 'p082', name: m('包子（4个）'), price: 2000, categoryId: 'cat_hotpot_pastry' },
  { id: 'p083', name: m('韭菜肉水饺（每份）'), price: 3500, categoryId: 'cat_hotpot_pastry' },
  { id: 'p084', name: m('鸡蛋水饺（每份）'), price: 3000, categoryId: 'cat_hotpot_pastry' }
)

// ========== 炭烤-肉串系列 ==========
products.push(
  { id: 'p100', name: m('特色猪肉串'), price: 400, categoryId: 'cat_grill_meat', recommended: true },
  { id: 'p101', name: m('羊肉串'), price: 500, categoryId: 'cat_grill_meat', recommended: true },
  { id: 'p102', name: m('牛肉串'), price: 400, categoryId: 'cat_grill_meat' },
  { id: 'p103', name: m('烤鸡胗'), price: 400, categoryId: 'cat_grill_meat' },
  { id: 'p104', name: m('烤鸡心'), price: 400, categoryId: 'cat_grill_meat' },
  { id: 'p105', name: m('烤鸡爪'), price: 400, categoryId: 'cat_grill_meat' },
  { id: 'p106', name: m('奥尔良烤鸡翅（全翅）'), price: 800, categoryId: 'cat_grill_meat' },
  { id: 'p107', name: m('烤猪蹄'), price: 1000, categoryId: 'cat_grill_meat' },
  { id: 'p108', name: m('烤猪腰'), price: 1000, categoryId: 'cat_grill_meat' },
  { id: 'p109', name: m('烤牛腰'), price: 1000, categoryId: 'cat_grill_meat' },
  { id: 'p110', name: m('烤鹌鹑'), price: 1500, categoryId: 'cat_grill_meat' },
  { id: 'p111', name: m('烤鹌鹑蛋'), price: 1000, categoryId: 'cat_grill_meat' }
)

// ========== 炭烤-海鲜烧烤 ==========
products.push(
  { id: 'p120', name: m('烤大虾'), price: 500, categoryId: 'cat_grill_seafood' },
  { id: 'p121', name: m('烤鱿鱼'), price: 1000, categoryId: 'cat_grill_seafood' },
  { id: 'p122', name: m('烤生蚝（4个）'), price: 10000, categoryId: 'cat_grill_seafood', recommended: true },
  { id: 'p123', name: m('烤蟹棒（每份）'), price: 1500, categoryId: 'cat_grill_seafood' }
)

// ========== 炭烤-蔬菜烧烤 ==========
products.push(
  { id: 'p130', name: m('烤豆角（每份）'), price: 1000, categoryId: 'cat_grill_veg' },
  { id: 'p131', name: m('烤茄子'), price: 1500, categoryId: 'cat_grill_veg' },
  { id: 'p132', name: m('烤干豆腐卷'), price: 800, categoryId: 'cat_grill_veg' },
  { id: 'p133', name: m('烤干豆腐片'), price: 300, categoryId: 'cat_grill_veg' },
  { id: 'p134', name: m('烤辣椒'), price: 500, categoryId: 'cat_grill_veg' },
  { id: 'p135', name: m('烤大蒜'), price: 500, categoryId: 'cat_grill_veg' },
  { id: 'p136', name: m('烤蒜苔'), price: 500, categoryId: 'cat_grill_veg' },
  { id: 'p137', name: m('烤土豆片（每份）'), price: 1000, categoryId: 'cat_grill_veg' }
)

// ========== 炭烤-东北特色烧烤 ==========
products.push(
  { id: 'p140', name: m('烤实蛋'), price: 500, categoryId: 'cat_grill_ne' },
  { id: 'p141', name: m('烤中国火腿肠'), price: 700, categoryId: 'cat_grill_ne' },
  { id: 'p142', name: m('烤猪皮'), price: 400, categoryId: 'cat_grill_ne' },
  { id: 'p143', name: m('烤蚕蛹'), price: 1500, categoryId: 'cat_grill_ne' },
  { id: 'p144', name: m('烤薯蓉粉丝扇贝（每个）'), price: 1000, categoryId: 'cat_grill_ne' },
  { id: 'p145', name: m('烤豆腐泡'), price: 500, categoryId: 'cat_grill_ne' }
)

// ========== 锡纸系列 ==========
products.push(
  { id: 'p200', name: m('锡纸酸菜五花肉'), price: 5000, categoryId: 'cat_tin', recommended: true },
  { id: 'p201', name: m('锡纸豆腐'), price: 5000, categoryId: 'cat_tin' },
  { id: 'p202', name: m('锡纸油麦菜'), price: 4000, categoryId: 'cat_tin' },
  { id: 'p203', name: m('锡纸大虾'), price: 5000, categoryId: 'cat_tin' },
  { id: 'p204', name: m('锡纸花甲粉丝'), price: 4000, categoryId: 'cat_tin' },
  { id: 'p205', name: m('锡纸鸡爪'), price: 4000, categoryId: 'cat_tin' },
  { id: 'p206', name: m('锡纸五花肉'), price: 4000, categoryId: 'cat_tin' },
  { id: 'p207', name: m('锡纸猪心'), price: 5000, categoryId: 'cat_tin' }
)

// ========== 美味小炒 ==========
products.push(
  { id: 'p300', name: m('麻辣烫'), price: 5000, categoryId: 'cat_stir' },
  { id: 'p301', name: m('麻辣香锅'), price: 5000, categoryId: 'cat_stir' },
  { id: 'p302', name: m('红烧带鱼'), price: 8000, categoryId: 'cat_stir' },
  { id: 'p303', name: m('肉炒蒜苔'), price: 5000, categoryId: 'cat_stir' },
  { id: 'p304', name: m('哈尔滨红肠土豆片'), price: 5000, categoryId: 'cat_stir' },
  { id: 'p305', name: m('中国干肠（腊肠）炒莴笋'), price: 6000, categoryId: 'cat_stir' },
  { id: 'p306', name: m('韭菜炒鸡蛋'), price: 4000, categoryId: 'cat_stir' },
  { id: 'p307', name: m('尖椒干豆腐'), price: 5000, categoryId: 'cat_stir' },
  { id: 'p308', name: m('溜豆腐泡（孜然豆腐泡）'), price: 5000, categoryId: 'cat_stir' },
  { id: 'p309', name: m('炸豆腐（秘汁、烧烤料双拼）'), price: 5000, categoryId: 'cat_stir' },
  { id: 'p310', name: m('鲅鱼炒韭菜'), price: 5000, categoryId: 'cat_stir' },
  { id: 'p311', name: m('香酥排骨（蒜香排骨）'), price: 6000, categoryId: 'cat_stir' },
  { id: 'p312', name: m('辣子鸡（招牌菜）'), price: 5000, categoryId: 'cat_stir', recommended: true },
  { id: 'p313', name: m('肉炒莴笋（清炒莴笋）'), price: 5000, categoryId: 'cat_stir' },
  { id: 'p314', name: m('油焖大虾'), price: 5000, categoryId: 'cat_stir' }
)

// ========== 精致炒菜 ==========
products.push(
  { id: 'p400', name: m('油炸花生米'), price: 3000, categoryId: 'cat_refined' },
  { id: 'p401', name: m('酸辣土豆丝'), price: 2500, categoryId: 'cat_refined' },
  { id: 'p402', name: m('干锅土豆片'), price: 3000, categoryId: 'cat_refined' },
  { id: 'p403', name: m('蒜蓉油麦菜'), price: 3000, categoryId: 'cat_refined' },
  { id: 'p404', name: m('菠菜'), price: 3000, categoryId: 'cat_refined' },
  { id: 'p405', name: m('地三鲜'), price: 5000, categoryId: 'cat_refined', recommended: true },
  { id: 'p406', name: m('醋溜白菜'), price: 3000, categoryId: 'cat_refined' },
  { id: 'p407', name: m('小炒牛肉'), price: 5000, categoryId: 'cat_refined' },
  { id: 'p408', name: m('鱼香肉丝'), price: 5000, categoryId: 'cat_refined' },
  { id: 'p409', name: m('宫保鸡丁'), price: 5000, categoryId: 'cat_refined' },
  { id: 'p410', name: m('回锅肉'), price: 5000, categoryId: 'cat_refined' },
  { id: 'p411', name: m('干煸四季豆'), price: 4500, categoryId: 'cat_refined' },
  { id: 'p412', name: m('红烧肉'), price: 5000, categoryId: 'cat_refined' },
  { id: 'p413', name: m('红烧鲤鱼（约2公斤）'), price: 9000, categoryId: 'cat_refined' },
  { id: 'p414', name: m('麻辣豆腐'), price: 5000, categoryId: 'cat_refined' },
  { id: 'p415', name: m('角瓜炒鸡蛋'), price: 3000, categoryId: 'cat_refined' }
)

// ========== 凉拌菜 ==========
products.push(
  { id: 'p500', name: m('东北家常凉菜'), price: 4000, categoryId: 'cat_cold' },
  { id: 'p501', name: m('卤味拼盘'), price: 5800, categoryId: 'cat_cold', recommended: true },
  { id: 'p502', name: m('素拍黄瓜'), price: 3000, categoryId: 'cat_cold' },
  { id: 'p503', name: m('凉拌腐竹'), price: 4000, categoryId: 'cat_cold' },
  { id: 'p504', name: m('卤猪蹄（时价）'), price: 0, categoryId: 'cat_cold' },
  { id: 'p505', name: m('卤鸡爪（时价）'), price: 0, categoryId: 'cat_cold' },
  { id: 'p506', name: m('卤鸡翅（时价）'), price: 0, categoryId: 'cat_cold' },
  { id: 'p507', name: m('卤猪头肉（时价）'), price: 0, categoryId: 'cat_cold' },
  { id: 'p508', name: m('卤猪耳朵（时价）'), price: 0, categoryId: 'cat_cold' },
  { id: 'p509', name: m('酱牛肉（时价）'), price: 0, categoryId: 'cat_cold' }
)

// 酒水类暂无菜品，待商家后续添加

export const defaultMenu = {
  shopName: m('日不落串吧东北烧烤', 'Ռիբուլուո Բարբեքյու', 'Ribuluo Northeast BBQ', 'Рибулуо Северо-восточное Барбекю'),
  theme: 'dark-gold',
  currentLang: 'zh',
  passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123
  contacts: { wechat: '', whatsapp: '', telegram: '' },
  categories: [
    { id: 'cat_hotpot_base',     name: m('火锅-锅底'), group: m('火锅系列'), sort: 0 },
    { id: 'cat_hotpot_meat',     name: m('火锅-肉类'), group: m('火锅系列'), sort: 1 },
    { id: 'cat_hotpot_seafood',  name: m('火锅-海鲜类'), group: m('火锅系列'), sort: 2 },
    { id: 'cat_hotpot_special',  name: m('火锅-特色食材'), group: m('火锅系列'), sort: 3 },
    { id: 'cat_hotpot_tofu',     name: m('火锅-豆制品'), group: m('火锅系列'), sort: 4 },
    { id: 'cat_hotpot_egg',      name: m('火锅-蛋类'), group: m('火锅系列'), sort: 5 },
    { id: 'cat_hotpot_veg',      name: m('火锅-蔬菜类'), group: m('火锅系列'), sort: 6 },
    { id: 'cat_hotpot_staple',   name: m('火锅-主食'), group: m('火锅系列'), sort: 7 },
    { id: 'cat_hotpot_pastry',   name: m('火锅-面点'), group: m('火锅系列'), sort: 8 },

    { id: 'cat_grill_meat',      name: m('炭烤-肉串系列'), group: m('招牌炭烤'), sort: 10 },
    { id: 'cat_grill_seafood',   name: m('炭烤-海鲜烧烤'), group: m('招牌炭烤'), sort: 11 },
    { id: 'cat_grill_veg',       name: m('炭烤-蔬菜烧烤'), group: m('招牌炭烤'), sort: 12 },
    { id: 'cat_grill_ne',        name: m('炭烤-东北特色'), group: m('招牌炭烤'), sort: 13 },

    { id: 'cat_tin',             name: m('锡纸系列'), sort: 20 },
    { id: 'cat_stir',            name: m('美味小炒'), sort: 30 },
    { id: 'cat_refined',         name: m('精致炒菜'), sort: 40 },
    { id: 'cat_cold',            name: m('凉拌菜'), sort: 50 },
    { id: 'cat_drink',           name: m('酒水'), sort: 60 },
  ],
  products
}
