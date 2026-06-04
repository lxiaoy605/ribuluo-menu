import { ref } from 'vue'
import { useMenuData } from './useMenuData'

// 字体加载
const FONT_CDN = {
  'Noto Serif SC': 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap',
  'Noto Sans SC': 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap',
  'Ma Shan Zheng': 'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap',
  'Alimama DongFangDaKai': null // 需要自托管，暂用备用字体
}

const themes = [
  // ========== 红金烧烤（默认） ==========
  {
    id: 'bbq-red-gold',
    name: { zh: '红金烧烤', am: 'Կարմիր-Ոսկե', en: 'BBQ Red & Gold', ru: 'Красно-золотой' },
    bgImage: '/themes/bbq-red-gold/bg.jpg',
    fonts: {
      title: '"Ma Shan Zheng", "STKaiti", "KaiTi", "楷体", cursive',
      body: '"Noto Sans SC", "思源黑体", "Source Han Sans SC", sans-serif'
    },
    css: {
      '--bg-primary': '#3A1612',
      '--bg-secondary': '#4A1D18',
      '--bg-card': '#4A1D18',
      '--text-primary': '#FFF4E2',
      '--text-secondary': '#D9C8B2',
      '--text-price': '#FFCC33',
      '--accent': '#D4AF37',
      '--accent-light': '#F7D66B',
      '--border': 'rgba(212,175,55,0.35)',
      '--tab-bg': '#3A1612',
      '--tab-active': '#D4AF37',
      '--shadow': '0 2px 12px rgba(0,0,0,0.3)',
      '--badge-rec': '#D4AF37',
      '--badge-text': '#2B1600',
      '--badge-sold': '#6A6A6A',
      '--overlay': 'rgba(0,0,0,0.85)',
      '--input-bg': '#4A1D18',
      '--input-border': 'rgba(212,175,55,0.35)',
      '--danger': '#c0392b',
      '--success': '#27ae60',
      '--bg-texture': 'none',
      '--card-border-color': 'rgba(212,175,55,0.4)',
      '--title-font': '"Ma Shan Zheng", "STKaiti", "KaiTi", "楷体", cursive',
      '--body-font': '"Noto Sans SC", "思源黑体", "Source Han Sans SC", sans-serif'
    }
  },
  // ========== 经典纯红 ==========
  {
    id: 'classic-red',
    name: { zh: '经典纯红', am: 'Կարմիր', en: 'Classic Red', ru: 'Классический красный' },
    bgImage: '/themes/classic-red/bg.jpg',
    fonts: {
      title: '"Ma Shan Zheng", "STKaiti", "KaiTi", "楷体", cursive',
      body: '"Noto Sans SC", "思源黑体", "Source Han Sans SC", "PingFang SC", sans-serif'
    },
    css: {
      '--bg-primary': '#8B1E23',
      '--bg-secondary': '#A5262A',
      '--bg-card': 'transparent',
      '--text-primary': '#FFF8EA',
      '--text-secondary': '#E8D8C5',
      '--text-price': '#FFD447',
      '--accent': '#F5D58B',
      '--accent-light': '#FFE6A7',
      '--border': 'rgba(245,213,139,0.4)',
      '--tab-bg': '#B12A2D',
      '--tab-active': '#F5D58B',
      '--shadow': 'none',
      '--badge-rec': '#F5D58B',
      '--badge-text': '#8B1E23',
      '--badge-sold': '#888',
      '--overlay': 'rgba(0,0,0,0.85)',
      '--input-bg': '#B12A2D',
      '--input-border': '#D4AF37',
      '--danger': '#e74c3c',
      '--success': '#27ae60',
      '--bg-texture': 'none',
      '--card-border-color': 'transparent',
      '--title-font': '"Ma Shan Zheng", "STKaiti", "KaiTi", "楷体", cursive',
      '--body-font': '"Noto Sans SC", "思源黑体", "Source Han Sans SC", sans-serif'
    }
  },
  // ========== 雅致私厨 ==========
  {
    id: 'private-kitchen',
    name: { zh: '雅致私厨', am: 'Էլեգանտ', en: 'Private Kitchen', ru: 'Элегантная кухня' },
    bgImage: '/themes/private-kitchen/bg.jpg',
    fonts: {
      title: '"Ma Shan Zheng", "STKaiti", "KaiTi", "楷体", cursive',
      body: '"Noto Sans SC", "思源黑体", "PingFang SC", sans-serif'
    },
    css: {
      '--bg-primary': '#F6F1E8',
      '--bg-secondary': '#EFE7DA',
      '--bg-card': 'transparent',
      '--text-primary': '#2F2A24',
      '--text-secondary': '#8B7355',
      '--text-price': '#A85A32',
      '--accent': '#7D2F2F',
      '--accent-light': '#A0523D',
      '--border': 'rgba(125,47,47,0.2)',
      '--tab-bg': '#EFE7DA',
      '--tab-active': '#7D2F2F',
      '--shadow': 'none',
      '--badge-rec': '#7D2F2F',
      '--badge-text': '#fff',
      '--badge-sold': '#aaa',
      '--overlay': 'rgba(0,0,0,0.5)',
      '--input-bg': '#fff',
      '--input-border': '#d0c5b5',
      '--danger': '#c0392b',
      '--success': '#27ae60',
      '--bg-texture': 'none',
      '--card-border-color': 'transparent',
      '--title-font': '"Ma Shan Zheng", "STKaiti", "KaiTi", cursive',
      '--body-font': '"Noto Sans SC", "思源黑体", sans-serif'
    }
  }
]

const currentTheme = ref('bbq-red-gold')

export function useTheme() {
  const { getMenuData, setMenuData } = useMenuData()

  function loadFont(fontFamily) {
    const key = Object.keys(FONT_CDN).find(k => fontFamily.includes(k))
    if (!key || !FONT_CDN[key]) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONT_CDN[key]
    document.head.appendChild(link)
  }

  function applyTheme(themeId) {
    const theme = themes.find(t => t.id === themeId) || themes[0]
    currentTheme.value = themeId
    const root = document.documentElement

    // CSS 变量
    Object.entries(theme.css).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // 背景图
    root.style.setProperty('--bg-image', `url('${theme.bgImage}')`)

    // 字体
    if (theme.fonts) {
      loadFont(theme.fonts.title)
      loadFont(theme.fonts.body)
    }

    // 页面背景使用纯色（背景图仅用于海报导出）
    document.body.style.backgroundImage = 'none'
    document.body.style.backgroundSize = ''
    document.body.style.backgroundAttachment = ''
    document.body.style.backgroundPosition = ''

    const data = getMenuData()
    if (data) {
      data.theme = themeId
      setMenuData(data)
    }
  }

  function initTheme() {
    let data = getMenuData()
    // 缓存为空时先从 localStorage 同步读取，避免页面闪烁默认主题
    if (!data) {
      try {
        const raw = localStorage.getItem('ribuluo_menu_data')
        if (raw) data = JSON.parse(raw)
      } catch(e) { /* ignore */ }
    }
    const themeId = data?.theme || 'bbq-red-gold'
    applyTheme(themeId)
  }

  function getTheme() {
    return themes.find(t => t.id === currentTheme.value) || themes[0]
  }

  const themeOptions = themes

  return { currentTheme, applyTheme, initTheme, getTheme, themeOptions }
}
