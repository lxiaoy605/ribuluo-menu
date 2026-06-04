<template>
  <div class="app" :class="'theme-' + currentTheme">
    <!-- 登录页不显示顶栏 -->
    <div class="app-header" v-if="!isLogin">
      <div class="header-left" v-if="!isAdmin">
        <button v-if="isCart" class="btn-back-header" @click="goMenu">← {{ t('back') }}</button>
        <button v-else class="btn-cart-header" @click="goCart">
          🛒
          <span v-if="itemCount > 0" class="cart-badge" :class="{ 'cart-badge-pulse': itemCount > 0 }">{{ itemCount }}</span>
        </button>
      </div>
      <!-- 客户页面：店名居中 -->
      <span v-if="!isAdmin" class="header-shop-name">{{ tName(shopNameComputed) }}</span>
      <div class="header-right" :class="{ scrollable: isAdmin, 'header-right-admin': isAdmin }">
        <!-- 客户页面：语言切换 -->
        <template v-if="!isAdmin">
          <select class="lang-switch" v-model="currentLang" @change="onLangChange">
            <option v-for="l in langOptions" :key="l.code" :value="l.code">{{ l.flag }} {{ l.label }}</option>
          </select>
        </template>
        <!-- 管理页面：操作按钮 -->
        <template v-if="isAdmin">
          <select class="theme-switch" v-model="currentTheme" @change="onThemeChangeAttempt">
            <option v-for="t in themeOptions" :key="t.id" :value="t.id">{{ tName(t.name) }}</option>
          </select>
          <button class="btn-admin-link" @click="onEditShopName">✏️ {{ t('editShopName') }}</button>
          <button class="btn-admin-link" @click="showPwdModal = true">🔑 重置密码</button>
          <button class="btn-admin-link" @click="doLogout">🚪 退出</button>
        </template>
      </div>
    </div>

    <!-- 主题切换确认弹窗 -->
    <div v-if="showThemeConfirm" class="modal-overlay" @click.self="showThemeConfirm = false">
      <div class="modal-content">
        <h3 class="modal-title">{{ t('themeSwitchTitle') }}</h3>
        <p style="color:var(--text-secondary);margin-bottom:16px">{{ t('themeSwitchConfirm') }}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="cancelThemeChange">{{ t('cancel') }}</button>
          <button class="btn btn-primary" @click="confirmThemeChange">{{ t('confirm') }}</button>
        </div>
      </div>
    </div>

    <!-- 重置密码弹窗 -->
    <div v-if="showPwdModal" class="modal-overlay" @click.self="showPwdModal = false">
      <div class="modal-content">
        <h3 class="modal-title">重置密码</h3>
        <div class="form-group">
          <label class="form-label">旧密码</label>
          <input v-model="pwdForm.old" type="password" class="form-input" placeholder="输入旧密码" />
        </div>
        <div class="form-group">
          <label class="form-label">新密码</label>
          <input v-model="pwdForm.new1" type="password" class="form-input" placeholder="输入新密码" />
        </div>
        <div class="form-group">
          <label class="form-label">确认新密码</label>
          <input v-model="pwdForm.new2" type="password" class="form-input" placeholder="再次输入新密码" />
        </div>
        <p v-if="pwdError" style="color:var(--danger);font-size:13px;margin-bottom:8px">{{ pwdError }}</p>
        <p v-if="pwdSuccess" style="color:var(--success);font-size:13px;margin-bottom:8px">{{ pwdSuccess }}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="closePwdModal">{{ t('cancel') }}</button>
          <button class="btn btn-primary" @click="doResetPassword">确认重置</button>
        </div>
      </div>
    </div>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from './composables/useI18n'
import { useTheme } from './composables/useTheme'
import { useMenuData } from './composables/useMenuData'
import { useCart } from './composables/useCart'
import { defaultMenu } from './data/defaultMenu'

const route = useRoute()
const router = useRouter()
const { t, tName, currentLang, setLang, initLang, langOptions } = useI18n()
const { currentTheme, applyTheme, initTheme, themeOptions } = useTheme()
const { getMenuData, initDefaultData, verifyPassword, hashPassword, setMenuData } = useMenuData()
const { itemCount } = useCart()

const isLogin = computed(() => route.path === '/admin' || route.path === '/admin/')
const isAdmin = computed(() => route.path.startsWith('/admin'))
const isCart = computed(() => route.path === '/cart')

const showThemeConfirm = ref(false)
const pendingTheme = ref('')

// 密码重置
const showPwdModal = ref(false)
const pwdError = ref('')
const pwdSuccess = ref('')
const pwdForm = reactive({ old: '', new1: '', new2: '' })

const shopNameComputed = computed(() => {
  const d = getMenuData()
  return d?.shopName || { zh: '菜单' }
})

function onLangChange() {
  setLang(currentLang.value)
}

function onThemeChangeAttempt() {
  pendingTheme.value = currentTheme.value
  const d = getMenuData()
  const curId = d?.theme || 'bbq-red-gold'
  currentTheme.value = curId
  showThemeConfirm.value = true
}

function confirmThemeChange() {
  applyTheme(pendingTheme.value)
  showThemeConfirm.value = false
}

function cancelThemeChange() {
  showThemeConfirm.value = false
}

function onEditShopName() {
  window.dispatchEvent(new CustomEvent('open-shop-name-editor'))
}

function goCart() {
  router.push('/cart')
}

