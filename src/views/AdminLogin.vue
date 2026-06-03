<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">{{ t('login') }}</h2>

      <div class="form-group">
        <label class="form-label">用户名</label>
        <input v-model="username" type="text" class="form-input" placeholder="请输入用户名" @keyup.enter="handleLogin" />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('password') }}</label>
        <input v-model="password" type="password" class="form-input" @keyup.enter="handleLogin" />
      </div>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

      <button class="btn btn-primary btn-block" @click="handleLogin" :disabled="!username || !password">
        {{ t('enter') }}
      </button>


    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useMenuData } from '../composables/useMenuData'

const router = useRouter()
const { t } = useI18n()
const { getMenuData, verifyPassword } = useMenuData()

const username = ref('')
const password = ref('')
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''

  if (username.value.trim() !== 'admin') {
    errorMsg.value = '用户名错误'
    return
  }

  const d = getMenuData()
  if (!d?.passwordHash) {
    errorMsg.value = '系统未初始化'
    return
  }

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
.login-title { font-size: 22px; text-align: center; margin-bottom: 24px; }
.error-text { color: var(--danger); font-size: 13px; margin-bottom: 12px; text-align: center; }
</style>
