<template>
  <div class="menu-view">
    <div class="bg-texture"></div>
    <!-- 店铺名称 -->
    <div class="shop-header">
      <h1 class="shop-name">{{ tName(shopName) }}</h1>
    </div>

    <!-- 搜索 -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input v-model="searchQuery" :placeholder="t('search')" class="search-input" />
    </div>

    <!-- 三级导航 -->
    <div class="category-section" v-for="cat in sortedCategories" :key="cat.id">
      <h3 class="group-title">{{ tName(cat.name) }}</h3>
      <div class="category-tabs">
        <button
          v-for="sub in cat.children"
          :key="sub.id"
          class="tab-btn"
          :class="{ active: activeSubCategory === sub.id }"
          @click="activeSubCategory = sub.id"
        >{{ tName(sub.name) }}</button>
      </div>
    </div>

    <!-- 无分类提示 -->
    <div v-if="!sortedCategories.length" class="empty-hint">
      <p>{{ t('menuEmpty') }}</p>
    </div>

    <!-- 菜品列表 - 双列网格 -->
    <div class="product-list" v-if="filteredItems.length">
      <div class="product-card" v-for="p in filteredItems" :key="p.id">
        <!-- 背景图模式 -->
        <template v-if="p.image && p.imagePosition === 'background'">
          <div class="card-bg" :style="{ backgroundImage: 'url(' + p.image + ')' }">
            <div class="card-bg-overlay">
              <div class="product-badges">
                <span v-if="p.recommended" class="badge badge-rec">⭐</span>
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
                <span v-if="p.recommended" class="badge badge-rec">⭐</span>
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
                <span v-if="p.recommended" class="badge badge-rec">⭐</span>
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
            <span v-if="p.recommended" class="badge badge-rec">⭐</span>
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
      <p>{{ activeSubCategory ? t('noProducts') : t('noMatch') }}</p>
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

    <!-- 底部操作区 -->
    <div class="bottom-bar">
      <button class="bottom-btn" @click="showShare = true">📤 {{ t('share') }}</button>
      <button class="bottom-btn primary" @click="showExport = true">📸 {{ t('export') }}</button>
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
            <button v-for="(r, idx) in resolutions" :key="r.label" class="btn btn-sm"
              :class="{ 'btn-primary': selectedResIdx === idx, 'btn-outline': selectedResIdx !== idx }"
              @click="selectedResIdx = idx">{{ r.label }} ({{ r.w }}×{{ r.h }})</button>
          </div>
        </div>
        <div v-if="resolutions[selectedResIdx].custom" class="form-group">
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

const { t, tName } = useI18n()
const { getMenuData } = useMenuData()

const searchQuery = ref('')
const activeSubCategory = ref('')
const showShare = ref(false)
const showExport = ref(false)
const exporting = ref(false)
const qrContainer = ref(null)
const selectedResIdx = ref(2) // 默认高清版
const customW = ref(3174)
const customH = ref(4490)

const resolutions = [
  { label: '手机版', w: 1080, h: 1920 },
  { label: '海报版', w: 2480, h: 3508 },
  { label: '高清版', w: 3174, h: 4490 },
  { label: '自定义', w: 0, h: 0, custom: true }
]

const data = computed(() => getMenuData() || { categories: [], shopName: {} })
const shopName = computed(() => data.value.shopName || { zh: '菜单' })
const contacts = computed(() => data.value.contacts || { wechat: '', whatsapp: '', telegram: '' })
const hasContacts = computed(() => contacts.value.wechat || contacts.value.whatsapp || contacts.value.telegram)

const sortedCategories = computed(() => {
  return (data.value.categories || []).slice().sort((a, b) => (a.sort || 0) - (b.sort || 0))
})

// 当前选中二级分类下的所有菜品
const filteredItems = computed(() => {
  let items = []
  for (const cat of sortedCategories.value) {
    for (const sub of (cat.children || [])) {
      if (sub.id === activeSubCategory.value) {
        items = sub.items || []
      }
    }
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    items = items.filter(p =>
      tName(p.name).toLowerCase().includes(q) ||
      p.price.toString().includes(q)
    )
  }
  return items
})