function goMenu() {
  router.push('/')
}

function doLogout() {
  sessionStorage.removeItem('ribuluo_admin_auth')
  router.replace('/admin')
}

function closePwdModal() {
  showPwdModal.value = false
  pwdError.value = ''
  pwdSuccess.value = ''
  pwdForm.old = ''
  pwdForm.new1 = ''
  pwdForm.new2 = ''
}

async function doResetPassword() {
  pwdError.value = ''
  pwdSuccess.value = ''
  if (!pwdForm.old) { pwdError.value = '请输入旧密码'; return }
  if (!pwdForm.new1 || pwdForm.new1.length < 4) { pwdError.value = '新密码至少4位'; return }
  if (pwdForm.new1 !== pwdForm.new2) { pwdError.value = '两次新密码不一致'; return }

  const d = getMenuData()
  if (!d) { pwdError.value = '数据加载失败，请刷新后重试'; return }

  const ok = await verifyPassword(pwdForm.old, d.passwordHash)
  if (!ok) { pwdError.value = '旧密码错误'; return }

  const newHash = await hashPassword(pwdForm.new1)
  d.passwordHash = newHash
  await setMenuData(d)
  pwdSuccess.value = '密码重置成功'
  setTimeout(() => closePwdModal(), 1500)
}

onMounted(async () => {
  initTheme() // 立即从 localStorage 应用主题，避免闪烁
  await initDefaultData(defaultMenu)
  initTheme() // 用服务器数据更新
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
  --badge-text: #2B1600;
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

html { background: #1a1a1a; }

body {
  font-family: var(--body-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif);
  background: #1a1a1a;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}

.app {
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
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

.header-left { flex: 1; display: flex; align-items: center; }

.btn-cart-header {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  transition: all 0.15s;
  padding: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.btn-cart-header:active {
  transform: scale(0.92);
  background: var(--border);
}

.btn-back-header {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: 8px;
  cursor: pointer;
  padding: 6px 12px;
  font-family: var(--body-font);
  white-space: nowrap;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s;
}
.btn-back-header:active {
  transform: scale(0.95);
  background: rgba(212,175,55,0.15);
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  background: var(--danger);
  color: #fff;
  border-radius: 9px;
  padding: 0 5px;
}
.cart-badge-pulse {
  animation: badge-pulse 1.5s ease-in-out infinite;
}
@keyframes badge-pulse {
  0%, 100% { background: var(--danger); box-shadow: 0 0 0 0 rgba(212,175,55,0.6); }
  50% { background: var(--accent); box-shadow: 0 0 8px 2px rgba(212,175,55,0.6); color: var(--badge-text, #2B1600); }
}

.header-shop-name {
  font-family: var(--title-font, "STKaiti", "KaiTi", "楷体", serif);
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 3px;
  text-align: center;
  flex: 0 1 auto;
  min-width: 0;
}

.header-right { flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
.header-right-admin { flex: 0 1 auto; margin-left: auto; }
.header-right.scrollable {
  overflow-x: auto;
  flex-wrap: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.header-right.scrollable::-webkit-scrollbar { display: none; }

.theme-label { font-size: 12px; color: var(--text-secondary); white-space: nowrap; }

.lang-switch, .theme-switch {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  cursor: pointer;
  font-family: var(--body-font);
  outline: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%23D4AF37'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  padding-right: 20px;
}
.lang-switch:focus, .theme-switch:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}

.btn-admin-link {
  font-size: 13px;
  color: var(--accent);
  text-decoration: none;
  padding: 4px 12px;
  border: 1px solid var(--accent);
  border-radius: 6px;
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  font-family: var(--body-font);
}
.btn-admin-link:hover { background: var(--accent); color: var(--badge-text, #2B1600); }

.app-main { flex: 1; display: flex; flex-direction: column; }

/* 通用按钮 */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  padding: 8px 16px; border: none; border-radius: 8px; font-size: 14px;
  cursor: pointer; transition: all 0.2s; font-family: var(--body-font);
  outline: none; -webkit-tap-highlight-color: transparent;
  user-select: none; -webkit-user-select: none;
}
.btn:active { transform: scale(0.96); border-radius: 8px; }
.btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 8px; }
.btn-primary { background: var(--accent); color: var(--badge-text, #2B1600); }
.btn-primary:hover { background: var(--accent-light); }
.btn-danger { background: var(--danger); color: #fff; }
.btn-sm { padding: 4px 12px; font-size: 12px; }
.btn-block { width: 100%; }
.btn-outline { background: transparent; border: 1px solid var(--accent); color: var(--accent); }

/* 通用禁止拖选（菜品名称除外） */
* {
  user-select: none; -webkit-user-select: none;
  -webkit-user-drag: none;
}
img { -webkit-user-drag: none; pointer-events: none; }
input, textarea, select {
  user-select: auto; -webkit-user-select: auto;
}

/* 通用表单 */
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; }
.form-input, .form-select {
  width: 100%; padding: 10px 12px; font-size: 14px;
  border-radius: 8px; border: 1px solid var(--input-border);
  background: var(--input-bg); color: var(--text-primary);
  outline: none; transition: border-color 0.2s;
  font-family: var(--body-font);
}
.form-input:focus, .form-select:focus { border-color: var(--accent); }
.form-input::placeholder, .form-select::placeholder { color: var(--text-secondary); opacity: 0.55; }

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
