<template>
  <div class="app" :class="'theme-' + currentTheme">
    <div class="app-header">
      <div class="header-left">
        <span class="brand-icon">🔥</span>
        <span class="brand-text" v-if="isAdmin">管理后台</span>
      </div>
      <div class="header-right">
        <select class="lang-switch" v-model="currentLang" @change="onLangChange">
          <option v-for="l in langOptions" :key="l.code" :value="l.code">{{ l.flag }} {{ l.label }}</option>
        </select>
        <select v-if="isAdmin" class="theme-switch" v-model="currentTheme" @change="onThemeChange">
          <option v-for="th in themeOptions" :key="th.id" :value="th.id">{{ tName(th.name) }}</option>
        </select>
        <router-link v-if="!isAdmin" to="/admin" class="btn-admin-link">{{ t('edit') }}</router-link>
        <router-link v-if="isAdmin" to="/" class="btn-admin-link">{{ t('back') }}</router-link>
      </div>
    </div>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from './composables/useI18n'
import { useTheme } from './composables/useTheme'
import { useMenuData } from './composables/useMenuData'
import { defaultMenu } from './data/defaultMenu'

const route = useRoute()
const { t, tName, currentLang, setLang, initLang, langOptions } = useI18n()
const { currentTheme, applyTheme, initTheme, themeOptions } = useTheme()
const { initDefaultData } = useMenuData()

const isAdmin = computed(() => route.path.startsWith('/admin'))

function onLangChange() {
  setLang(currentLang.value)
}

function onThemeChange() {
  applyTheme(currentTheme.value)
}

onMounted(() => {
  initDefaultData(defaultMenu)
  initTheme()
  initLang()
})
</script>

<style>
/* ===== CSS 变量由 useTheme.js 注入 ===== */
:root {
  --bg-primary: #3A1612;
  --bg-secondary: #4A1D18;
  --bg-card: #4A1D18;
  --text-primary: #FFF4E2;
  --text-secondary: #D9C8B2;
  --text-price: #FFCC33;
  --accent: #D4AF37;
  --accent-light: #F7D66B;
  --border: rgba(212,175,55,0.35);
  --tab-bg: #3A1612;
  --tab-active: #D4AF37;
  --shadow: 0 2px 12px rgba(0,0,0,0.3);
  --badge-rec: #D4AF37;
  --badge-sold: #6A6A6A;
  --overlay: rgba(0,0,0,0.85);
  --input-bg: #4A1D18;
  --input-border: rgba(212,175,55,0.35);
  --danger: #c0392b;
  --success: #27ae60;
  --bg-texture: none;
  --card-border-color: rgba(212,175,55,0.4);
  --title-font: "Alimama DongFangDaKai", "STKaiti", "KaiTi", "楷体", serif;
  --body-font: "Noto Sans SC", "思源黑体", "Source Han Sans SC", sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--body-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif);
  background: var(--bg-primary);
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}

.app {
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(10px);
}

.header-left { display: flex; align-items: center; gap: 8px; }
.brand-icon { font-size: 22px; }
.brand-text { font-size: 14px; color: var(--text-secondary); }

.header-right { display: flex; align-items: center; gap: 8px; }

.lang-switch, .theme-switch {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  cursor: pointer;
}

.btn-admin-link {
  font-size: 13px;
  color: var(--accent);
  text-decoration: none;
  padding: 4px 12px;
  border: 1px solid var(--accent);
  border-radius: 6px;
  white-space: nowrap;
}
.btn-admin-link:hover { background: var(--accent); color: #fff; }

.app-main { padding-bottom: 80px; }

/* 通用按钮 */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  padding: 8px 16px; border: none; border-radius: 8px; font-size: 14px;
  cursor: pointer; transition: all 0.2s;
}
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-light); }
.btn-danger { background: var(--danger); color: #fff; }
.btn-sm { padding: 4px 12px; font-size: 12px; }
.btn-block { width: 100%; }
.btn-outline { background: transparent; border: 1px solid var(--accent); color: var(--accent); }

/* 通用表单 */
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; }
.form-input, .form-select {
  width: 100%; padding: 10px 12px; font-size: 14px;
  border-radius: 8px; border: 1px solid var(--input-border);
  background: var(--input-bg); color: var(--text-primary);
  outline: none; transition: border-color 0.2s;
}
.form-input:focus, .form-select:focus { border-color: var(--accent); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: var(--overlay);
  display: flex; align-items: flex-end; justify-content: center;
}
.modal-content {
  background: var(--bg-secondary); width: 100%; max-width: 480px;
  max-height: 85vh; overflow-y: auto;
  border-radius: 16px 16px 0 0; padding: 20px;
}
.modal-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.modal-actions { display: flex; gap: 10px; margin-top: 20px; }
.modal-actions .btn { flex: 1; }
</style>
