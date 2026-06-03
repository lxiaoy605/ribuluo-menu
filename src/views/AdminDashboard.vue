<template>
  <div class="admin-page" v-if="authed">
    <!-- 店铺名称 -->
    <section class="admin-section">
      <h3 class="section-title">{{ t('shopName') }}</h3>
      <div class="lang-inputs">
        <div v-for="l in langOptions" :key="l.code" class="lang-input-row">
          <span class="lang-flag">{{ l.flag }}</span>
          <input v-model="shopNameEdit[l.code]" class="form-input" :placeholder="l.label" />
        </div>
      </div>
      <button class="btn btn-primary btn-sm" @click="saveShopName" style="margin-top:8px">{{ t('save') }}</button>
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
          <input type="file" accept="image/*" @change="onImageUpload" class="form-input" />
          <div v-if="itemForm.image" style="margin-top:8px">
            <img :src="itemForm.image" style="max-width:150px;border-radius:8px" />
            <button class="btn btn-sm btn-danger" style="margin-left:8px" @click="itemForm.image = ''">移除</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('imagePosition') }}</label>
          <select v-model="itemForm.imagePosition" class="form-select">
            <option value="top">⬆ 顶部</option>
            <option value="bottom">⬇ 底部</option>
            <option value="left">⬅ 左侧</option>
            <option value="right">➡ 右侧</option>
            <option value="background">🖼 背景图</option>
            <option value="none">🚫 不显示</option>
          </select>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useMenuData } from '../composables/useMenuData'

const router = useRouter()
const { t, tName, langOptions } = useI18n()
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

const qrList = [
  { key: 'wechat', icon: '💬', label: '微信' },
  { key: 'whatsapp', icon: '📱', label: 'WhatsApp' },
  { key: 'telegram', icon: '✈️', label: 'Telegram' }
]

const categories = computed(() => data.value?.categories || [])
const sortedCategories = computed(() => categories.value.slice().sort((a, b) => (a.sort || 0) - (b.sort || 0)))

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
  if (file.size > 1 * 1024 * 1024) { alert('图片不能超过1MB'); return }
  const reader = new FileReader()
  reader.onload = (ev) => { contacts[type] = ev.target.result; saveContacts() }
  reader.readAsDataURL(file)
}

function saveShopName() {
  const d = getMenuData()
  if (d) { d.shopName = { ...shopNameEdit }; setMenuData(d); refreshData() }
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
  if (file.size > 2 * 1024 * 1024) { alert('图片不能超过2MB'); return }
  const reader = new FileReader()
  reader.onload = (ev) => { itemForm.image = ev.target.result }
  reader.readAsDataURL(file)
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
  reader.onload = (ev) => {
    const ok = importJSON(ev.target.result)
    if (ok) { alert(t('importSuccess')); refreshData() }
    else { alert(t('importError')) }
  }
  reader.readAsText(file)
  e.target.value = ''
}

onMounted(() => {
  const loggedIn = sessionStorage.getItem('ribuluo_admin_auth')
  if (!loggedIn) {
    router.replace('/admin')
    return
  }
  authed.value = true
  refreshData()
})
</script>

<style scoped>
.admin-page { padding: 16px; }
.admin-section {
  background: var(--bg-card); border-radius: 12px;
  padding: 16px; margin-bottom: 16px;
  border: 1px solid var(--border);
}
.section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }

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
.badge-rec { background: var(--badge-rec); color: #fff; }
.badge-sold { background: var(--badge-sold); color: #fff; }

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
</style>
