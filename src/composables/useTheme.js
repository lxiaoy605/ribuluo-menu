import { ref } from 'vue'
import { useMenuData } from './useMenuData'

const themes = [
  {
    id: 'pure-red',
    name: { zh: '经典纯红', am: 'Կարմիր', en: 'Classic Red', ru: 'Классический красный' },
    css: {
      '--bg-primary': '#cc0000',
      '--bg-secondary': '#b80000',
      '--bg-card': '#aa0000',
      '--text-primary': '#ffffff',
      '--text-secondary': '#ffcccc',
      '--text-price': '#ffff00',
      '--accent': '#ffcc00',
      '--accent-light': '#ffe066',
      '--border': '#ffffff',
      '--tab-bg': '#990000',
      '--tab-active': '#ffcc00',
      '--shadow': '0 2px 12px rgba(0,0,0,0.3)',
      '--badge-rec': '#ffcc00',
      '--badge-sold': '#666',
      '--overlay': 'rgba(0,0,0,0.85)',
      '--input-bg': '#990000',
      '--input-border': '#ffffff',
      '--danger': '#ff4444',
      '--success': '#00cc66',
      '--bg-texture': 'none',
      '--card-border-color': '#ffffff'
    }
  },
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

const currentTheme = ref('pure-red')

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
    const themeId = data?.theme || 'pure-red'
    applyTheme(themeId)
  }

  const themeOptions = themes

  return { currentTheme, applyTheme, initTheme, themeOptions }
}
