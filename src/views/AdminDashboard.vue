<template>
  <div class="admin-page" v-if="authed">
    <!-- 分享与导出 -->
    <section class="admin-section">
      <div style="display:flex;gap:10px">
        <button class="btn btn-primary" style="flex:1" @click="showShare = true">📱 {{ t('share') }}</button>
        <button class="btn btn-outline" style="flex:1" @click="showExportOptions = true">📸 {{ t('export') }}</button>
      </div>
    </section>

    <!-- 一级分类管理 -->
    <section class="admin-section">
      <div class="section-header">
        <h3 class="section-title">一级分类 ({{ categories.length }})</h3>
        <button class="btn btn-primary btn-sm" @click="openAddCategory">{{ t('addCategory') }}</button>
      </div>
      <div v-for="cat in sortedCategories" :key="cat.id" class="cat-block">
        <div class="cat-header">
          <span class="cat-name">{{ tName(cat.name) }}</span>
          <div class="cat-actions">
            <button class="btn btn-sm btn-outline" @click="openEditCategory(cat)">✏️</button>
            <button class="btn btn-sm btn-danger" @click="handleDeleteCategory(cat)">🗑</button>
          </div>
        </div>
        <!-- 二级分类 -->
        <div class="sub-list">
          <div v-for="sub in (cat.children || [])" :key="sub.id" class="sub-block">
            <div class="sub-header">
              <span class="sub-name">{{ tName(sub.name) }} ({{ (sub.items || []).length }})</span>
              <div class="sub-actions">
                <button class="btn btn-sm btn-outline" @click="openEditSubCategory(cat.id, sub)">✏️</button>
                <button class="btn btn-sm btn-outline" @click="openAddItem(cat.id, sub.id)">+菜</button>
                <button class="btn btn-sm btn-danger" @click="handleDeleteSubCategory(cat.id, sub)">🗑</button>
              </div>
            </div>
            <!-- 菜品 -->
            <div class="item-list">
              <div v-for="item in (sub.items || [])" :key="item.id" class="item-row">
                <span class="item-name">{{ tName(item.name) }}
                  <span v-if="item.image" class="img-dot" title="已上传图片">📷</span>
                  <span v-else class="img-dot no" title="暂无图片">⚪</span>
                  <span v-if="item.recommended" class="badge badge-rec">⭐</span>
                  <span v-if="item.soldOut" class="badge badge-sold">{{ t('soldOut') }}</span>
                </span>
                <span class="item-price">{{ formatPrice(item.price) }}</span>
                <div class="item-actions">
                  <button class="btn btn-sm btn-outline" @click="openEditItem(cat.id, sub.id, item)">✏️</button>
                  <button class="btn btn-sm btn-danger" @click="handleDeleteItem(cat.id, sub.id, item)">🗑</button>
                </div>
              </div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline btn-block" @click="openAddSubCategory(cat.id)" style="margin-top:6px">+ 二级分类</button>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section class="admin-section">
      <h3 class="section-title">{{ t('contact') }}</h3>
      <div class="qr-uploads">
        <div class="qr-upload-item" v-for="q in qrList" :key="q.key">
          <label>{{ q.icon }} {{ q.label }}</label>
          <div class="qr-preview" v-if="contacts[q.key]" @click="triggerQrUpload(q.key)">
            <img :src="contacts[q.key]" />
          </div>
          <div class="qr-upload-btn" v-else @click="triggerQrUpload(q.key)">+ 上传</div>
          <button v-if="contacts[q.key]" class="btn btn-sm btn-danger" @click="contacts[q.key]='';saveContacts()">移除</button>
          <input type="file" accept="image/*" :ref="el => qrInputs[q.key] = el" style="display:none" @change="onQrUpload($event, q.key)" />
        </div>
      </div>
    </section>

    <!-- 数据备份 -->
    <section class="admin-section">
      <h3 class="section-title">{{ t('dataBackup') }}</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-outline" @click="handleExportData">{{ t('exportData') }}</button>
        <button class="btn btn-outline" @click="triggerImport">{{ t('importData') }}</button>
        <input ref="fileInput" type="file" accept=".json" style="display:none" @change="handleImportData" />
      </div>
    </section>

    <!-- ============== Modals ============== -->

    <!-- 店名编辑弹窗 -->
    <div v-if="showShopNameEditor" class="modal-overlay" @click.self="showShopNameEditor = false">
      <div class="modal-content">
        <h3 class="modal-title">{{ t('editShopName') }}</h3>
        <div class="lang-inputs">
          <div v-for="l in langOptions" :key="l.code" class="lang-input-row">
            <span class="lang-flag">{{ l.flag }}</span>
            <input v-model="shopNameEdit[l.code]" class="form-input" :placeholder="l.label" />
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showShopNameEditor = false">{{ t('cancel') }}</button>
          <button class="btn btn-primary" @click="saveShopName">{{ t('save') }}</button>
        </div>
      </div>
    </div>

    <!-- 一级分类弹窗 -->
    <div v-if="showCategoryEditor" class="modal-overlay" @click.self="showCategoryEditor = false">
      <div class="modal-content">
        <h3 class="modal-title">{{ editingCategory?.id ? '编辑一级分类' : '新增一级分类' }}</h3>
        <div class="lang-inputs">
          <div v-for="l in langOptions" :key="l.code" class="lang-input-row">
            <span class="lang-flag">{{ l.flag }}</span>
            <input v-model="categoryForm.name[l.code]" class="form-input" :placeholder="l.label" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">排序</label>
          <input v-model.number="categoryForm.sort" type="number" class="form-input" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showCategoryEditor = false">{{ t('cancel') }}</button>
          <button class="btn btn-primary" @click="saveCategory">{{ t('save') }}</button>
        </div>
      </div>
    </div>

    <!-- 二级分类弹窗 -->
    <div v-if="showSubEditor" class="modal-overlay" @click.self="showSubEditor = false">
      <div class="modal-content">
        <h3 class="modal-title">{{ editingSub?.id ? '编辑二级分类' : '新增二级分类' }}</h3>
        <div class="lang-inputs">
          <div v-for="l in langOptions" :key="l.code" class="lang-input-row">
            <span class="lang-flag">{{ l.flag }}</span>
            <input v-model="subForm.name[l.code]" class="form-input" :placeholder="l.label" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">排序</label>
          <input v-model.number="subForm.sort" type="number" class="form-input" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showSubEditor = false">{{ t('cancel') }}</button>
          <button class="btn btn-primary" @click="saveSubCategory">{{ t('save') }}</button>
        </div>
      </div>
    </div>

    <!-- 菜品弹窗 -->
    <div v-if="showItemEditor" class="modal-overlay" @click.self="showItemEditor = false">
      <div class="modal-content">
        <h3 class="modal-title">{{ editingItem?.id ? t('editProduct') : t('addProduct') }}</h3>
        <div class="lang-inputs">
          <div v-for="l in langOptions" :key="l.code" class="lang-input-row">
            <span class="lang-flag">{{ l.flag }}</span>
            <input v-model="itemForm.name[l.code]" class="form-input" :placeholder="t('name') + ' - ' + l.label" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('price') }}</label>
          <input v-model.number="itemForm.price" type="number" class="form-input" :placeholder="t('pricePlaceholder')" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('image') }}</label>
          <input type="file" accept="image/*" @change="onImageUpload" class="form-input" :disabled="uploading" />
          <p v-if="uploading" style="color:var(--accent);font-size:12px;margin-top:4px">⏳ 上传中...</p>
          <p style="color:var(--text-secondary);font-size:11px;margin-top:4px">图片最大限制5M，仅支持 JPG/PNG/WebP</p>
          <div v-if="itemForm.image" style="margin-top:8px">
            <img :src="itemForm.image" style="max-width:150px;border-radius:8px" />
            <button class="btn btn-sm btn-danger" style="margin-left:8px" @click="itemForm.image = ''">移除</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('imagePosition') }}</label>
          <div class="custom-select">
            <button
              v-for="opt in imagePosOptions"
              :key="opt.value"
              class="select-option"
              :class="{ active: itemForm.imagePosition === opt.value }"
              @click="itemForm.imagePosition = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>
        <div class="form-group" style="display:flex;gap:16px">
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" v-model="itemForm.recommended" /> {{ t('recommended') }}
          </label>
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" v-model="itemForm.soldOut" /> {{ t('soldOut') }}
          </label>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showItemEditor = false">{{ t('cancel') }}</button>
          <button class="btn btn-primary" @click="saveItem">{{ t('save') }}</button>
        </div>
      </div>
    </div>

    <!-- 导出菜单弹窗 -->
    <div v-if="showExportOptions" class="modal-overlay" @click.self="showExportOptions = false">
      <div class="modal-content">
        <h3 class="modal-title">导出菜单</h3>
        <p style="color:var(--text-secondary);margin-bottom:8px">分辨率 1456 × 2048</p>
        <p style="font-size:12px;color:var(--text-secondary);margin-bottom:16px">
          共 {{ pageCount }} 页，将导出 {{ pageCount }} 张图片
        </p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showExportOptions = false">{{ t('cancel') }}</button>
          <button class="btn btn-primary" @click="doExport" :disabled="exporting">
            {{ exporting ? '生成中...' : t('download') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <div v-if="showShare" class="modal-overlay" @click.self="showShare = false">
      <div class="modal-content">
        <h3 class="modal-title">{{ t('share') }}</h3>
        <div class="share-qrcode" ref="qrContainer"></div>
        <p style="text-align:center;color:var(--text-secondary);margin:12px 0">{{ t('scanQR') }}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="copyLink">{{ t('copyLink') }}</button>
          <button class="btn btn-primary" @click="showShare = false">{{ t('cancel') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useMenuData } from '../composables/useMenuData'
import { useTheme } from '../composables/useTheme'
import { useCloudinary } from '../composables/useCloudinary'

const router = useRouter()
const { t, tName, langOptions } = useI18n()
const { currentTheme, getTheme } = useTheme()
const { uploadImage } = useCloudinary()
const {
  getMenuData, setMenuData,
  addCategory, updateCategory, deleteCategory,
  addSubCategory, updateSubCategory, deleteSubCategory,
  addItem, updateItem, deleteItem,
  exportJSON, importJSON
} = useMenuData()

const authed = ref(false)
const data = ref(null)
const contacts = reactive({ wechat: '', whatsapp: '', telegram: '' })
const qrInputs = reactive({ wechat: null, whatsapp: null, telegram: null })
const showCategoryEditor = ref(false)
const showSubEditor = ref(false)
const showItemEditor = ref(false)
const showShopNameEditor = ref(false)
const editingCategory = ref(null)
const editingSub = ref(null)
const editingItem = ref(null)
const subParentId = ref('')
const itemParentCatId = ref('')
const itemParentSubId = ref('')
const fileInput = ref(null)
const shopNameEdit = reactive({ zh: '', am: '', en: '', ru: '' })

const categoryForm = reactive({ name: { zh: '', am: '', en: '', ru: '' }, sort: 0 })
const subForm = reactive({ name: { zh: '', am: '', en: '', ru: '' }, sort: 0 })
const itemForm = reactive({
  name: { zh: '', am: '', en: '', ru: '' },
  price: 0, image: '', imagePosition: 'top', recommended: false, soldOut: false
})

// 分享与导出
const showShare = ref(false)
const showExportOptions = ref(false)
const exporting = ref(false)
const qrContainer = ref(null)
const uploading = ref(false)

const imagePosOptions = [
  { value: 'top', label: '⬆ 顶部' },
  { value: 'bottom', label: '⬇ 底部' },
  { value: 'left', label: '⬅ 左侧' },
  { value: 'right', label: '➡ 右侧' },
  { value: 'background', label: '🖼 背景图' },
  { value: 'none', label: '🚫 不显示' }
]

const qrList = [
  { key: 'wechat', icon: '💬', label: '微信' },
  { key: 'whatsapp', icon: '📱', label: 'WhatsApp' },
  { key: 'telegram', icon: '✈️', label: 'Telegram' }
]

const categories = computed(() => data.value?.categories || [])
const sortedCategories = computed(() => categories.value.slice().sort((a, b) => (a.sort || 0) - (b.sort || 0)))

const PAGE_H = 2048
const PAGE_W = 1456
const PAGE_PAD = 80
const ROW_H = 58
const SUB_H = 70
const CAT_H = 80
const TITLE_H = 100  // 标题占用高度（52px字体 + 20px下边距 + 上下留白）

const pageCount = computed(() => {
  return Math.max(1, paginate().length)
})

function formatPrice(price) {
  if (price === 0) return '时价'
  return '֏ ' + price.toLocaleString()
}

function refreshData() {
  data.value = getMenuData()
  if (!data.value) return
  if (data.value.shopName) Object.assign(shopNameEdit, data.value.shopName)
  if (data.value.contacts) Object.assign(contacts, data.value.contacts)
}

// 店名
function saveShopName() {
  const d = getMenuData()
  if (d) { d.shopName = { ...shopNameEdit }; setMenuData(d); refreshData() }
  showShopNameEditor.value = false
}

// 联系方式
function saveContacts() {
  const d = getMenuData()
  if (d) { d.contacts = { ...contacts }; setMenuData(d) }
}
function triggerQrUpload(type) { qrInputs[type]?.click() }
function onQrUpload(e, type) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { alert('请上传图片文件'); return }
  if (file.size > 5 * 1024 * 1024) { alert('图片不能超过5MB'); return }
  uploading.value = true
  uploadImage(file).then(result => {
    contacts[type] = result.url
    saveContacts()
    uploading.value = false
  }).catch(err => {
    alert('上传失败: ' + err.message)
    uploading.value = false
  })
}

// ========== 一级分类 ==========
function openAddCategory() {
  editingCategory.value = null
  categoryForm.name = { zh: '', am: '', en: '', ru: '' }
  categoryForm.sort = categories.value.length
  showCategoryEditor.value = true
}
function openEditCategory(cat) {
  editingCategory.value = cat
  categoryForm.name = { ...cat.name }
  categoryForm.sort = cat.sort || 0
  showCategoryEditor.value = true
}
function saveCategory() {
  if (editingCategory.value?.id) {
    updateCategory(editingCategory.value.id, { name: { ...categoryForm.name }, sort: categoryForm.sort })
  } else {
    addCategory({ ...categoryForm.name })
  }
  showCategoryEditor.value = false
  refreshData()
}
function handleDeleteCategory(cat) {
  if (!confirm(t('deleteConfirm'))) return
  deleteCategory(cat.id)
  refreshData()
}

// ========== 二级分类 ==========
function openAddSubCategory(catId) {
  editingSub.value = null
  subParentId.value = catId
  subForm.name = { zh: '', am: '', en: '', ru: '' }
  subForm.sort = (categories.value.find(c => c.id === catId)?.children?.length || 0)
  showSubEditor.value = true
}
function openEditSubCategory(catId, sub) {
  editingSub.value = sub
  subParentId.value = catId
  subForm.name = { ...sub.name }
  subForm.sort = sub.sort || 0
  showSubEditor.value = true
}
function saveSubCategory() {
  if (editingSub.value?.id) {
    updateSubCategory(subParentId.value, editingSub.value.id, { name: { ...subForm.name }, sort: subForm.sort })
  } else {
    addSubCategory(subParentId.value, { ...subForm.name })
  }
  showSubEditor.value = false
  refreshData()
}
function handleDeleteSubCategory(catId, sub) {
  if (!confirm(t('deleteConfirm'))) return
  deleteSubCategory(catId, sub.id)
  refreshData()
}

// ========== 菜品 ==========
function openAddItem(catId, subId) {
  editingItem.value = null
  itemParentCatId.value = catId
  itemParentSubId.value = subId
  itemForm.name = { zh: '', am: '', en: '', ru: '' }
  itemForm.price = 0
  itemForm.image = ''
  itemForm.imagePosition = 'top'
  itemForm.recommended = false
  itemForm.soldOut = false
  showItemEditor.value = true
}
function openEditItem(catId, subId, item) {
  editingItem.value = item
  itemParentCatId.value = catId
  itemParentSubId.value = subId
  itemForm.name = { ...item.name }
  itemForm.price = item.price
  itemForm.image = item.image || ''
  itemForm.imagePosition = item.imagePosition || 'top'
  itemForm.recommended = item.recommended || false
  itemForm.soldOut = item.soldOut || false
  showItemEditor.value = true
}
function saveItem() {
  const payload = {
    name: { ...itemForm.name },
    price: itemForm.price,
    image: itemForm.image,
    imagePosition: itemForm.imagePosition,
    recommended: itemForm.recommended,
    soldOut: itemForm.soldOut
  }
  if (editingItem.value?.id) {
    updateItem(itemParentCatId.value, itemParentSubId.value, editingItem.value.id, payload)
  } else {
    addItem(itemParentCatId.value, itemParentSubId.value, payload)
  }
  showItemEditor.value = false
  refreshData()
}
function handleDeleteItem(catId, subId, item) {
  if (!confirm(t('deleteConfirm'))) return
  deleteItem(catId, subId, item.id)
  refreshData()
}
function onImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { alert('请上传图片文件'); return }
  if (file.size > 5 * 1024 * 1024) { alert('图片不能超过5MB'); return }
  uploading.value = true
  uploadImage(file).then(result => {
    itemForm.image = result.url
    uploading.value = false
  }).catch(err => {
    alert('上传失败: ' + err.message)
    uploading.value = false
  })
}

// 数据导入导出
function handleExportData() {
  const json = exportJSON()
  if (!json) return
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = '菜单备份.json'; a.click()
  URL.revokeObjectURL(url)
}
function triggerImport() { fileInput.value?.click() }
function handleImportData(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (ev) => {
    const ok = await importJSON(ev.target.result)
    if (ok) { alert(t('importSuccess')); refreshData() }
    else { alert(t('importError')) }
  }
  reader.readAsText(file)
  e.target.value = ''
}

// ========== 海报导出 ==========
function buildPage(pageIdx, pageData) {
  const theme = getTheme()
  const page = document.createElement('div')
  page.style.cssText = `width:${PAGE_W}px;height:${PAGE_H}px;position:relative;overflow:hidden;font-family:${theme.fonts.body}`

  const bg = document.createElement('img')
  bg.src = theme.bgImage
  bg.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:cover`
  page.appendChild(bg)

  const content = document.createElement('div')
  content.style.cssText = `position:relative;z-index:1;padding:${PAGE_PAD}px;height:100%;display:flex;flex-direction:column`
  page.appendChild(content)

  const title = document.createElement('div')
  title.style.cssText = `text-align:center;font-size:52px;font-weight:bold;color:${theme.css['--accent']};font-family:${theme.fonts.title};margin-bottom:20px`
  title.textContent = tName(data.value?.shopName)
  content.appendChild(title)

  const inner = document.createElement('div')
  inner.style.cssText = 'flex:1;overflow:hidden'

  let lastCatId = null
  for (let di = 0; di < pageData.length; di++) {
    const { cat, sub, items } = pageData[di]

    // 只在分类变化时显示一级分类标题
    if (cat.id !== lastCatId) {
      const catEl = document.createElement('div')
      catEl.style.cssText = `text-align:center;font-size:36px;font-weight:bold;color:${theme.css['--accent']};font-family:${theme.fonts.title};padding:8px 0;margin-top:${di > 0 ? '20px' : '0'}`
      catEl.innerHTML = `━━━━━━ &nbsp;${tName(cat.name)}&nbsp; ━━━━━━`
      inner.appendChild(catEl)
      lastCatId = cat.id
    }

    const subEl = document.createElement('div')
    subEl.style.cssText = `text-align:center;font-size:28px;color:${theme.css['--text-primary']};padding:6px 12px;margin:6px auto;background:${theme.css['--tab-bg']};border:1px solid ${theme.css['--accent']};display:inline-block;width:auto`
    subEl.textContent = tName(sub.name)
    const subWrap = document.createElement('div')
    subWrap.style.cssText = 'text-align:center'
    subWrap.appendChild(subEl)
    inner.appendChild(subWrap)

    const cols = [[], []]
    items.forEach((item, i) => cols[i % 2].push(item))

    const grid = document.createElement('div')
    grid.style.cssText = 'display:flex;gap:40px;margin-top:8px'
    cols.forEach(col => {
      const colDiv = document.createElement('div')
      colDiv.style.cssText = 'flex:1'
      col.forEach(item => {
        const row = document.createElement('div')
        row.style.cssText = `display:flex;align-items:baseline;justify-content:space-between;padding:4px 0;border-bottom:1px solid ${theme.css['--border']}`
        const nameSpan = document.createElement('span')
        nameSpan.style.cssText = `font-size:22px;color:${theme.css['--text-primary']}`
        nameSpan.textContent = (item.recommended ? '⭐' : '') + tName(item.name)
        const priceSpan = document.createElement('span')
        priceSpan.style.cssText = `font-size:22px;font-weight:bold;color:${theme.css['--text-price']};white-space:nowrap;margin-left:12px`
        priceSpan.textContent = item.price === 0 ? '时价' : '֏ ' + item.price.toLocaleString()
        row.appendChild(nameSpan)
        row.appendChild(priceSpan)
        colDiv.appendChild(row)
      })
      grid.appendChild(colDiv)
    })
    inner.appendChild(grid)
  }

  content.appendChild(inner)
  return page
}

function paginate() {
  const pages = []
  let curPage = []
  const bgH = PAGE_H - PAGE_PAD * 2 - TITLE_H
  let curH = 0
  let lastCatId = null

  for (const cat of sortedCategories.value) {
    for (const sub of (cat.children || [])) {
      let items = (sub.items || []).slice()
      if (!items.length) continue

      while (items.length > 0) {
        const catOverhead = (cat.id === lastCatId && curPage.length > 0) ? 0 : CAT_H
        const overhead = catOverhead + SUB_H
        const availH = bgH - curH - overhead

        // 剩余空间不够放一行 → 开新页
        if (curPage.length > 0 && availH < ROW_H) {
          pages.push(curPage)
          curPage = []
          curH = 0
          lastCatId = null
          continue
        }

        const maxRows = Math.max(1, Math.floor(availH / ROW_H))
        const maxItems = maxRows * 2
        const batch = items.slice(0, Math.max(2, maxItems))
        items = items.slice(Math.max(2, maxItems))
        const rows = Math.ceil(batch.length / 2)

        curPage.push({ cat, sub, items: batch })
        curH += overhead + rows * ROW_H
        lastCatId = cat.id
      }
    }
  }
  if (curPage.length) pages.push(curPage)
  return pages
}

async function doExport() {
  exporting.value = true
  showExportOptions.value = false
  await nextTick()
  try {
    const pages = paginate()
    if (!pages.length) { exporting.value = false; return }
    await exportPNGs(pages)
  } catch (e) {
    console.error('导出失败', e)
  }
  exporting.value = false
}

async function exportPNGs(pages) {
  const { default: html2canvas } = await import('html2canvas')
  const EXPORT_W = 1456
  const EXPORT_H = 2048
  const scale = Math.max(EXPORT_W / PAGE_W, EXPORT_H / PAGE_H)
  for (let i = 0; i < pages.length; i++) {
    const pageEl = buildPage(i, pages[i])
    document.body.appendChild(pageEl)
    await nextTick()
    const canvas = await html2canvas(pageEl, { scale, useCORS: true, allowTaint: true, backgroundColor: null })
    document.body.removeChild(pageEl)
    const link = document.createElement('a')
    link.download = '菜单_' + tName(data.value?.shopName || { zh: '菜单' }) + '_p' + (i + 1) + '.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    if (i < pages.length - 1) await new Promise(r => setTimeout(r, 200))
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href.split('#')[0]).then(() => {
    alert('链接已复制！')
  }).catch(() => {
    prompt('请手动复制链接', window.location.href.split('#')[0])
  })
}

// 分享二维码
watch(showShare, async (val) => {
  if (val && qrContainer.value) {
    await nextTick()
    try {
      const QRCode = (await import('qrcode')).default
      const url = window.location.href.split('#')[0]
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, url, { width: 200, margin: 2 })
      qrContainer.value.innerHTML = ''
      qrContainer.value.appendChild(canvas)
    } catch (e) {
      console.error('二维码生成失败', e)
    }
  }
})

// 监听来自 App.vue 的打开店名编辑器事件
function onOpenShopNameEditor() {
  showShopNameEditor.value = true
}

onMounted(() => {
  const loggedIn = sessionStorage.getItem('ribuluo_admin_auth')
  if (!loggedIn) {
    router.replace('/admin')
    return
  }
  authed.value = true
  refreshData()
  window.addEventListener('open-shop-name-editor', onOpenShopNameEditor)
})

onUnmounted(() => {
  window.removeEventListener('open-shop-name-editor', onOpenShopNameEditor)
})

// 响应式同步数据（解决异步加载时序问题）
watch(() => getMenuData(), (menuData) => {
  if (menuData) {
    data.value = menuData
    if (menuData.shopName) Object.assign(shopNameEdit, menuData.shopName)
    if (menuData.contacts) Object.assign(contacts, menuData.contacts)
  }
})
</script>

<style scoped>
.admin-page { padding: 16px; padding-bottom: 40px; }
.admin-section {
  background: var(--bg-card); border-radius: 12px;
  padding: 16px; margin-bottom: 16px;
  border: 1px solid var(--border);
}
.section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }

.shop-name-display {
  font-family: var(--title-font);
  font-size: 18px;
  color: var(--accent);
  margin-bottom: 8px;
}

.lang-inputs { display: flex; flex-direction: column; gap: 8px; }
.lang-input-row { display: flex; align-items: center; gap: 8px; }
.lang-flag { font-size: 18px; width: 24px; text-align: center; }

.cat-block { margin-bottom: 12px; }
.cat-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; background: var(--bg-secondary); border-radius: 8px;
  border-left: 3px solid var(--accent);
}
.cat-name { font-size: 15px; font-weight: 600; }
.cat-actions { display: flex; gap: 4px; }

.sub-list { padding-left: 12px; }
.sub-block { margin-top: 4px; }
.sub-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 10px; background: var(--bg-secondary); border-radius: 6px;
}
.sub-name { font-size: 13px; color: var(--accent-light); }
.sub-actions { display: flex; gap: 4px; }

.item-list { padding-left: 8px; }
.item-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 8px; font-size: 12px;
  border-bottom: 1px solid var(--border);
}
.item-name { flex: 1; }
.item-price { color: var(--text-price); margin: 0 8px; font-weight: 600; white-space: nowrap; }
.item-actions { display: flex; gap: 2px; }

.badge { font-size: 10px; padding: 1px 6px; border-radius: 3px; margin-left: 4px; }
.img-dot { font-size: 11px; margin-left: 2px; }
.img-dot.no { opacity: 0.3; }
.badge-rec { background: var(--badge-rec); color: var(--badge-text, #2B1600); }
.badge-sold { background: var(--badge-sold); color: #fff; }

/* 自定义选择组件 */
.custom-select {
  display: flex; flex-wrap: wrap; gap: 6px;
}
.select-option {
  padding: 6px 12px; font-size: 12px; border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--tab-bg);
  color: var(--text-secondary);
  cursor: pointer; transition: all 0.2s;
  font-family: var(--body-font);
}
.select-option.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.qr-uploads { display: flex; flex-direction: column; gap: 12px; }
.qr-upload-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px; background: var(--bg-secondary); border-radius: 8px;
}
.qr-upload-item label { width: 80px; font-size: 13px; color: var(--text-secondary); flex-shrink: 0; }
.qr-preview { width: 60px; height: 60px; cursor: pointer; border-radius: 6px; overflow: hidden; }
.qr-preview img { width: 100%; height: 100%; object-fit: cover; }
.qr-upload-btn {
  width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;
  border: 2px dashed var(--input-border); border-radius: 6px;
  font-size: 12px; color: var(--text-secondary); cursor: pointer;
}

/* 弹窗 */
.share-qrcode { display: flex; justify-content: center; padding: 12px; }
.share-qrcode canvas { border-radius: 8px; }
.resolution-presets { display: flex; flex-wrap: wrap; gap: 6px; }
</style>