function formatPrice(price) {
  if (price === 0) return '时价'
  return '֏ ' + price.toLocaleString()
}

async function doExport() {
  exporting.value = true
  showExport.value = false
  await nextTick()
  try {
    const { default: html2canvas } = await import('html2canvas')
    const res = resolutions[selectedResIdx.value]
    const w = res?.custom ? (customW.value || 3174) : (res?.w || 3174)
    const h = res?.custom ? (customH.value || 4490) : (res?.h || 4490)
    // 构建海报 DOM
    const poster = buildPoster()
    document.body.appendChild(poster)
    const scale = Math.max(w / poster.offsetWidth, h / poster.offsetHeight)
    const canvas = await html2canvas(poster, { scale, useCORS: true, backgroundColor: '#cc0000' })
    document.body.removeChild(poster)
    const link = document.createElement('a')
    link.download = '菜单_' + tName(shopName.value) + '_' + w + 'x' + h + '.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (e) {
    console.error('导出失败', e)
  }
  exporting.value = false
}

function buildPoster() {
  const d = data.value
  const container = document.createElement('div')
  container.style.cssText = 'position:absolute;left:-9999px;top:0;width:1200px;background:#cc0000;color:#fff;padding:40px;font-family:sans-serif'
  // 店铺名
  const title = document.createElement('div')
  title.style.cssText = 'text-align:center;font-size:48px;font-weight:bold;color:#ffcc00;margin-bottom:10px;letter-spacing:4px'
  title.textContent = tName(d.shopName)
  container.appendChild(title)
  // 分隔线
  const hr = document.createElement('div')
  hr.style.cssText = 'border-bottom:2px solid #fff;margin-bottom:30px'
  container.appendChild(hr)
  // 遍历三级结构
  ;(d.categories || []).sort((a,b) => (a.sort||0)-(b.sort||0)).forEach(cat => {
    const catTitle = document.createElement('div')
    catTitle.style.cssText = 'font-size:36px;font-weight:bold;color:#ffcc00;margin:30px 0 10px;padding-bottom:6px;border-bottom:2px solid #fff;letter-spacing:3px'
    catTitle.textContent = tName(cat.name)
    container.appendChild(catTitle)
    ;(cat.children || []).sort((a,b) => (a.sort||0)-(b.sort||0)).forEach(sub => {
      const subTitle = document.createElement('div')
      subTitle.style.cssText = 'font-size:28px;font-weight:bold;color:#ffcccc;margin:20px 0 10px'
      subTitle.textContent = tName(sub.name)
      container.appendChild(subTitle)
      // 菜品表头
      const table = document.createElement('table')
      table.style.cssText = 'width:100%;border-collapse:collapse;font-size:22px'
      const thead = document.createElement('tr')
      thead.style.cssText = 'border-bottom:1px solid rgba(255,255,255,0.3)'
      const th1 = document.createElement('td')
      th1.style.cssText = 'padding:8px 4px;color:#ffcccc;width:70%'
      th1.textContent = '菜品'
      const th2 = document.createElement('td')
      th2.style.cssText = 'padding:8px 4px;color:#ffcccc;text-align:right'
      th2.textContent = '价格'
      thead.appendChild(th1)
      thead.appendChild(th2)
      table.appendChild(thead)
      ;(sub.items || []).forEach(item => {
        const row = document.createElement('tr')
        const tdName = document.createElement('td')
        tdName.style.cssText = 'padding:6px 4px;border-bottom:1px solid rgba(255,255,255,0.1)'
        let nameText = tName(item.name)
        if (item.recommended) nameText = '⭐ ' + nameText
        tdName.textContent = nameText
        const tdPrice = document.createElement('td')
        tdPrice.style.cssText = 'padding:6px 4px;text-align:right;color:#ffff00;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.1);white-space:nowrap'
        tdPrice.textContent = item.price === 0 ? '时价' : '֏ ' + item.price.toLocaleString()
        row.appendChild(tdName)
        row.appendChild(tdPrice)
        table.appendChild(row)
      })
      container.appendChild(table)
    })
  })
  return container
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href.split('#')[0]).then(() => {
    alert('链接已复制！')
  }).catch(() => {
    prompt('请手动复制链接', window.location.href.split('#')[0])
  })
}

