<template>
  <div class="menu-view" :class="'theme-' + currentTheme">
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
      <h3 class="cat-title">{{ tName(cat.name) }}</h3>
      <div class="sub-tabs">
        <button
          v-for="sub in cat.children"
          :key="sub.id"
          class="sub-tab-btn"
          :class="{ active: activeSubCategory === sub.id }"
          @click="activeSubCategory = sub.id"
        >
          <span v-if="currentTheme === 'bbq-red-gold'" class="tab-icon">🔥</span>
          {{ tName(sub.name) }}
        </button>
      </div>
    </div>

    <!-- 无分类提示 -->
    <div v-if="!sortedCategories.length" class="empty-hint">
      <p>{{ t('menuEmpty') }}</p>
    </div>

    <!-- 菜品列表 -->
    <div class="product-list" v-if="filteredItems.length">
      <template v-for="p in filteredItems" :key="p.id">
        <!-- BBQ红金：卡片式 -->
        <div v-if="currentTheme === 'bbq-red-gold'" class="item-card">
          <div v-if="p.image && p.imagePosition !== 'none'" class="card-img-wrap">
            <img :src="p.image" :alt="tName(p.name)" class="card-img" />
          </div>
          <div class="card-body">
            <div class="card-badges">
              <span v-if="p.recommended" class="badge badge-rec">{{ t('recommended') }}</span>
              <span v-if="p.soldOut" class="badge badge-sold">{{ t('soldOut') }}</span>
            </div>
            <span class="card-name">{{ tName(p.name) }}</span>
            <span class="card-price">{{ formatPrice(p.price) }}</span>
          </div>
        </div>
        <!-- 经典纯红 / 雅致私厨：点线式 -->
        <div v-else class="item-row">
          <span class="item-name">{{ tName(p.name) }}
            <span v-if="p.recommended" class="badge badge-rec">⭐</span>
            <span v-if="p.soldOut" class="badge badge-sold">{{ t('soldOut') }}</span>
          </span>
          <span class="item-dots"></span>
          <span class="item-price">{{ formatPrice(p.price) }}</span>
        </div>
      </template>
    </div>

    <div v-else class="empty-hint">
      <p>{{ activeSubCategory ? t('noProducts') : t('noMatch') }}</p>
    </div>

    <!-- 联系方式 -->
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
      <button class="bottom-btn primary" @click="showExportOptions = true">📸 {{ t('export') }}</button>
    </div>

    <!-- 导出选项弹窗 -->
    <div v-if="showExportOptions" class="modal-overlay" @click.self="showExportOptions = false">
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
        <p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">
          共 {{ pageCount }} 页，将导出 {{ pageCount }} 张图片
        </p>
        <div class="modal-actions">
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
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useMenuData } from '../composables/useMenuData'
import { useTheme } from '../composables/useTheme'

const { t, tName } = useI18n()
const { getMenuData } = useMenuData()
const { currentTheme, getTheme } = useTheme()

const searchQuery = ref('')
const activeSubCategory = ref('')
const showShare = ref(false)
const showExportOptions = ref(false)
const exporting = ref(false)
const qrContainer = ref(null)
const selectedResIdx = ref(0)
const customW = ref(1080)
const customH = ref(1920)

const resolutions = [
  { label: '手机版', w: 1080, h: 1920 },
  { label: '海报版', w: 1456, h: 2048 },
  { label: '高清版', w: 3174, h: 4490 },
  { label: '自定义', w: 0, h: 0, custom: true }
]

const PAGE_H = 2048
const PAGE_W = 1456
const PAGE_PAD = 80
const ROW_H = 58
const SUB_H = 70
const CAT_H = 80
const HEADER_H = 160

const data = computed(() => getMenuData() || { categories: [], shopName: {} })
const shopName = computed(() => data.value.shopName || { zh: '菜单' })
const contacts = computed(() => data.value.contacts || { wechat: '', whatsapp: '', telegram: '' })
const hasContacts = computed(() => contacts.value.wechat || contacts.value.whatsapp || contacts.value.telegram)

