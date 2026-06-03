<template>
  <div class="admin-page" v-if="authed">
    <!-- 店铺名称编辑 -->
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

    <!-- 分类管理 -->
    <section class="admin-section">
      <div class="section-header">
        <h3 class="section-title">{{ t('categories') }} ({{ categories.length }})</h3>
        <button class="btn btn-primary btn-sm" @click="openAddCategory">{{ t('addCategory') }}</button>
      </div>
      <div class="list-items">
        <div v-for="cat in categories" :key="cat.id" class="list-item">
          <span class="list-item-name">{{ tName(cat.name) }}</span>
          <div class="list-item-actions">
            <button class="btn btn-sm btn-outline" @click="openEditCategory(cat)">✏️</button>
            <button class="btn btn-sm btn-danger" @click="handleDeleteCategory(cat)">🗑</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 菜品管理 -->
    <section class="admin-section">
      <div class="section-header">
        <h3 class="section-title">{{ t('products') }} ({{ products.length }})</h3>
        <button class="btn btn-primary btn-sm" @click="openAddProduct">{{ t('addProduct') }}</button>
      </div>
      <!-- 按分类分组显示 -->
      <div v-for="cat in categories" :key="cat.id">
        <h4 class="cat-subtitle">{{ tName(cat.name) }} ({{ productsByCat(cat.id).length }})</h4>
        <div v-for="p in productsByCat(cat.id)" :key="p.id" class="list-item">
          <div class="list-item-info">
            <span class="list-item-name">{{ tName(p.name) }}
              <span v-if="p.recommended" class="badge badge-rec">⭐</span>
              <span v-if="p.soldOut" class="badge badge-sold">{{ t('soldOut') }}</span>
            </span>
            <span class="list-item-price">{{ formatPrice(p.price) }}</span>
          </div>
          <div class="list-item-actions">
            <button class="btn btn-sm btn-outline" @click="openEditProduct(p)">✏️</button>
            <button class="btn btn-sm btn-danger" @click="handleDeleteProduct(p)">🗑</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section class="admin-section">
      <h3 class="section-title">{{ t('contact') }}</h3>
      <div class="qr-uploads">
        <div class="qr-upload-item">
          <label>💬 微信</label>
          <div class="qr-preview" v-if="contacts.wechat" @click="triggerQrUpload('wechat')">
            <img :src="contacts.wechat" />
          </div>
          <div class="qr-upload-btn" v-else @click="triggerQrUpload('wechat')">+ 上传</div>
          <button v-if="contacts.wechat" class="btn btn-sm btn-danger" @click="contacts.wechat='';saveContacts()">移除</button>
          <input type="file" accept="image/*" :ref="el => qrInputs.wechat = el" style="display:none" @change="onQrUpload($event, 'wechat')" />
        </div>
        <div class="qr-upload-item">
          <label>📱 WhatsApp</label>
          <div class="qr-preview" v-if="contacts.whatsapp" @click="triggerQrUpload('whatsapp')">
            <img :src="contacts.whatsapp" />
          </div>
          <div class="qr-upload-btn" v-else @click="triggerQrUpload('whatsapp')">+ 上传</div>
          <button v-if="contacts.whatsapp" class="btn btn-sm btn-danger" @click="contacts.whatsapp='';saveContacts()">移除</button>
          <input type="file" accept="image/*" :ref="el => qrInputs.whatsapp = el" style="display:none" @change="onQrUpload($event, 'whatsapp')" />
        </div>
        <div class="qr-upload-item">
          <label>✈️ Telegram</label>
          <div class="qr-preview" v-if="contacts.telegram" @click="triggerQrUpload('telegram')">
            <img :src="contacts.telegram" />
          </div>
          <div class="qr-upload-btn" v-else @click="triggerQrUpload('telegram')">+ 上传</div>
          <button v-if="contacts.telegram" class="btn btn-sm btn-danger" @click="contacts.telegram='';saveContacts()">移除</button>
          <input type="file" accept="image/*" :ref="el => qrInputs.telegram = el" style="display:none" @change="onQrUpload($event, 'telegram')" />
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

    <!-- 编辑分类弹窗 -->
    <div v-if="showCategoryEditor" class="modal-overlay" @click.self="showCategoryEditor = false">
      <div class="modal-content">
        <h3 class="modal-title">{{ editingCategory?.id ? t('editCategory') : t('addCategory') }}</h3>
        <div class="lang-inputs">
          <div v-for="l in langOptions" :key="l.code" class="lang-input-row">
            <span class="lang-flag">{{ l.flag }}</span>
            <input v-model="categoryForm.name[l.code]" class="form-input" :placeholder="l.label" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">分组（留空为顶级分类）</label>
          <input v-model="categoryForm.groupZh" class="form-input" placeholder="例如：火锅系列" />
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

    <!-- 编辑菜品弹窗 -->
    <div v-if="showProductEditor" class="modal-overlay" @click.self="showProductEditor = false">
      <div class="modal-content">
        <h3 class="modal-title">{{ editingProduct?.id ? t('editProduct') : t('addProduct') }}</h3>

        <div class="lang-inputs">
          <div v-for="l in langOptions" :key="l.code" class="lang-input-row">
            <span class="lang-flag">{{ l.flag }}</span>
            <input v-model="productForm.name[l.code]" class="form-input" :placeholder="t('name') + ' - ' + l.label" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('price') }}</label>
          <input v-model.number="productForm.price" type="number" class="form-input" :placeholder="t('pricePlaceholder')" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('category') }}</label>
          <select v-model="productForm.categoryId" class="form-select">
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ tName(c.name) }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('image') }}</label>
          <input type="file" accept="image/*" @change="onImageUpload" class="form-input" />
          <div v-if="productForm.image" style="margin-top:8px">
            <img :src="productForm.image" style="max-width:150px;border-radius:8px" />
            <button class="btn btn-sm btn-danger" style="margin-left:8px" @click="productForm.image = ''">移除</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('imagePosition') }}</label>
          <select v-model="productForm.imagePosition" class="form-select">
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
            <input type="checkbox" v-model="productForm.recommended" /> {{ t('recommended') }}
          </label>
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" v-model="productForm.soldOut" /> {{ t('soldOut') }}
          </label>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showProductEditor = false">{{ t('cancel') }}</button>
          <button class="btn btn-primary" @click="saveProduct">{{ t('save') }}</button>
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
  addProduct, updateProduct, deleteProduct,
  exportJSON, importJSON
} = useMenuData()

