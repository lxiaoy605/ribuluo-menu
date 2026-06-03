import { ref, watchEffect } from 'vue'
import { useMenuData } from './useMenuData'

const themes = [
  {
    id: 'dark-gold',
    name: { zh: '暗金烧烤', am: 'Ոսկե', en: 'Gold Grill', ru: 'Золотой гриль' },
    css: {
      '--bg-primary': '#1a1a1a',
      '--bg-secondary': '#222222',
      '--bg-card': '#2a2a2a',
      '--text-primary': '#f0e6d3',
      '--text-secondary': '#b8a88a',
      '--text-price': '#e8b44a',
      '--accent': '#c8963e',
      '--accent-light': '#e8c97a',
      '--border': '#3a3028',
      '--tab-bg': '#2a2a2a',
      '--tab-active': '#c8963e',
      '--shadow': '0 2px 12px rgba(0,0,0,0.4)',
      '--badge-rec': '#c8963e',
      '--badge-sold': '#666',
      '--overlay': 'rgba(0,0,0,0.85)',
      '--input-bg': '#333',
      '--input-border': '#555',
      '--danger': '#c0392b',
      '--success': '#27ae60'
    }
  },
  {
    id: 'light-elegant',
    name: { zh: '雅致私厨', am: 'Էլեգանտ', en: 'Elegant Kitchen', ru: 'Элегантная кухня' },
    css: {
      '--bg-primary': '#fdfaf5',
      '--bg-secondary': '#f5f0e8',
      '--bg-card': '#ffffff',
      '--text-primary': '#3d3226',
      '--text-secondary': '#8b7355',
      '--text-price': '#c8963e',
      '--accent': '#b8860b',
      '--accent-light': '#d4a745',
      '--border': '#e0d5c7',
      '--tab-bg': '#f5f0e8',
      '--tab-active': '#b8860b',
      '--shadow': '0 2px 16px rgba(0,0,0,0.06)',
      '--badge-rec': '#b8860b',
      '--badge-sold': '#aaa',
      '--overlay': 'rgba(0,0,0,0.6)',
      '--input-bg': '#fff',
      '--input-border': '#d0c5b5',
      '--danger': '#c0392b',
      '--success': '#27ae60'
    }
  },
  {
    id: 'chinese-ink',
    name: { zh: '墨韵中国', am: 'Չինական', en: 'Ink & Brush', ru: 'Китайская тушь' },
    css: {
      '--bg-primary': '#f5f0eb',
      '--bg-secondary': '#ede6dc',
      '--bg-card': '#faf7f2',
      '--text-primary': '#2c1810',
      '--text-secondary': '#8b5e3c',
      '--text-price': '#c0392b',
      '--accent': '#8b1a1a',
      '--accent-light': '#bc3a3a',
      '--border': '#d4c5b2',
      '--tab-bg': '#ede6dc',
      '--tab-active': '#8b1a1a',
      '--shadow': '0 2px 12px rgba(0,0,0,0.08)',
      '--badge-rec': '#c0392b',
      '--badge-sold': '#999',
      '--overlay': 'rgba(0,0,0,0.7)',
      '--input-bg': '#fff',
      '--input-border': '#c4b5a2',
      '--danger': '#8b1a1a',
      '--success': '#5a8a4a'
    }
  }
]

const currentTheme = ref('dark-gold')

export function useTheme() {
  const { getMenuData, setMenuData } = useMenuData()

  function applyTheme(themeId) {
    const theme = themes.find(t => t.id === themeId) || themes[0]
    currentTheme.value = themeId
    const root = document.documentElement
    Object.entries(theme.css).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    const data = getMenuData()
    if (data) {
      data.theme = themeId
      setMenuData(data)
    }
  }

  function initTheme() {
    const data = getMenuData()
    const themeId = data?.theme || 'dark-gold'
    applyTheme(themeId)
  }

  const themeOptions = themes

  return { currentTheme, applyTheme, initTheme, themeOptions }
}
