import { ref } from 'vue'

const STORAGE_KEY = 'ribuluo_menu_data'

// 生成唯一ID
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

// 读取菜单数据
function getMenuData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('读取数据失败', e)
  }
  return null
}

// 保存菜单数据
function setMenuData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存数据失败，可能超出存储限制', e)
    return false
  }
  return true
}

// 初始化默认数据
function initDefaultData(defaultData) {
  const existing = getMenuData()
  if (!existing) {
    setMenuData(defaultData)
    return defaultData
  }
  return existing
}

// 密码管理
async function verifyPassword(input, hash) {
  return await sha256(input) === hash
}

async function hashPassword(password) {
  return await sha256(password)
}

// 简单的 SHA-256 实现
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
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

  // 分类操作
  function addCategory(nameObj) {
    const d = getMenuData() || { categories: [], products: [] }
    d.categories.push({
      id: uid(),
      name: nameObj || { zh: '新分类' },
      sort: d.categories.length
    })
    return save(d)
  }

  function updateCategory(id, updates) {
    const d = getMenuData()
    if (!d) return false
    const idx = d.categories.findIndex(c => c.id === id)
    if (idx === -1) return false
    Object.assign(d.categories[idx], updates)
    return save(d)
  }

  function deleteCategory(id) {
    const d = getMenuData()
    if (!d) return false
    d.categories = d.categories.filter(c => c.id !== id)
    d.products = d.products.filter(p => p.categoryId !== id)
    return save(d)
  }

  // 菜品操作
  function addProduct(product) {
    const d = getMenuData()
    if (!d) return false
    d.products.push({
      id: uid(),
      name: product.name || { zh: '新菜品' },
      price: product.price || 0,
      categoryId: product.categoryId || (d.categories[0]?.id || ''),
      image: product.image || '',
      imagePosition: product.imagePosition || 'top',
      recommended: product.recommended || false,
      soldOut: product.soldOut || false
    })
    return save(d)
  }

  function updateProduct(id, updates) {
    const d = getMenuData()
    if (!d) return false
    const idx = d.products.findIndex(p => p.id === id)
    if (idx === -1) return false
    Object.assign(d.products[idx], updates)
    return save(d)
  }

  function deleteProduct(id) {
    const d = getMenuData()
    if (!d) return false
    d.products = d.products.filter(p => p.id !== id)
    return save(d)
  }

  // 大类(Group)操作
  function addGroup(nameObj) {
    const d = getMenuData()
    if (!d) return false
    if (!d.groups) d.groups = []
    d.groups.push({
      id: uid(),
      name: nameObj || { zh: '新分类' },
      sort: d.groups.length
    })
    return save(d)
  }

  function updateGroup(id, updates) {
    const d = getMenuData()
    if (!d) return false
    const idx = (d.groups || []).findIndex(g => g.id === id)
    if (idx === -1) return false
    Object.assign(d.groups[idx], updates)
    return save(d)
  }

  function deleteGroup(id) {
    const d = getMenuData()
    if (!d) return false
    d.groups = (d.groups || []).filter(g => g.id !== id)
    // 同时删除该大类下的分类及其菜品
    const catIds = (d.categories || []).filter(c => c.groupId === id).map(c => c.id)
    d.categories = (d.categories || []).filter(c => c.groupId !== id)
    d.products = (d.products || []).filter(p => !catIds.includes(p.categoryId))
    return save(d)
  }

  // 数据导入导出
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
      // 保留当前密码
      if (current?.passwordHash) {
        imported.passwordHash = current.passwordHash
      }
      if (current?.theme) {
        imported.theme = current.theme
      }
      if (current?.currentLang) {
        imported.currentLang = current.currentLang
      }
      if (!imported.groups) imported.groups = []
      if (!imported.categories) imported.categories = []
      if (!imported.products) imported.products = []
      imported.shopName = imported.shopName || { zh: '店铺名称' }
      return save(imported)
    } catch (e) {
      console.error('导入失败', e)
      return false
    }
  }

  // 获取菜品总数
  function getProductCount() {
    const d = getMenuData()
    return d?.products?.length || 0
  }

  return {
    getMenuData,
    setMenuData: save,
    initDefaultData,
    verifyPassword,
    hashPassword,
    addGroup,
    updateGroup,
    deleteGroup,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    exportJSON,
    importJSON,
    getProductCount,
    refresh
  }
}
