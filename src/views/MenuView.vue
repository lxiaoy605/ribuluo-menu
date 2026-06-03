<template>
  <div class="menu-view">
    <!-- 店铺名称 -->
    <div class="shop-header">
      <h1 class="shop-name">{{ tName(shopName) }}</h1>
      <p class="shop-desc" v-if="shopName.am">{{ tName(shopName) }}</p>
    </div>

    <!-- 搜索 -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input v-model="searchQuery" :placeholder="t('search')" class="search-input" />
    </div>

    <!-- 分类分组导航 -->
    <div class="category-section" v-for="group in groupedCategories" :key="group.nameZh">
      <h3 v-if="group.nameZh" class="group-title">{{ tName(group.name) }}</h3>
      <div class="category-tabs">
        <button
          v-for="cat in group.cats"
          :key="cat.id"
          class="tab-btn"
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >{{ tName(cat.name) }}</button>
      </div>
    </div>

    <!-- 无分类提示 -->
    <div v-if="!categories.length" class="empty-hint">
      <p>{{ t('menuEmpty') }}</p>
    </div>

    <!-- 菜品列表 -->
    <div class="product-list" v-if="filteredProducts.length">
      <div class="product-card" v-for="p in filteredProducts" :key="p.id">
        <!-- 背景图模式 -->
        <template v-if="p.image && p.imagePosition === 'background'">
          <div class="card-bg" :style="{ backgroundImage: 'url(' + p.image + ')' }">
            <div class="card-bg-overlay">
              <div class="product-badges">
                <span v-if="p.recommended" class="badge badge-rec">⭐ {{ langRec }}</span>
                <span v-if="p.soldOut" class="badge badge-sold">{{ t('soldOut') }}</span>
              </div>
              <h3 class="product-name">{{ tName(p.name) }}</h3>
              <p class="product-price">{{ formatPrice(p.price) }}</p>
            </div>
          </div>
        </template>

        <!-- 左图右文 -->
        <template v-else-if="p.image && p.imagePosition === 'left'">
          <div class="card-layout-left">
            <img :src="p.image" :alt="tName(p.name)" class="product-img product-img-left" />
            <div class="card-info">
              <div class="product-badges">
                <span v-if="p.recommended" class="badge badge-rec">⭐ {{ langRec }}</span>
                <span v-if="p.soldOut" class="badge badge-sold">{{ t('soldOut') }}</span>
              </div>
              <h3 class="product-name">{{ tName(p.name) }}</h3>
              <p class="product-price">{{ formatPrice(p.price) }}</p>
            </div>
          </div>
        </template>

        <!-- 左文右图 -->
        <template v-else-if="p.image && p.imagePosition === 'right'">
          <div class="card-layout-right">
            <div class="card-info">
              <div class="product-badges">
                <span v-if="p.recommended" class="badge badge-rec">⭐ {{ langRec }}</span>
                <span v-if="p.soldOut" class="badge badge-sold">{{ t('soldOut') }}</span>
              </div>
              <h3 class="product-name">{{ tName(p.name) }}</h3>
              <p class="product-price">{{ formatPrice(p.price) }}</p>
            </div>
            <img :src="p.image" :alt="tName(p.name)" class="product-img product-img-right" />
          </div>
        </template>

        <!-- 上图下文 / 下文上图 / 无图 -->
        <template v-else>
          <div v-if="p.image && p.imagePosition === 'top'" class="product-img-wrap">
            <img :src="p.image" :alt="tName(p.name)" class="product-img" />
          </div>
          <div class="product-badges">
            <span v-if="p.recommended" class="badge badge-rec">⭐ {{ langRec }}</span>
            <span v-if="p.soldOut" class="badge badge-sold">{{ t('soldOut') }}</span>
          </div>
          <h3 class="product-name">{{ tName(p.name) }}</h3>
          <p class="product-price">{{ formatPrice(p.price) }}</p>
          <div v-if="p.image && p.imagePosition === 'bottom'" class="product-img-wrap">
            <img :src="p.image" :alt="tName(p.name)" class="product-img" />
          </div>
        </template>
      </div>
    </div>

    <div v-else class="empty-hint">
      <p>{{ currentCategoryName ? t('noProducts') : t('noMatch') }}</p>
    </div>

    <!-- 底部操作区 -->
    <div class="bottom-bar">
      <button class="bottom-btn" @click="showShare = true">📤 {{ t('share') }}</button>
      <button class="bottom-btn primary" @click="showExport = true">📸 {{ t('export') }}</button>
    </div>

    <!-- 联系方式区域 -->
    <div class="contact-section" v-if="hasContacts">
      <h3>{{ t('contact') }}</h3>
      <div class="qr-codes">
        <div class="qr-placeholder" v-if="contacts.wechat">
          <img :src="contacts.wechat" class="qr-img" />
          <p>微信</p>
        </div>
        <div class="qr-placeholder" v-if="contacts.whatsapp">
          <img :src="contacts.whatsapp" class="qr-img" />
          <p>WhatsApp</p>
        </div>
        <div class="qr-placeholder" v-if="contacts.telegram">
          <img :src="contacts.telegram" class="qr-img" />
          <p>Telegram</p>
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

    <!-- 导出弹窗 -->
    <div v-if="showExport" class="modal-overlay" @click.self="showExport = false">
      <div class="modal-content">
        <h3 class="modal-title">{{ t('exportImage') }}</h3>
        <div class="form-group">
          <label class="form-label">{{ t('resolution') }}</label>
          <div class="resolution-presets">
            <button v-for="r in resolutions" :key="r.label" class="btn btn-sm"
              :class="{ 'btn-primary': selectedRes === r, 'btn-outline': selectedRes !== r }"
              @click="selectResolution(r)">{{ r.label }} ({{ r.w }}×{{ r.h }})</button>
          </div>
        </div>
        <div v-if="selectedRes && selectedRes.custom" class="form-group">
          <label class="form-label">宽 × 高 (px)</label>
          <div style="display:flex;gap:8px">
            <input v-model.number="customW" type="number" class="form-input" placeholder="宽度" />
            <input v-model.number="customH" type="number" class="form-input" placeholder="高度" />
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="doExport" :disabled="exporting">
            {{ exporting ? '生成中...' : t('download') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useMenuData } from '../composables/useMenuData'

const { t, tName, currentLang } = useI18n()
const { getMenuData } = useMenuData()

const searchQuery = ref('')
const activeCategory = ref('')
const showShare = ref(false)
const showExport = ref(false)
const exporting = ref(false)
const qrContainer = ref(null)
const selectedRes = ref(null)
const customW = ref(3174)
const customH = ref(4490)

const resolutions = [
  { label: '手机版', w: 1080, h: 1920 },
  { label: '海报版', w: 2480, h: 3508 },
  { label: '高清版', w: 3174, h: 4490, default: true },
  { label: '自定义', w: 0, h: 0, custom: true }
]

const data = computed(() => getMenuData() || { categories: [], products: [], shopName: {} })
const shopName = computed(() => data.value.shopName || { zh: '菜单' })
const contacts = computed(() => data.value.contacts || { wechat: '', whatsapp: '', telegram: '' })
const hasContacts = computed(() => contacts.value.wechat || contacts.value.whatsapp || contacts.value.telegram)
const categories = computed(() => (data.value.categories || []).sort((a, b) => a.sort - b.sort))

// 按 group 分组
const groupedCategories = computed(() => {
  const cats = categories.value
  const map = new Map()
  cats.forEach(c => {
    const groupNameZh = c.group?.zh || ''
    if (!map.has(groupNameZh)) map.set(groupNameZh, [])
    map.get(groupNameZh).push(c)
  })
  return Array.from(map.entries()).map(([nameZh, cats]) => ({
    nameZh,
    name: cats[0]?.group || null,
    cats
  }))
})

const activeCategoryName = computed(() => {
  const cat = categories.value.find(c => c.id === activeCategory.value)
  return cat ? tName(cat.name) : ''
})

const filteredProducts = computed(() => {
  let list = (data.value.products || []).filter(p => p.categoryId === activeCategory.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(p =>
      tName(p.name).toLowerCase().includes(q) ||
      p.price.toString().includes(q)
    )
  }
  return list
})

const langRec = computed(() => {
  const map = { zh: '招牌', am: 'Խորհուրդ', en: 'Recommended', ru: 'Рекомендуемое' }
  return map[currentLang.value] || '招牌'
})

function formatPrice(price) {
  if (price === 0) return '时价'
  return '֏ ' + price.toLocaleString()
}

function selectResolution(r) {
  selectedRes.value = r
}

async function doExport() {
  exporting.value = true
  showExport.value = false
  await nextTick()
  try {
    const { default: html2canvas } = await import('html2canvas')
    const el = document.querySelector('.menu-view')
    if (!el) { exporting.value = false; return }
    const res = selectedRes.value
    const w = res?.custom ? (customW.value || 3174) : (res?.w || 3174)
    const h = res?.custom ? (customH.value || 4490) : (res?.h || 4490)
    const scale = Math.max(w / el.offsetWidth, h / el.offsetHeight)
    const canvas = await html2canvas(el, { scale, useCORS: true, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() })
    const link = document.createElement('a')
    link.download = '菜单_' + tName(shopName.value) + '_' + w + 'x' + h + '.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (e) {
    console.error('导出失败', e)
  }
  exporting.value = false
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href.split('#')[0]).then(() => {
    alert('链接已复制！')
  }).catch(() => {
    prompt('请手动复制链接', window.location.href.split('#')[0])
  })
}

