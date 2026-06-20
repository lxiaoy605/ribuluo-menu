import { ref } from 'vue'
import { useSupabase } from './useSupabase'

const STORAGE_KEY = 'ribuluo_menu_data'

// 内存缓存（Vue 响应式）
const menuCache = ref(null)
// 是否已从服务器加载过
let serverLoaded = false
// 数据是否确实来自 Supabase（非 localStorage 回退）
let loadedFromServer = false

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

// ========== 本地缓存（仅用于快速读取） ==========
function getLocalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  return null
}

function setLocalData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) { /* ignore */ }
}

// ========== 从 Supabase 加载 ==========
// 剥离敏感字段（telegramBotToken），防止泄露到客户端缓存
function sanitizeForClient(data) {
  if (data && data.telegramBotToken) {
    const sanitized = { ...data }
    delete sanitized.telegramBotToken
    return sanitized
  }
  return data
}

async function loadFromServer() {
  try {
    const { supabase } = useSupabase()
    const { data, error } = await supabase
      .from('menu_config')
      .select('data')
      .eq('id', 1)
      .single()

    if (data?.data) {
      const safe = sanitizeForClient(data.data)
      menuCache.value = safe
      setLocalData(safe)
      serverLoaded = true
      loadedFromServer = true
      return safe
    }
  } catch (e) {
    console.error('从服务器加载菜单数据失败', e)
  }

  // 服务器无数据或加载失败 → 回退到本地缓存
  const cached = getLocalData()
  if (cached) {
    const safe = sanitizeForClient(cached)
    menuCache.value = safe
    serverLoaded = true
    return safe
  }
  return null
}

// ========== 保存到 Supabase ==========
async function saveToServer(data) {
  const safe = sanitizeForClient(data)
  menuCache.value = safe
  setLocalData(safe)
  try {
    const { supabase } = useSupabase()

    // 保护 telegramBotToken：客户端缓存已剥离 token，若本次未传入则从数据库回填
    if (!data.telegramBotToken) {
      try {
        const { data: row } = await supabase
          .from('menu_config')
          .select('data->telegramBotToken')
          .eq('id', 1)
          .single()
        if (row?.telegramBotToken) {
          data.telegramBotToken = row.telegramBotToken
        }
      } catch (_) { /* 忽略 */ }
    }

    const { error } = await supabase
      .from('menu_config')
      .upsert({ id: 1, data, updated_at: new Date().toISOString() })

    if (error) throw error
    return true
  } catch (e) {
    console.error('保存菜单数据到服务器失败', e)
    return false
  }
}

// ========== 获取数据（同步，从缓存读） ==========
function getMenuData() {
  return menuCache.value
}

// ========== 初始化 ==========
async function initDefaultData(defaultData) {
  // 先尝试从服务器加载
  let existing = await loadFromServer()

  if (!existing) {
    // 完全无数据，写入默认数据
    await saveToServer(defaultData)
    return defaultData
  }

  // 检测并迁移旧格式
  let migrated = false
  const isOldFormat = existing.groups || existing.products ||
    (!existing.categories || (existing.categories.length > 0 && !existing.categories[0].children))

  if (isOldFormat) {
    if (defaultData.categories && defaultData.categories.length > 0) {
      existing.categories = JSON.parse(JSON.stringify(defaultData.categories))
      existing.theme = 'bbq-red-gold'
      migrated = true
    }
  }

  if (existing.groups) { delete existing.groups; migrated = true }
  if (existing.products) { delete existing.products; migrated = true }

  if (!existing.contacts) {
    existing.contacts = { wechat: { url: '', name: '' }, whatsapp: { url: '', name: '' }, telegram: { url: '', name: '' } }
    migrated = true
  }
  // 迁移旧 contacts 格式（string → {url, name}）
  for (const k of ['wechat', 'whatsapp', 'telegram']) {
    if (typeof existing.contacts[k] === 'string') {
      existing.contacts[k] = { url: existing.contacts[k], name: '' }
      migrated = true
    }
  }
  if (!existing.passwordHash) {
    existing.passwordHash = defaultData.passwordHash
    migrated = true
  }

  if (migrated) {
    await saveToServer(existing)
  } else if (!loadedFromServer) {
    // 数据来自本地缓存，服务器为空 → 推送到服务器完成初始化
    await saveToServer(existing)
  }

  return existing
}

// ========== 密码 ==========
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
  saveToServer(d)
  return true
}

function updateCategory(id, updates) {
  const d = getMenuData()
  if (!d?.categories) return false
  const cat = d.categories.find(c => c.id === id)
  if (!cat) return false
  Object.assign(cat, updates)
  saveToServer(d)
  return true
}

function deleteCategory(id) {
  const d = getMenuData()
  if (!d) return false
  d.categories = d.categories.filter(c => c.id !== id)
  saveToServer(d)
  return true
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
  saveToServer(d)
  return true
}

function updateSubCategory(categoryId, subId, updates) {
  const d = getMenuData()
  if (!d?.categories) return false
  const cat = d.categories.find(c => c.id === categoryId)
  if (!cat?.children) return false
  const sub = cat.children.find(s => s.id === subId)
  if (!sub) return false
  Object.assign(sub, updates)
  saveToServer(d)
  return true
}

function deleteSubCategory(categoryId, subId) {
  const d = getMenuData()
  if (!d?.categories) return false
  const cat = d.categories.find(c => c.id === categoryId)
  if (!cat?.children) return false
  cat.children = cat.children.filter(s => s.id !== subId)
  saveToServer(d)
  return true
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
  saveToServer(d)
  return true
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
  saveToServer(d)
  return true
}

function deleteItem(categoryId, subId, itemId) {
  const d = getMenuData()
  if (!d?.categories) return false
  const cat = d.categories.find(c => c.id === categoryId)
  if (!cat?.children) return false
  const sub = cat.children.find(s => s.id === subId)
  if (!sub?.items) return false
  sub.items = sub.items.filter(p => p.id !== itemId)
  saveToServer(d)
  return true
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

async function importJSON(jsonStr) {
  try {
    const imported = JSON.parse(jsonStr)
    const current = getMenuData()
    if (current?.passwordHash) imported.passwordHash = current.passwordHash
    if (current?.theme) imported.theme = current.theme
    if (current?.currentLang) imported.currentLang = current.currentLang
    if (!imported.categories) imported.categories = []
    imported.shopName = imported.shopName || { zh: '店铺名称' }
    await saveToServer(imported)
    return true
  } catch (e) {
    console.error('导入失败', e)
    return false
  }
}

export function useMenuData() {
  function refresh() {
    loadFromServer()
  }

  return {
    getMenuData,
    setMenuData: saveToServer,
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
