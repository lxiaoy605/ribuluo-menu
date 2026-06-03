<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">{{ t('login') }}</h2>
      <p class="login-hint">{{ isFirstTime ? t('firstTimeSetup') : t('password') }}</p>

      <div class="form-group">
        <label class="form-label">{{ t('password') }}</label>
        <input v-model="password" type="password" class="form-input" @keyup.enter="handleLogin" />
      </div>

      <div v-if="isFirstTime" class="form-group">
        <label class="form-label">{{ t('confirmPassword') }}</label>
        <input v-model="confirmPassword" type="password" class="form-input" @keyup.enter="handleLogin" />
      </div>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success-text">{{ successMsg }}</p>

      <button class="btn btn-primary btn-block" @click="handleLogin" :disabled="!password">
        {{ isFirstTime ? t('setPassword') : t('enter') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useMenuData } from '../composables/useMenuData'

const router = useRouter()
const { t } = useI18n()
const { getMenuData, setMenuData, hashPassword, verifyPassword } = useMenuData()

const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const successMsg = ref('')

const isFirstTime = computed(() => {
  const d = getMenuData()
  return !d?.passwordHash
})

async function handleLogin() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!password.value) return

  if (isFirstTime.value) {
    if (password.value !== confirmPassword.value) {
      errorMsg.value = '两次密码不一致'
      return
    }
    const hash = await hashPassword(password.value)
    const d = getMenuData() || {}
    d.passwordHash = hash
    setMenuData(d)
    successMsg.value = t('passwordSetSuccess')
    sessionStorage.setItem('ribuluo_admin_auth', '1')
    setTimeout(() => router.push('/admin/dashboard'), 800)
    return
  }

  const d = getMenuData()
  const ok = await verifyPassword(password.value, d.passwordHash)
  if (ok) {
    sessionStorage.setItem('ribuluo_admin_auth', '1')
    router.push('/admin/dashboard')
  } else {
    errorMsg.value = t('passwordError')
  }
}
</script>

<style scoped>
.login-page {
  display: flex; align-items: center; justify-content: center;
  min-height: 80vh; padding: 20px;
}
.login-card {
  width: 100%; max-width: 360px;
  background: var(--bg-card); border-radius: 16px;
  padding: 32px 24px; border: 1px solid var(--border);
}
.login-title { font-size: 22px; text-align: center; margin-bottom: 8px; }
.login-hint { font-size: 14px; color: var(--text-secondary); text-align: center; margin-bottom: 24px; }
.error-text { color: var(--danger); font-size: 13px; margin-bottom: 12px; text-align: center; }
.success-text { color: var(--success); font-size: 13px; margin-bottom: 12px; text-align: center; }
</style>