function init() {
  const d = getMenuData()
  const cats = (d?.categories || []).sort((a, b) => (a.sort || 0) - (b.sort || 0))
  if (cats.length) {
    const subs = cats[0].children || []
    if (subs.length) activeSubCategory.value = subs[0].id
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
  padding: 16px 12px 8px;
}
.shop-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
}

.search-bar {
  display: flex; align-items: center; gap: 6px;
  margin: 8px 8px; padding: 8px 12px;
  background: var(--bg-card); border-radius: 8px;
  border: 1px solid var(--border);
}
.search-icon { font-size: 14px; }
.search-input {
  flex: 1; background: none; border: none; outline: none;
  font-size: 13px; color: var(--text-primary);
}
.search-input::placeholder { color: var(--text-secondary); }

/* Background texture overlay */
.bg-texture {
  position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background: var(--bg-texture, none);
  opacity: 0.1;
}

/* Group section styling */
.category-section { margin-bottom: 2px; }
.group-title {
  font-size: 14px; color: var(--accent); font-weight: 700;
  margin: 16px 8px 0; padding: 6px 0 2px;
  border-bottom: 2px solid var(--accent);
  letter-spacing: 2px;
}

.category-tabs {
  display: flex; flex-wrap: wrap; gap: 6px;
  padding: 8px 8px;
}
.tab-btn {
  padding: 4px 10px; font-size: 12px; border-radius: 16px;
  border: 1px solid var(--border); background: var(--tab-bg);
  color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
  white-space: nowrap;
}
.tab-btn.active, .tab-btn:hover { background: var(--tab-active); color: #fff; border-color: var(--tab-active); }

.product-list { padding: 0 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.product-card {
  background: var(--bg-card); border-radius: 8px; padding: 8px;
  border: 1px solid var(--card-border-color, var(--border)); box-shadow: var(--shadow);
  position: relative; overflow: hidden;
}

.product-badges { display: flex; gap: 4px; margin-bottom: 4px; }
.badge { font-size: 10px; padding: 1px 6px; border-radius: 3px; display: inline-block; }
.badge-rec { background: var(--badge-rec); color: #fff; }
.badge-sold { background: var(--badge-sold); color: #fff; }

.product-name { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.product-price { font-size: 15px; font-weight: 700; color: var(--text-price); }

.product-img-wrap { margin-top: 6px; }
.product-img {
  width: 100%; border-radius: 6px; object-fit: cover; max-height: 120px;
}

.product-img-left, .product-img-right { width: 60px; height: 60px; flex-shrink: 0; }

.card-layout-left { display: flex; gap: 8px; align-items: center; }
.card-layout-right { display: flex; gap: 8px; align-items: center; }

.card-bg {
  min-height: 120px; border-radius: 6px; background-size: cover;
  background-position: center; position: relative;
}
.card-bg-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: 10px; border-radius: 6px;
}
.card-bg-overlay .product-name { color: #fff; }
.card-bg-overlay .product-price { color: var(--accent-light); }

.empty-hint { text-align: center; padding: 30px 16px; color: var(--text-secondary); font-size: 13px; }

.bottom-bar {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px;
  display: flex; gap: 8px; padding: 8px 12px;
  background: var(--bg-secondary); border-top: 1px solid var(--border);
}
.bottom-btn {
  flex: 1; padding: 10px; font-size: 14px; border-radius: 8px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-primary); cursor: pointer; font-weight: 600;
}
.bottom-btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }

.contact-section {
  padding: 16px 12px; text-align: center;
  margin-bottom: 70px;
}
.contact-section h3 { font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; }
.qr-codes { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
.qr-placeholder { text-align: center; }
.qr-placeholder p { font-size: 11px; color: var(--text-secondary); }
.qr-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; }

.share-qrcode {
  display: flex; justify-content: center;
  padding: 12px;
}
.share-qrcode canvas { border-radius: 8px; }

.resolution-presets { display: flex; flex-wrap: wrap; gap: 6px; }
</style>
