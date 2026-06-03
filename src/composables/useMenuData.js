import { ref } from 'vue'

const STORAGE_KEY = 'ribuluo_menu_data'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

function getMenuData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('读取数据失败', e)
  }
  return null
}

function setMenuData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存数据失败', e)
    return false
  }
  return true
}

function initDefaultData(defaultData) {
  let existing = getMenuData()
  if (!existing) {
    setMenuData(defaultData)
    return defaultData
  }
  // 迁移：检测旧格式（有 groups 或有 products 顶层数组）
  let migrated = false
  if (!existing.categories || existing.groups || existing.products) {
    if (defaultData.categories && defaultData.categories.length > 0) {
      existing.categories = JSON.parse(JSON.stringify(defaultData.categories))
      existing.theme = 'pure-red'
      migrated = true
    }
  }
  if (!existing.contacts) {
    existing.contacts = { wechat: '', whatsapp: '', telegram: '' }
    migrated = true
  }
  if (migrated) setMenuData(existing)
  return existing
}

async function verifyPassword(input, hash) {
  return await sha256(input) === hash
}

async function hashPassword(password) {
  return await sha256(password)
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ========== 一级分类 CRUD ==========
function addCategory(nameObj) {
  const d = getMenuData()
  if (!d) return false
  if (!d.categories) d.categories = []
  d.categories.push({
    id: uid(),
    name: nameObj || { zh: '新分类' },
    sort: d.categories.length,
    children: []
  })
  return setMenuData(d)
}

function updateCategory(id, updates) {
  const d = getMenuData()
  if (!d?.categories) return false
  const cat = d.categories.find(c => c.id === id)
  if (!cat) return false
  Object.assign(cat, updates)
  return setMenuData(d)
}

function deleteCategory(id) {
  const d = getMenuData()
  if (!d) return false
  d.categories = d.categories.filter(c => c.id !== id)
  return setMenuData(d)
}

// ========== 二级分类 CRUD ==========
function addSubCategory(categoryId, nameObj) {
  const d = getMenuData()
  if (!d?.categories) return false
  const cat = d.categories.find(c => c.id === categoryId)
  if (!cat) return false
  if (!cat.children) cat.children = []
  cat.children.push({
    id: uid(),
    name: nameObj || { zh: '新子分类' },
    sort: cat.children.length,
    items: []
  })
  return setMenuData(d)
}

function updateSubCategory(categoryId, subId, updates) {
  const d = getMenuData()
  if (!d?.categories) return false
  const cat = d.categories.find(c => c.id === categoryId)
  if (!cat?.children) return false
  const sub = cat.children.find(s => s.id === subId)
  if (!sub) return false
  Object.assign(sub, updates)
  return setMenuData(d)
}

function deleteSubCategory(categoryId, subId) {
  const d = getMenuData()
  if (!d?.categories) return false
  const cat = d.categories.find(c => c.id === categoryId)
  if (!cat?.children) return false
  cat.children = cat.children.filter(s => s.id !== subId)
  return setMenuData(d)
}

// ========== 三级菜品 CRUD ==========
function addItem(categoryId, subId, product) {
  const d = getMenuData()
  if (!d?.categories) return false
  const cat = d.categories.find(c => c.id === categoryId)
  if (!cat?.children) return false
  const sub = cat.children.find(s => s.id === subId)
  if (!sub) return false
  if (!sub.items) sub.items = []
  sub.items.push({
    id: uid(),
    name: product.name || { zh: '新菜品' },
    price: product.price || 0,
    image: product.image || '',
    imagePosition: product.imagePosition || 'top',
    recommended: product.recommended || false,
    soldOut: product.soldOut || false
  })
  return setMenuData(d)
}

function updateItem(categoryId, subId, itemId, updates) {
  const d = getMenuData()
  if (!d?.categories) return false
  const cat = d.categories.find(c => c.id === categoryId)
  if (!cat?.children) return false
  const sub = cat.children.find(s => s.id === subId)
  if (!sub?.items) return false
  const item = sub.items.find(p => p.id === itemId)
  if (!item) return false
  Object.assign(item, updates)
  return setMenuData(d)
}

function deleteItem(categoryId, subId, itemId) {
  const d = getMenuData()
  if (!d?.categories) return false
  const cat = d.categories.find(c => c.id === categoryId)
  if (!cat?.children) return false
  const sub = cat.children.find(s => s.id === subId)
  if (!sub?.items) return false
  sub.items = sub.items.filter(p => p.id !== itemId)
  return setMenuData(d)
}

// ========== 统计 ==========
function getProductCount() {
  const d = getMenuData()
  if (!d?.categories) return 0
  let count = 0
  d.categories.forEach(cat => {
    (cat.children || []).forEach(sub => {
      count += (sub.items || []).length
    })
  })
  return count
}

// ========== 数据导入导出 ==========
function exportJSON() {
  const d = getMenuData()
  if (!d) return null
  const exportData = JSON.parse(JSON.stringify(d))
  delete exportData.passwordHash
  return exportData
}

function importJSON(jsonStr) {
  try {
    const imported = JSON.parse(jsonStr)
    const current = getMenuData()
    if (current?.passwordHash) imported.passwordHash = current.passwordHash
    if (current?.theme) imported.theme = current.theme
    if (current?.currentLang) imported.currentLang = current.currentLang
    if (!imported.categories) imported.categories = []
    imported.shopName = imported.shopName || { zh: '店铺名称' }
    return setMenuData(imported)
  } catch (e) {
    console.error('导入失败', e)
    return false
  }
}

export function useMenuData() {
  const data = ref(getMenuData())

  function refresh() {
    data.value = getMenuData()
  }

  function save(d) {
    const ok = setMenuData(d)
    if (ok) refresh()
    return ok
  }

  return {
    getMenuData,
    setMenuData: save,
    initDefaultData,
    verifyPassword,
    hashPassword,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    addItem,
    updateItem,
    deleteItem,
    exportJSON,
    importJSON,
    getProductCount,
    refresh
  }
}