const sortedCategories = computed(() => {
  return (data.value.categories || []).slice().sort((a, b) => (a.sort || 0) - (b.sort || 0))
})

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

const pageCount = computed(() => {
  let pages = 0
  const bgH = PAGE_H - PAGE_PAD * 2
  let curH = 0
  for (const cat of sortedCategories.value) {
    for (const sub of (cat.children || [])) {
      const itemCount = (sub.items || []).length
      const rows = Math.ceil(itemCount / 2)
      const needH = CAT_H + SUB_H + rows * ROW_H
      if (curH + needH > bgH && curH > 0) { pages++; curH = 0 }
      curH += needH
    }
  }
  if (curH > 0) pages++
  return Math.max(pages, 1)
})

function formatPrice(price) {
  if (price === 0) return '时价'
  return '֏ ' + price.toLocaleString()
}

// ========== 海报导出 ==========
function buildPage(pageIdx, pageData) {
  const theme = getTheme()
  const page = document.createElement('div')
  page.style.cssText = `width:${PAGE_W}px;height:${PAGE_H}px;position:relative;overflow:hidden;font-family:${theme.fonts.body}`

  // 背景图
  const bg = document.createElement('img')
  bg.src = theme.bgImage
  bg.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:cover`
  page.appendChild(bg)

  // 内容区
  const content = document.createElement('div')
  content.style.cssText = `position:relative;z-index:1;padding:${PAGE_PAD}px;height:100%;display:flex;flex-direction:column`
  page.appendChild(content)

  // 店名
  const title = document.createElement('div')
  title.style.cssText = `text-align:center;font-size:52px;font-weight:bold;color:${theme.css['--accent']};font-family:${theme.fonts.title};margin-bottom:8px`
  title.textContent = tName(data.value.shopName)
  content.appendChild(title)

  // 页眉线
  const hr = document.createElement('div')
  hr.style.cssText = `border-bottom:2px solid ${theme.css['--border']};margin-bottom:20px`
  content.appendChild(hr)

  // 渲染分类
  const inner = document.createElement('div')
  inner.style.cssText = 'flex:1;overflow:hidden'

  for (let di = 0; di < pageData.length; di++) {
    const { cat, sub, items } = pageData[di]

    // 一级分类
    const catEl = document.createElement('div')
    catEl.style.cssText = `text-align:center;font-size:36px;font-weight:bold;color:${theme.css['--accent']};font-family:${theme.fonts.title};padding:8px 0;margin-top:${di > 0 ? '20px' : '0'}`
    catEl.innerHTML = `━━━━━━ &nbsp;${tName(cat.name)}&nbsp; ━━━━━━`
    inner.appendChild(catEl)

    // 二级分类
    const subEl = document.createElement('div')
    subEl.style.cssText = `text-align:center;font-size:28px;color:${theme.css['--text-primary']};padding:6px 12px;margin:6px auto;background:${theme.css['--tab-bg']};border:1px solid ${theme.css['--accent']};display:inline-block;width:auto`
    subEl.textContent = tName(sub.name)
    const subWrap = document.createElement('div')
    subWrap.style.cssText = 'text-align:center'
    subWrap.appendChild(subEl)
    inner.appendChild(subWrap)

    // 双栏菜品表格
    const cols = [[], []]
    items.forEach((item, i) => cols[i % 2].push(item))

    const grid = document.createElement('div')
    grid.style.cssText = 'display:flex;gap:40px;margin-top:8px'
    cols.forEach(col => {
      const colDiv = document.createElement('div')
      colDiv.style.cssText = 'flex:1'
      col.forEach(item => {
        const row = document.createElement('div')
        row.style.cssText = `display:flex;align-items:baseline;padding:4px 0;border-bottom:1px dotted ${theme.css['--border']}`
        const nameSpan = document.createElement('span')
        nameSpan.style.cssText = `flex:1;font-size:22px;color:${theme.css['--text-primary']}`
        nameSpan.textContent = (item.recommended ? '⭐' : '') + tName(item.name)
        const dotsSpan = document.createElement('span')
        dotsSpan.style.cssText = `flex:1;border-bottom:1px dotted ${theme.css['--border']};margin:0 4px`
        const priceSpan = document.createElement('span')
        priceSpan.style.cssText = `font-size:22px;font-weight:bold;color:${theme.css['--text-price']};white-space:nowrap`
        priceSpan.textContent = item.price === 0 ? '时价' : '֏ ' + item.price.toLocaleString()
        row.appendChild(nameSpan)
        row.appendChild(dotsSpan)
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
  const bgH = PAGE_H - PAGE_PAD * 2
  let curH = 0

  for (const cat of sortedCategories.value) {
    for (const sub of (cat.children || [])) {
      const items = sub.items || []
      if (!items.length) continue
      const rows = Math.ceil(items.length / 2)
      const needH = CAT_H + SUB_H + rows * ROW_H

      if (curH + needH > bgH && curPage.length > 0) {
        pages.push(curPage)
        curPage = []
        curH = 0
      }
      curPage.push({ cat, sub, items })
      curH += needH
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
  for (let i = 0; i < pages.length; i++) {
    const pageEl = buildPage(i, pages[i])
    document.body.appendChild(pageEl)
    await nextTick()
    const res = resolutions[selectedResIdx.value]
    const w = res?.custom ? (customW.value || 1456) : (res?.w || 1456)
    const h = res?.custom ? (customH.value || 2048) : (res?.h || 2048)
    const scale = Math.max(w / PAGE_W, h / PAGE_H)
    const canvas = await html2canvas(pageEl, { scale, useCORS: true, allowTaint: true, backgroundColor: null })
    document.body.removeChild(pageEl)
    const link = document.createElement('a')
    link.download = '菜单_' + tName(shopName.value) + '_p' + (i + 1) + '.png'
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

function init() {
  const d = getMenuData()
  const cats = (d?.categories || []).sort((a, b) => (a.sort || 0) - (b.sort || 0))
  if (cats.length) {
    const subs = cats[0].children || []
    if (subs.length) activeSubCategory.value = subs[0].id
  }
}

onMounted(init)

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
/* ===== 店铺头部 ===== */
.shop-header {
  text-align: center;
  padding: 20px 12px 10px;
}
.shop-name {
  font-family: var(--title-font);
  font-size: 24px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 4px;
}

/* ===== 搜索 ===== */
.search-bar {
  display: flex; align-items: center; gap: 6px;
  margin: 8px 12px; padding: 8px 12px;
  background: var(--bg-secondary); border-radius: 8px;
  border: 1px solid var(--border);
}
.search-icon { font-size: 14px; }
.search-input {
  flex: 1; background: none; border: none; outline: none;
  font-size: 13px; color: var(--text-primary); font-family: var(--body-font);
}
.search-input::placeholder { color: var(--text-secondary); }

/* ===== 一级分类标题 ===== */
.category-section { margin-bottom: 4px; }
.cat-title {
  text-align: center;
  font-family: var(--title-font);
  font-size: 17px;
  color: var(--accent);
  margin: 18px 12px 4px;
  padding: 6px 0;
  letter-spacing: 4px;
}
.theme-bbq-red-gold .cat-title {
  font-size: 18px;
}
.theme-classic-red .cat-title::before,
.theme-classic-red .cat-title::after {
  content: ' ━━━━ ';
  color: var(--border);
}
.theme-bbq-red-gold .cat-title {
  border: 1px solid var(--accent);
  border-left: none; border-right: none;
  padding: 8px 0;
}

/* ===== 二级分类Tab ===== */
.sub-tabs {
  display: flex; flex-wrap: wrap; gap: 6px;
  padding: 8px 12px;
  justify-content: center;
}
.sub-tab-btn {
  padding: 5px 12px; font-size: 12px; border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--tab-bg);
  color: var(--text-secondary);
  cursor: pointer; transition: all 0.2s;
  white-space: nowrap;
  font-family: var(--body-font);
}
.sub-tab-btn.active,
.sub-tab-btn:hover {
  background: var(--tab-active);
  color: #fff;
  border-color: var(--tab-active);
}
.tab-icon { margin-right: 2px; }

/* 经典纯红：牌匾式二级Tab */
.theme-classic-red .sub-tab-btn {
  background: #B12A2D;
  border: 1px solid #D9B96D;
  color: #FFF8EA;
}
.theme-classic-red .sub-tab-btn.active {
  background: #D9B96D;
  color: #8B1E23;
}

/* ===== 菜品列表 - 双列 ===== */
.product-list {
  padding: 0 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
}

/* BBQ红金：卡片式 */
.item-card {
  background: var(--bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--card-border-color);
  overflow: hidden;
}
.card-img-wrap { width: 100%; }
.card-img { width: 100%; height: 80px; object-fit: cover; display: block; }
.card-body { padding: 6px 8px; }
.card-badges { display: flex; gap: 4px; margin-bottom: 2px; }
.card-name { font-size: 13px; font-weight: 600; color: var(--text-primary); display: block; }
.card-price { font-size: 15px; font-weight: 700; color: var(--text-price); display: block; margin-top: 2px; }

/* 经典纯红 / 雅致私厨：点线式 */
.item-row {
  display: flex;
  align-items: baseline;
  padding: 5px 0;
  border-bottom: 1px dotted var(--border);
}
.item-name { font-size: 13px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-dots { flex: 1; min-width: 8px; }
.item-price { font-size: 14px; font-weight: 700; color: var(--text-price); white-space: nowrap; }

/* 雅致私厨特殊处理 */
.theme-private-kitchen .item-row {
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.theme-private-kitchen .item-name { font-size: 14px; }
.theme-private-kitchen .item-price { font-size: 15px; }

/* ===== 徽章 ===== */
.badge { font-size: 10px; padding: 1px 6px; border-radius: 3px; margin-left: 2px; }
.badge-rec { background: var(--badge-rec); color: #2B1600; }
.badge-sold { background: var(--badge-sold); color: #fff; }

/* ===== 空态 ===== */
.empty-hint { text-align: center; padding: 30px 16px; color: var(--text-secondary); font-size: 13px; }

/* ===== 底部栏 ===== */
.bottom-bar {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px;
  display: flex; gap: 8px; padding: 8px 12px;
  background: var(--bg-secondary); border-top: 1px solid var(--border);
}
.bottom-btn {
  flex: 1; padding: 10px; font-size: 14px; border-radius: 8px;
  border: 1px solid var(--accent); background: var(--tab-bg);
  color: var(--text-primary); cursor: pointer; font-weight: 600;
  font-family: var(--body-font);
}
.bottom-btn.primary { background: var(--accent); color: #2B1600; border-color: var(--accent); }

/* 经典纯红按钮 */
.theme-classic-red .bottom-btn {
  background: #B3282C;
  border: 1px solid #D4AF37;
  color: #FFF4D6;
}

/* ===== 联系方式 ===== */
.contact-section {
  padding: 16px 12px; text-align: center;
  margin-bottom: 70px;
}
.contact-section h3 { font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; }
.qr-codes { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
.qr-placeholder { text-align: center; }
.qr-placeholder p { font-size: 11px; color: var(--text-secondary); }
.qr-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; }

/* ===== 弹窗 ===== */
.share-qrcode { display: flex; justify-content: center; padding: 12px; }
.share-qrcode canvas { border-radius: 8px; }
.resolution-presets { display: flex; flex-wrap: wrap; gap: 6px; }
</style>
