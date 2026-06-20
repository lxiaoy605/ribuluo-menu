// 默认菜单数据 — 日不落串吧东北烧烤
// 价格单位：亚美尼亚德拉姆 (AMD)
// 嵌套三级结构：categories -> children -> items

function m(zh, am, en, ru) {
  return { zh, am: am || '', en: en || '', ru: ru || '' }
}

// ========== 完整嵌套菜单数据 ==========
const categories = [
  // ==================== 特色烧烤 ====================
  {
    id: 'cat_bbq',
    name: m('特色烧烤'),
    sort: 0,
    children: [
      {
        id: 'sub_grill_signature',
        name: m('招牌炭烤'),
        sort: 0,
        items: [
          { id: 'p001', name: m('特色猪肉串'), price: 400, image: '', imagePosition: 'top', recommended: true, soldOut: false },
          { id: 'p002', name: m('羊肉串'), price: 500, image: '', imagePosition: 'top', recommended: true, soldOut: false },
          { id: 'p003', name: m('牛肉串'), price: 400, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p004', name: m('烤鸡胗'), price: 400, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p005', name: m('烤鸡心'), price: 400, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p006', name: m('烤鸡爪'), price: 400, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p007', name: m('奥尔良烤鸡翅（全翅）'), price: 800, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p008', name: m('烤猪蹄'), price: 1000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p009', name: m('烤大虾'), price: 500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p010', name: m('烤鱿鱼'), price: 1000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p011', name: m('烤鹌鹑'), price: 1500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p012', name: m('烤猪腰'), price: 1000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p013', name: m('烤牛腰'), price: 1000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p014', name: m('烤鹌鹑蛋'), price: 1000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p015', name: m('烤豆腐泡'), price: 500, image: '', imagePosition: 'top', recommended: false, soldOut: false }
        ]
      },
      {
        id: 'sub_grill_classic',
        name: m('串串经典'),
        sort: 1,
        items: [
          { id: 'p020', name: m('烤实蛋'), price: 500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p021', name: m('烤中国火腿肠'), price: 700, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p022', name: m('烤豆角（每份）'), price: 1000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p023', name: m('烤茄子'), price: 1500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p024', name: m('烤干豆腐卷'), price: 800, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p025', name: m('烤辣椒'), price: 500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p026', name: m('烤大蒜'), price: 500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p027', name: m('烤猪皮'), price: 400, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p028', name: m('烤蟹棒（每份）'), price: 1500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p029', name: m('烤土豆片（每份）'), price: 1000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p030', name: m('烤薯蓉粉丝扇贝（每个）'), price: 1000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p031', name: m('烤生蚝（4个）'), price: 10000, image: '', imagePosition: 'top', recommended: true, soldOut: false },
          { id: 'p032', name: m('烤干豆腐片'), price: 300, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p033', name: m('烤蚕蛹'), price: 1500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p034', name: m('烤蒜苔'), price: 500, image: '', imagePosition: 'top', recommended: false, soldOut: false }
        ]
      },
      {
        id: 'sub_tin',
        name: m('锡纸系列'),
        sort: 2,
        items: [
          { id: 'p040', name: m('锡纸酸菜五花肉'), price: 5000, image: '', imagePosition: 'top', recommended: true, soldOut: false },
          { id: 'p041', name: m('锡纸豆腐'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p042', name: m('锡纸油麦菜'), price: 4000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p043', name: m('锡纸猪心'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p044', name: m('锡纸大虾'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p045', name: m('锡纸花甲粉丝'), price: 4000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p046', name: m('锡纸鸡爪'), price: 4000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p047', name: m('锡纸五花肉'), price: 4000, image: '', imagePosition: 'top', recommended: false, soldOut: false }
        ]
      }
    ]
  },

  // ==================== 私房菜 ====================
  {
    id: 'cat_home',
    name: m('私房菜'),
    sort: 1,
    children: [
      {
        id: 'sub_stir',
        name: m('美味小炒'),
        sort: 0,
        items: [
          { id: 'p100', name: m('麻辣烫'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p101', name: m('麻辣香锅'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p102', name: m('红烧带鱼'), price: 8000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p103', name: m('肉炒蒜苔'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p104', name: m('哈尔滨红肠土豆片'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p105', name: m('中国干肠（腊肠）炒莴笋'), price: 6000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p106', name: m('韭菜炒鸡蛋'), price: 4000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p107', name: m('尖椒干豆腐'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p108', name: m('溜豆腐泡（孜然豆腐泡）'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p109', name: m('炸豆腐（秘汁、烧烤料双拼）'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p110', name: m('鲅鱼炒韭菜'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p111', name: m('香酥排骨（蒜香排骨）'), price: 6000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p112', name: m('辣子鸡（招牌菜）'), price: 5000, image: '', imagePosition: 'top', recommended: true, soldOut: false },
          { id: 'p113', name: m('肉炒莴笋（清炒莴笋）'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p114', name: m('油焖大虾'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false }
        ]
      },
      {
        id: 'sub_refined',
        name: m('精致炒菜'),
        sort: 1,
        items: [
          { id: 'p120', name: m('油炸花生米'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p121', name: m('酸辣土豆丝'), price: 2500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p122', name: m('干锅土豆片'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p123', name: m('蒜蓉油麦菜（菠菜）'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p124', name: m('地三鲜'), price: 5000, image: '', imagePosition: 'top', recommended: true, soldOut: false },
          { id: 'p125', name: m('醋溜白菜'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p126', name: m('小炒牛肉'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p127', name: m('鱼香肉丝'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p128', name: m('宫保鸡丁'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p129', name: m('回锅肉'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p130', name: m('干煸四季豆（时价）'), price: 4500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p131', name: m('红烧肉'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p132', name: m('红烧鲤鱼（约2公斤，时价）'), price: 9000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p133', name: m('麻辣豆腐'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p134', name: m('角瓜炒鸡蛋'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false }
        ]
      },
      {
        id: 'sub_braised',
        name: m('卤味'),
        sort: 2,
        items: [
          { id: 'p140', name: m('卤猪蹄'), price: 0, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p141', name: m('卤鸡爪'), price: 0, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p142', name: m('卤鸡翅'), price: 0, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p143', name: m('卤猪头肉'), price: 0, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p144', name: m('卤猪耳朵'), price: 0, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p145', name: m('酱牛肉'), price: 0, image: '', imagePosition: 'top', recommended: false, soldOut: false }
        ]
      },
      {
        id: 'sub_cold',
        name: m('凉拌菜'),
        sort: 3,
        items: [
          { id: 'p150', name: m('东北家常凉菜'), price: 4000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p151', name: m('卤味拼盘'), price: 5800, image: '', imagePosition: 'top', recommended: true, soldOut: false },
          { id: 'p152', name: m('素拍黄瓜'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p153', name: m('凉拌腐竹'), price: 4000, image: '', imagePosition: 'top', recommended: false, soldOut: false }
        ]
      }
    ]
  },

  // ==================== 火锅系列 ====================
  {
    id: 'cat_hotpot',
    name: m('火锅系列'),
    sort: 2,
    children: [
      {
        id: 'sub_hotpot_base',
        name: m('锅底系列'),
        sort: 0,
        items: [
          { id: 'p200', name: m('鸳鸯锅底'), price: 5000, image: '', imagePosition: 'top', recommended: true, soldOut: false },
          { id: 'p201', name: m('麻辣锅底'), price: 0, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p202', name: m('番茄锅底'), price: 0, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p203', name: m('清汤锅底'), price: 0, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p204', name: m('菌菇锅底'), price: 0, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p205', name: m('小料（每人）'), price: 500, image: '', imagePosition: 'top', recommended: false, soldOut: false }
        ]
      },
      {
        id: 'sub_hotpot_meat_seafood',
        name: m('海鲜肉类'),
        sort: 1,
        items: [
          { id: 'p210', name: m('羊肉卷'), price: 4000, image: '', imagePosition: 'top', recommended: true, soldOut: false },
          { id: 'p211', name: m('牛肉卷'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p212', name: m('五花肉卷'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p213', name: m('小酥肉'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p214', name: m('虾滑'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p215', name: m('大虾'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p216', name: m('海虹'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p217', name: m('花甲'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p218', name: m('鲍鱼'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p219', name: m('牛百叶'), price: 5000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p220', name: m('海蛎子'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p221', name: m('蟹棒'), price: 1500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p222', name: m('冻豆腐'), price: 1500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p223', name: m('豆皮'), price: 1500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p224', name: m('腐竹'), price: 1500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p225', name: m('豆腐泡'), price: 1500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p226', name: m('鹌鹑蛋'), price: 1000, image: '', imagePosition: 'top', recommended: false, soldOut: false }
        ]
      },
      {
        id: 'sub_hotpot_veg',
        name: m('蔬菜类'),
        sort: 2,
        items: [
          { id: 'p230', name: m('海带'), price: 1500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p231', name: m('木耳'), price: 1000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p232', name: m('蘑菇'), price: 1300, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p233', name: m('土豆片'), price: 500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p234', name: m('油麦菜'), price: 600, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p235', name: m('菠菜'), price: 600, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p236', name: m('萝卜'), price: 500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p237', name: m('白菜'), price: 500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p238', name: m('香菜'), price: 500, image: '', imagePosition: 'top', recommended: false, soldOut: false }
        ]
      },
      {
        id: 'sub_hotpot_staple',
        name: m('主食类'),
        sort: 3,
        items: [
          { id: 'p240', name: m('米饭'), price: 500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p241', name: m('蛋炒饭'), price: 2000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p242', name: m('炒方便面'), price: 2000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p243', name: m('手工水饺（每份）'), price: 2000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p244', name: m('手擀面炸酱面'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p245', name: m('韭菜盒子（4个）'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p246', name: m('土豆丝卷饼（3个）'), price: 2000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p247', name: m('包子（4个）'), price: 2000, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p248', name: m('韭菜肉水饺（每份）'), price: 3500, image: '', imagePosition: 'top', recommended: false, soldOut: false },
          { id: 'p249', name: m('鸡蛋水饺（每份）'), price: 3000, image: '', imagePosition: 'top', recommended: false, soldOut: false }
        ]
      }
    ]
  }
]

export const defaultMenu = {
  shopName: m('日不落串吧东北烧烤', 'Ռիբուլուո Բարբեքյու', 'Ribuluo Northeast BBQ', 'Рибулуо Северо-восточное Барбекю'),
  theme: 'bbq-red-gold',
  currentLang: 'zh',
  passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123
  telegramBotToken: '',
  telegramChatId: '',
  telegramNotificationsEnabled: false,
  telegramNotifyOnCustomerUpdate: true,
  telegramNotifyOnStatusChange: true,
  contacts: {
    wechat: { url: '', name: '' },
    whatsapp: { url: '', name: '' },
    telegram: { url: '', name: '' }
  },
  categories
}