const authed = ref(false)
const data = ref(null)
const contacts = reactive({ wechat: '', whatsapp: '', telegram: '' })
const qrInputs = reactive({ wechat: null, whatsapp: null, telegram: null })
const showCategoryEditor = ref(false)
const showProductEditor = ref(false)
const editingCategory = ref(null)
const editingProduct = ref(null)
const fileInput = ref(null)
const shopNameEdit = reactive({ zh: '', am: '', en: '', ru: '' })

const categoryForm = reactive({ name: { zh: '', am: '', en: '', ru: '' }, groupZh: '', sort: 0 })
const productForm = reactive({
  name: { zh: '', am: '', en: '', ru: '' },
  price: 0, categoryId: '', image: '', imagePosition: 'top',
  recommended: false, soldOut: false
})

const products = computed(() => data.value?.products || [])
const categories = computed(() => (data.value?.categories || []).sort((a, b) => a.sort - b.sort))

function productsByCat(catId) {
  return products.value.filter(p => p.categoryId === catId)
}

function refreshData() {
  data.value = getMenuData()
  if (data.value?.shopName) {
    Object.assign(shopNameEdit, data.value.shopName)
  }
  if (data.value?.contacts) {
    Object.assign(contacts, data.value.contacts)
  }
}

function saveContacts() {
  const d = getMenuData()
  if (d) {
    d.contacts = { ...contacts }
    setMenuData(d)
  }
}

function triggerQrUpload(type) {
  qrInputs[type]?.click()
}