// 初始化默认分类
function init() {
  const d = getMenuData()
  if (d?.categories?.length && !activeCategory.value) {
    activeCategory.value = d.categories.sort((a, b) => a.sort - b.sort)[0].id
  }
}

onMounted(init)

// 生成分享二维码
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
</script>

<style scoped>
.shop-header {
  text-align: center;
  padding: 24px 16px 12px;
}
.shop-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
}
.shop-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.search-bar {
  display: flex; align-items: center; gap: 8px;
  margin: 12px 16px; padding: 10px 14px;
  background: var(--bg-card); border-radius: 12px;
  border: 1px solid var(--border);
}
.search-icon { font-size: 16px; }
.search-input {
  flex: 1; background: none; border: none; outline: none;
  font-size: 14px; color: var(--text-primary);
}
.search-input::placeholder { color: var(--text-secondary); }

.group-title {
  font-size: 14px; color: var(--accent);
  margin: 16px 16px 0; padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
}

.category-tabs {
  display: flex; flex-wrap: wrap; gap: 8px;
  padding: 10px 16px;
}
.tab-btn {
  padding: 6px 14px; font-size: 13px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--tab-bg);
  color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
  white-space: nowrap;
}
.tab-btn.active, .tab-btn:hover { background: var(--tab-active); color: #fff; border-color: var(--tab-active); }

.product-list { padding: 0 16px; display: flex; flex-direction: column; gap: 12px; }

.product-card {
  background: var(--bg-card); border-radius: 12px; padding: 14px;
  border: 1px solid var(--border); box-shadow: var(--shadow);
  position: relative; overflow: hidden;
}

.product-badges { display: flex; gap: 6px; margin-bottom: 6px; }
.badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; display: inline-block; }
.badge-rec { background: var(--badge-rec); color: #fff; }
.badge-sold { background: var(--badge-sold); color: #fff; }

.product-name { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.product-price { font-size: 18px; font-weight: 700; color: var(--text-price); }

.product-img-wrap { margin-top: 8px; }
.product-img {
  width: 100%; border-radius: 8px; object-fit: cover; max-height: 200px;
}

.product-img-left, .product-img-right { width: 100px; height: 100px; flex-shrink: 0; }

.card-layout-left { display: flex; gap: 12px; align-items: center; }
.card-layout-right { display: flex; gap: 12px; align-items: center; }

.card-bg {
  min-height: 160px; border-radius: 8px; background-size: cover;
  background-position: center; position: relative;
}
.card-bg-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: 14px; border-radius: 8px;
}
.card-bg-overlay .product-name { color: #fff; }
.card-bg-overlay .product-price { color: var(--accent-light); }

.empty-hint { text-align: center; padding: 40px 16px; color: var(--text-secondary); }

.bottom-bar {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px;
  display: flex; gap: 10px; padding: 12px 16px;
  background: var(--bg-secondary); border-top: 1px solid var(--border);
}
.bottom-btn {
  flex: 1; padding: 12px; font-size: 15px; border-radius: 10px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-primary); cursor: pointer; font-weight: 600;
}
.bottom-btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }

.contact-section {
  padding: 20px 16px; text-align: center;
  margin-bottom: 80px;
}
.contact-section h3 { font-size: 16px; color: var(--text-secondary); margin-bottom: 12px; }
.qr-codes { display: flex; justify-content: center; gap: 20px; }
.qr-placeholder { text-align: center; }
.qr-box {
  width: 100px; height: 100px; border: 2px dashed var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; color: var(--text-secondary);
  border-radius: 8px; margin-bottom: 6px;
}
.qr-placeholder p { font-size: 12px; color: var(--text-secondary); }
.qr-img { width: 100px; height: 100px; border-radius: 8px; object-fit: cover; }

.share-qrcode {
  display: flex; justify-content: center;
  padding: 16px;
}
.share-qrcode canvas { border-radius: 8px; }

.resolution-presets { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
