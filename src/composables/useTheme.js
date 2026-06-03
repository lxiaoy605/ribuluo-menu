import { ref } from 'vue'
import { useMenuData } from './useMenuData'

const themes = [
  {
    id: 'red-gold',
    name: { zh: '红金烧烤', am: 'Կարմիր-Ոսկե', en: 'Red & Gold Grill', ru: 'Красно-золотой гриль' },
    css: {
      '--bg-primary': '#1a0000',
      '--bg-secondary': '#2a1010',
      '--bg-card': '#1f1110',
      '--text-primary': '#f0e0c0',
      '--text-secondary': '#b89070',
      '--text-price': '#e8b44a',
      '--accent': '#c41e3a',
      '--accent-light': '#e84040',
      '--border': '#4a2820',
      '--tab-bg': '#2a1010',
      '--tab-active': '#c41e3a',
      '--shadow': '0 2px 16px rgba(0,0,0,0.5)',
      '--badge-rec': '#c41e3a',
      '--badge-sold': '#555',
      '--overlay': 'rgba(0,0,0,0.9)',
      '--input-bg': '#2a1010',
      '--input-border': '#4a2820',
      '--danger': '#c0392b',
      '--success': '#27ae60',
      '--bg-texture': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 40 40\'%3E%3Crect width=\'40\' height=\'40\' fill=\'none\'/%3E%3Cpath d=\'M0 20h40M20 0v40\' stroke=\'%23c41e3a\' stroke-width=\'0.3\' opacity=\'0.06\'/%3E%3Cpath d=\'M0 0l40 40M40 0L0 40\' stroke=\'%23e8b44a\' stroke-width=\'0.2\' opacity=\'0.04\'/%3E%3C/svg%3E")',
      '--card-border-color': '#8b6914'
    }
  },
  {
    id: 'red-black',
    name: { zh: '红与黑', am: 'Կարմիր-Սև', en: 'Red & Black', ru: 'Красно-черный' },
    css: {
      '--bg-primary': '#0d0d0d',
      '--bg-secondary': '#1a0d0d',
      '--bg-card': '#150a0a',
      '--text-primary': '#e0d0c0',
      '--text-secondary': '#a07060',
      '--text-price': '#ff4444',
      '--accent': '#cc1111',
      '--accent-light': '#ff3333',
      '--border': '#330a0a',
      '--tab-bg': '#1a0d0d',
      '--tab-active': '#cc1111',
      '--shadow': '0 2px 16px rgba(255,0,0,0.15)',
      '--badge-rec': '#cc1111',
      '--badge-sold': '#444',
      '--overlay': 'rgba(0,0,0,0.92)',
      '--input-bg': '#1a0d0d',
      '--input-border': '#330a0a',
      '--danger': '#ff2222',
      '--success': '#27ae60',
      '--bg-texture': 'none',
      '--card-border-color': '#660000'
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
      '--text-price': '#b8860b',
      '--accent': '#b8860b',
      '--accent-light': '#d4a745',
      '--border': '#e0d5c7',
      '--tab-bg': '#f5f0e8',
      '--tab-active': '#b8860b',
      '--shadow': '0 2px 16px rgba(0,0,0,0.06)',
      '--badge-rec': '#b8860b',
      '--badge-sold': '#aaa',
      '--overlay': 'rgba(0,0,0,0.5)',
      '--input-bg': '#fff',
      '--input-border': '#d0c5b5',
      '--danger': '#c0392b',
      '--success': '#27ae60',
      '--bg-texture': 'none',
      '--card-border-color': '#e0d5c7'
    }
  }
]

const currentTheme = ref('red-gold')

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
    const themeId = data?.theme || 'red-gold'
    applyTheme(themeId)
  }

  const themeOptions = themes

  return { currentTheme, applyTheme, initTheme, themeOptions }
}