function onQrUpload(e, type) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { alert('请上传图片文件'); return }
  if (file.size > 1 * 1024 * 1024) { alert('图片不能超过1MB'); return }
  const reader = new FileReader()
  reader.onload = (ev) => {
    contacts[type] = ev.target.result
    saveContacts()
  }
  reader.readAsDataURL(file)
}

function saveShopName() {
  const d = getMenuData()
  if (d) {
    d.shopName = { ...shopNameEdit }
    setMenuData(d)
    refreshData()
  }
}

function formatPrice(price) {
  if (price === 0) return '时价'
  return '֏ ' + price.toLocaleString()
}

// 分类操作
function openAddCategory() {
  editingCategory.value = null
  categoryForm.name = { zh: '', am: '', en: '', ru: '' }
  categoryForm.groupZh = ''
  categoryForm.sort = (data.value?.categories?.length || 0)
  showCategoryEditor.value = true
}
function openEditCategory(cat) {
  editingCategory.value = cat
  categoryForm.name = { ...cat.name }
  categoryForm.groupZh = cat.group?.zh || ''
  categoryForm.sort = cat.sort
  showCategoryEditor.value = true
}
function saveCategory() {
  const nameObj = { ...categoryForm.name }
  const group = categoryForm.groupZh ? { zh: categoryForm.groupZh } : null
  if (editingCategory.value?.id) {
    updateCategory(editingCategory.value.id, { name: nameObj, group, sort: categoryForm.sort })
  } else {
    const d = getMenuData()
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
    d.categories.push({ id, name: nameObj, group, sort: categoryForm.sort })
    setMenuData(d)
  }
  showCategoryEditor.value = false
  refreshData()
}
function handleDeleteCategory(cat) {
  if (!confirm(t('deleteConfirm'))) return
  deleteCategory(cat.id)
  refreshData()
}

// 菜品操作
function openAddProduct() {
  editingProduct.value = null
  productForm.name = { zh: '', am: '', en: '', ru: '' }
  productForm.price = 0
  productForm.categoryId = (data.value?.categories?.sort((a, b) => a.sort - b.sort)[0]?.id) || ''
  productForm.image = ''
  productForm.imagePosition = 'top'
  productForm.recommended = false
  productForm.soldOut = false
  showProductEditor.value = true
}
function openEditProduct(p) {
  editingProduct.value = p
  productForm.name = { ...p.name }
  productForm.price = p.price
  productForm.categoryId = p.categoryId
  productForm.image = p.image || ''
  productForm.imagePosition = p.imagePosition || 'top'
  productForm.recommended = p.recommended || false
  productForm.soldOut = p.soldOut || false
  showProductEditor.value = true
}
function saveProduct() {
  const payload = {
    name: { ...productForm.name },
    price: productForm.price,
    categoryId: productForm.categoryId,
    image: productForm.image,
    imagePosition: productForm.imagePosition,
    recommended: productForm.recommended,
    soldOut: productForm.soldOut
  }
  if (editingProduct.value?.id) {
    updateProduct(editingProduct.value.id, payload)
  } else {
    addProduct(payload)
  }
  showProductEditor.value = false
  refreshData()
}
function handleDeleteProduct(p) {
  if (!confirm(t('deleteConfirm'))) return
  deleteProduct(p.id)
  refreshData()
}
function onImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { alert('请上传图片文件'); return }
  if (file.size > 2 * 1024 * 1024) { alert('图片不能超过2MB'); return }
  const reader = new FileReader()
  reader.onload = (ev) => { productForm.image = ev.target.result }
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
  // 检查登录状态：sessionStorage 中必须有登录标记
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

.list-items { display: flex; flex-direction: column; gap: 6px; }
.list-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px; background: var(--bg-secondary); border-radius: 8px;
}
.list-item-info { display: flex; flex-direction: column; }
.list-item-name { font-size: 14px; font-weight: 500; }
.list-item-price { font-size: 13px; color: var(--text-price); }
.list-item-actions { display: flex; gap: 4px; }

.cat-subtitle {
  font-size: 13px; color: var(--accent); margin: 10px 0 4px;
  padding-left: 4px; border-left: 2px solid var(--accent);
}

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
