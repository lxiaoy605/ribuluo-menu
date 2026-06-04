<template>
  <div class="menu-view" :class="'theme-' + currentTheme">
    <!-- 搜索 -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input v-model="searchQuery" :placeholder="t('search')" class="search-input" />
    </div>

    <!-- 滑动容器：每个一级分类一页 -->
    <div
      class="swipe-container"
      ref="swipeContainer"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div class="swipe-track" :style="{ transform: `translateX(-${activeCatIdx * 100}%)` }">
        <div
          class="swipe-page"
          v-for="(cat, idx) in sortedCategories"
          :key="cat.id"
          :class="{ 'swipe-page-active': idx === activeCatIdx }"
        >
          <!-- 二级分类横向滚动 -->
          <div class="sub-tabs-scroll" ref="subTabsContainer">
            <button
              v-for="sub in cat.children"
              :key="sub.id"
              class="sub-tab-btn"
              :class="{ active: activeSubId === sub.id }"
              @click="switchSub(sub.id, cat.id)"
            >
              {{ tName(sub.name) }}
            </button>
          </div>

          <!-- 菜品列表 -->
          <div class="product-list" ref="productListContainer">
            <div v-if="getCatItems(cat, idx).length" class="product-inner">
              <div
                v-for="p in getCatItems(cat, idx)"
                :key="p.id"
                class="item-row"
              >
                <img v-if="p.image" :src="p.image" class="item-thumb" />
                <div class="item-info">
                  <span class="item-name" @click="copyName(p)">{{ tName(p.name) }}</span>
                  <span v-if="p.recommended" class="badge badge-rec">{{ t('recommended') }}</span>
                  <span v-if="p.soldOut" class="badge badge-sold">{{ t('soldOut') }}</span>
                </div>
                <span class="item-price">{{ formatPrice(p.price) }}</span>
              </div>
            </div>
            <div v-else class="empty-hint">
              <p>{{ t('noProducts') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部固定一级分类导航 -->
    <div class="bottom-nav">
      <button
        v-for="(cat, idx) in sortedCategories"
        :key="cat.id"
        class="nav-btn"
        :class="{ active: idx === activeCatIdx }"
        @click="switchCat(idx)"
      >
        <span class="nav-icon">{{ catIcons[idx] || '📋' }}</span>
        <span class="nav-label">{{ tName(cat.name) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useMenuData } from '../composables/useMenuData'
import { useTheme } from '../composables/useTheme'

const { t, tName } = useI18n()
const { getMenuData } = useMenuData()
const { currentTheme, getTheme } = useTheme()

const searchQuery = ref('')
const activeCatIdx = ref(0)
const activeSubId = ref('')
const swipeContainer = ref(null)
const subTabsContainer = ref(null)

const catIcons = ['🔥', '🍳', '🍲', '🍺', '🥤', '🍰', '🍜', '🥗']

const data = computed(() => getMenuData() || { categories: [], shopName: {} })

const sortedCategories = computed(() => {
  return (data.value.categories || []).slice().sort((a, b) => (a.sort || 0) - (b.sort || 0))
})

function getCatItems(cat, catIdx) {
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    let all = []
    for (const sub of (cat.children || [])) {
      const filtered = (sub.items || []).filter(p =>
        tName(p.name).toLowerCase().includes(q) ||
        p.price.toString().includes(q)
      )
      all = all.concat(filtered)
    }
    return all
  }
  const sub = (cat.children || []).find(s => s.id === activeSubId.value)
  return sub ? (sub.items || []) : []
}

function formatPrice(price) {
  if (price === 0) return '时价'
  return '֏ ' + price.toLocaleString()
}

function copyName(p) {
  const name = tName(p.name)
  navigator.clipboard.writeText(name).then(() => {
    // 静默复制，无需提示
  }).catch(() => {})
}

function switchCat(idx) {
  if (idx === activeCatIdx.value) return
  activeCatIdx.value = idx
  const cat = sortedCategories.value[idx]
  if (cat?.children?.length) {
    activeSubId.value = cat.children[0].id
  }
  searchQuery.value = ''
}

function switchSub(subId, catId) {
  activeSubId.value = subId
  const idx = sortedCategories.value.findIndex(c => c.id === catId)
  if (idx >= 0 && idx !== activeCatIdx.value) {
    activeCatIdx.value = idx
  }
}

// ========== 触摸滑动 ==========
let touchStartX = 0
let touchStartY = 0
let touchMoved = false

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  touchMoved = false
}

function onTouchMove(e) {
  if (!touchMoved) {
    const dx = Math.abs(e.touches[0].clientX - touchStartX)
    const dy = Math.abs(e.touches[0].clientY - touchStartY)
    if (dx > dy && dx > 10) touchMoved = true
  }
  if (touchMoved) e.preventDefault()
}

function onTouchEnd(e) {
  if (!touchMoved) return
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) > 60) {
    if (dx < 0 && activeCatIdx.value < sortedCategories.value.length - 1) {
      switchCat(activeCatIdx.value + 1)
    } else if (dx > 0 && activeCatIdx.value > 0) {
      switchCat(activeCatIdx.value - 1)
    }
  }
}

watch(sortedCategories, (cats) => {
  if (cats.length && cats[0].children?.length && !activeSubId.value) {
    activeSubId.value = cats[0].children[0].id
  }
}, { immediate: true })
</script>

<style scoped>
/* ===== 搜索 ===== */
.search-bar {
  display: flex; align-items: center; gap: 6px;
  margin: 10px 12px 6px; padding: 8px 12px;
  background: var(--bg-secondary); border-radius: 20px;
  border: 1px solid var(--border);
}
.search-icon { font-size: 14px; flex-shrink: 0; }
.search-input {
  flex: 1; background: none; border: none; outline: none;
  font-size: 13px; color: var(--text-primary); font-family: var(--body-font);
}
.search-input::placeholder { color: var(--text-secondary); }

/* ===== 滑动容器 ===== */
.swipe-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  margin-bottom: 70px;
}
.swipe-track {
  display: flex;
  transition: transform 0.3s ease;
  will-change: transform;
}
.swipe-page {
  min-width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
}

/* ===== 二级分类横向滚动 ===== */
.sub-tabs-scroll {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
}
.sub-tabs-scroll::-webkit-scrollbar { display: none; }

.sub-tab-btn {
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--tab-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: var(--body-font);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.sub-tab-btn:active { transform: scale(0.96); border-radius: 16px; }
.sub-tab-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

/* ===== 菜品列表 ===== */
.product-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 12px;
  -webkit-overflow-scrolling: touch;
}
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  gap: 8px;
}
.item-thumb {
  width: 160px;
  height: 100px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.item-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.item-name {
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  user-select: text;
  -webkit-user-select: text;
}
.item-name:active { color: var(--accent); }
.item-price {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-price);
  white-space: nowrap;
  flex-shrink: 0;
}

/* 徽章 */
.badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
}
.badge-rec { background: var(--badge-rec); color: var(--badge-text, #2B1600); }
.badge-sold { background: var(--badge-sold); color: #fff; }

/* 空态 */
.empty-hint {
  text-align: center;
  padding: 40px 16px;
  color: var(--text-secondary);
  font-size: 13px;
}

/* ===== 底部固定一级导航 ===== */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: flex;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  z-index: 100;
}
.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--body-font);
  gap: 2px;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.nav-btn:active { transform: scale(0.95); }
.nav-btn.active {
  color: var(--accent);
  background: rgba(212, 175, 55, 0.1);
}
.nav-icon { font-size: 20px; }
.nav-label { font-size: 14px; font-weight: 600; }
</style>
