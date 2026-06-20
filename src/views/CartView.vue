<template>
  <div class="cart-view">
    <!-- 页签切换 -->
    <div class="cart-tabs">
      <button
        class="cart-tab-btn"
        :class="{ active: activeTab === 'current' }"
        @click="activeTab = 'current'"
      >{{ t('currentOrder') }}</button>
      <button
        class="cart-tab-btn"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'; loadHistory()"
      >{{ t('orderHistory') }}</button>
    </div>

    <!-- ========== 当前预订 ========== -->
    <div v-if="activeTab === 'current'" class="tab-content">
      <!-- 空状态 -->
      <div v-if="!hasItems() && !editingOrderId" class="empty-state">
        <p class="empty-text">{{ t('noOrder') }}</p>
      </div>

      <template v-else>
        <!-- 菜品明细表 -->
        <div class="order-items">
          <div class="oi-header">
            <span class="oi-col-name">{{ t('name') }}</span>
            <span class="oi-col-qty">{{ t('qty') }}</span>
            <span class="oi-col-price">{{ t('unitPrice') }}</span>
            <span class="oi-col-sub">{{ t('subtotal') }}</span>
          </div>
          <div v-for="item in cartItems" :key="item.id" class="oi-row">
            <span class="oi-col-name">{{ fmtName(item.name) }}</span>
            <span class="oi-col-qty">
              <span class="qty-ctrl-sm">
                <button class="qty-btn-sm" @click="removeItem(item.id)">−</button>
                <span class="qty-val-sm">{{ item.qty }}</span>
                <button class="qty-btn-sm" @click="addItem({id:item.id, name:item.name, price:item.price})">+</button>
              </span>
            </span>
            <span class="oi-col-price">֏ {{ item.price.toLocaleString() }}</span>
            <span class="oi-col-sub">֏ {{ (item.price * item.qty).toLocaleString() }}</span>
          </div>
          <div class="oi-total">
            <span>{{ t('totalAmount') }}</span>
            <span class="oi-total-amount">֏ {{ totalAmount.toLocaleString() }}</span>
          </div>
        </div>

        <!-- 预订表单 -->
        <div class="order-form">
          <!-- 称呼（整行，选填） -->
          <div class="form-group">
            <label class="form-label">{{ t('customerName') }}</label>
            <input
              class="form-input"
              :value="cartForm.customerName"
              @input="updateForm({ customerName: $event.target.value })"
              :placeholder="t('customerName')"
            />
          </div>

          <!-- 人数 + 预订时间 -->
          <div class="form-row">
            <div class="form-group form-half">
              <label class="form-label">{{ t('guestCount') }} <span class="required-star">*</span></label>
              <input
                class="form-input"
                type="number"
                :value="cartForm.guestCount"
                @input="updateForm({ guestCount: Math.max(1, Math.min(99, parseInt($event.target.value) || 1)) })"
                min="1" max="99"
              />
            </div>
            <div class="form-group form-half">
              <label class="form-label">{{ t('expectedTime') }} <span class="required-star">*</span></label>
              <input
                class="form-input"
                type="datetime-local"
                :value="cartForm.expectedTime"
                @input="updateForm({ expectedTime: $event.target.value })"
                :min="nowISO()"
                required
              />
            </div>
          </div>

          <!-- 联系方式 + 号码（同一行） -->
          <div class="form-row">
            <div class="form-group form-half">
              <label class="form-label">{{ t('contactType') }}</label>
              <select
                class="form-input form-select"
                :value="cartForm.contactType"
                @change="updateForm({ contactType: $event.target.value })"
              >
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="wechat">WeChat</option>
              </select>
            </div>
            <div class="form-group form-half">
              <label class="form-label">{{ t('contactInfo') }} <span class="required-star">*</span></label>
              <input
                class="form-input"
                :value="cartForm.contactInfo"
                @input="updateForm({ contactInfo: $event.target.value })"
                :placeholder="t('contactInfo')"
              />
            </div>
          </div>

          <!-- 预订方式 -->
          <div class="form-group">
            <label class="form-label">{{ t('orderMode') }}</label>
            <div class="radio-row">
              <label class="radio-item" @click="updateForm({ orderMode: 'dine_in' })">
                <input type="radio" :checked="cartForm.orderMode === 'dine_in'" /> {{ t('dineIn') }}
              </label>
              <label class="radio-item" @click="updateForm({ orderMode: 'delivery' })">
                <input type="radio" :checked="cartForm.orderMode === 'delivery'" /> {{ t('delivery') }}
              </label>
            </div>
          </div>

          <!-- 配送地址（仅配送模式） -->
          <div v-if="cartForm.orderMode === 'delivery'" class="form-group">
            <label class="form-label">{{ t('deliveryAddress') }} <span class="required-star">*</span></label>
            <input
              class="form-input"
              :value="cartForm.deliveryAddress"
              @input="updateForm({ deliveryAddress: $event.target.value })"
              :placeholder="t('deliveryAddress')"
              maxlength="150"
            />
          </div>

          <!-- 备注 -->
          <div class="form-group">
            <label class="form-label">{{ t('notes') }}</label>
            <textarea
              class="form-input form-textarea"
              :value="cartForm.notes"
              @input="updateForm({ notes: $event.target.value })"
              :placeholder="t('notes')"
              rows="2"
            ></textarea>
          </div>
        </div>

        <!-- 错误提示 -->
        <p v-if="submitError" class="submit-error">{{ submitError }}</p>

        <!-- 底部按钮 -->
        <div class="cart-actions">
          <button class="btn btn-outline" @click="$router.push('/')">{{ t('orderDishes') }}</button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="submitting">
            {{ submitting ? '...' : t('submitOrder') }}
          </button>
          <button class="btn btn-danger" @click="handleClear">{{ t('clearOrder') }}</button>
        </div>
      </template>
    </div>

    <!-- ========== 历史预订 ========== -->
    <div v-if="activeTab === 'history'" class="tab-content">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="searchQuery" :placeholder="t('searchOrder')" class="search-input" />
      </div>

      <div v-if="historyLoading" class="empty-state"><p>...</p></div>
      <div v-else-if="historyError" class="empty-state"><p>{{ historyError }}</p></div>
      <div v-else-if="!filteredHistory.length" class="empty-state"><p>{{ t('noHistory') }}</p></div>

      <div v-else class="history-list">
        <div v-for="order in filteredHistory" :key="order.id" class="history-card">
          <!-- 摘要行 -->
          <div class="history-summary" @click="toggleExpand(order.id)">
            <span class="hs-id">{{ order.id }}</span>
            <span class="hs-badge" :class="order.order_mode === 'delivery' ? 'badge-delivery' : 'badge-dinein'">
              {{ order.order_mode === 'delivery' ? t('delivery') : t('dineIn') }}
            </span>
            <span class="hs-time">{{ fmtTime(order.created_at) }}</span>
            <span class="hs-amount">֏ {{ (order.total_amount || 0).toLocaleString() }}</span>
            <span class="hs-expand">
              <button class="btn btn-sm btn-outline">{{ expandedIds.has(order.id) ? t('collapse') : t('expand') }}</button>
            </span>
            <span class="hs-modify">
              <button
                v-if="order.status === 'pending'"
                class="btn btn-sm btn-outline"
                @click.stop="handleModify(order)"
              >{{ t('modify') }}</button>
            </span>
          </div>

          <!-- 展开详情 -->
          <div v-if="expandedIds.has(order.id)" class="history-detail">
            <div class="hd-order-id" @click="copyText(order.id)">{{ order.id }} <span class="hd-copy-hint">📋</span></div>
            <table class="detail-table">
              <thead>
                <tr><th>{{ t('name') }}</th><th>{{ t('qty') }}</th><th>{{ t('unitPrice') }}</th><th>{{ t('subtotal') }}</th></tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in (order.items || [])" :key="i">
                  <td>{{ fmtName(item.name) }}</td>
                  <td>{{ item.qty }}</td>
                  <td>֏ {{ (item.price || 0).toLocaleString() }}</td>
                  <td>֏ {{ ((item.price || 0) * (item.qty || 0)).toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
            <div class="detail-info">
              <div class="di-row">
                <span>{{ t('orderMode') }}: {{ order.order_mode === 'delivery' ? t('delivery') : t('dineIn') }}</span>
                <span>{{ t('guestCount') }}: {{ order.guest_count || 1 }}</span>
              </div>
              <div class="di-row">
                <span>{{ t('customerName') }}: {{ order.customer_name || '-' }}</span>
                <span>{{ t('contactInfo') }}: {{ order.contact_info || '-' }}</span>
              </div>
              <div class="di-row" v-if="order.expected_time">
                <span>{{ t('expectedTime') }}: {{ fmtTime(order.expected_time) }}</span>
                <span>{{ t('notes') }}: {{ order.notes || '-' }}</span>
              </div>
              <div class="di-row" v-if="order.notes && !order.expected_time">
                <span>{{ t('notes') }}: {{ order.notes }}</span>
              </div>
              <div class="di-row" v-if="order.delivery_address">
                <span>{{ t('deliveryAddress') }}: {{ order.delivery_address }}
                  <button class="btn-copy-inline" @click="copyText(order.delivery_address)">📋</button>
                </span>
              </div>
              <div class="di-row" v-if="order.order_mode === 'delivery' && order.delivery_fee">
                <span>🚚 配送费：֏ {{ order.delivery_fee.toLocaleString() }}</span>
              </div>
              <div class="di-row di-status">
                <span :class="order.status === 'completed' ? 'status-done' : 'status-pending'">
                  {{ order.status === 'completed' ? t('completed') : t('pending') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示弹窗：当前预订非空时阻止修改 -->
    <div v-if="showConflictModal" class="modal-overlay" @click.self="showConflictModal = false">
      <div class="modal-content">
        <h3 class="modal-title">⚠️</h3>
        <p style="color:var(--text-secondary);margin-bottom:16px;text-align:center">{{ t('cartNotEmpty') }}</p>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="showConflictModal = false">{{ t('confirm') }}</button>
        </div>
      </div>
    </div>

    <!-- 提交成功弹窗 -->
    <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccess">
      <div class="modal-content">
        <h3 class="modal-title" style="color:var(--success);text-align:center">✓ {{ t('orderSubmitted') }}</h3>
        <div class="success-order-id" @click="copyOrderId">{{ submittedOrderId }}</div>
        <p v-if="copyMsg" class="copy-msg">{{ copyMsg }}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="copyOrderId">{{ t('copyOrderId') }}</button>
          <button class="btn btn-primary" @click="closeSuccess">{{ t('confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useCart } from '../composables/useCart'
import { useOrders } from '../composables/useOrders'
import { useTelegramNotify } from '../composables/useTelegramNotify'

const router = useRouter()
const { t, tName } = useI18n()
const { cartItems, totalAmount, cartForm, itemCount, editingOrderId, telegramMessageId, oldOrderItems, hasItems, clearCart, updateForm, loadOrder, addItem, removeItem, addOrderId, getOrderIds } = useCart()
const { submitOrder, updateOrderById, patchTelegramMessageId, getOrdersByIds, genOrderId } = useOrders()
const { notifyNewOrder, notifyCustomerUpdate } = useTelegramNotify()

const activeTab = ref('current')
const submitError = ref('')
const submitting = ref(false)

// 提交成功
const showSuccessModal = ref(false)
const submittedOrderId = ref('')
const copyMsg = ref('')

// 修改冲突弹窗
const showConflictModal = ref(false)
const pendingModifyOrder = ref(null)

// 历史订单
const historyOrders = ref([])
const historyLoading = ref(false)
const historyError = ref('')
const searchQuery = ref('')
const expandedIds = ref(new Set())

const filteredHistory = computed(() => {
  if (!searchQuery.value.trim()) return historyOrders.value
  const q = searchQuery.value.trim().toLowerCase()
  return historyOrders.value.filter(o => o.id.toLowerCase().includes(q))
})

// 处理提交
async function handleSubmit() {
  submitError.value = ''

  // 校验
  if (!hasItems() && !editingOrderId.value) {
    submitError.value = t('noOrder')
    return
  }
  const form = cartForm.value
  if (!form.guestCount || form.guestCount < 1) {
    submitError.value = '请填写人数'
    return
  }
  if (!form.expectedTime || !form.expectedTime.trim()) {
    submitError.value = '请选择预订时间'
    return
  }
  if (!form.contactType) {
    submitError.value = '请选择联系方式'
    return
  }
  if (!form.contactInfo || !form.contactInfo.trim()) {
    submitError.value = '请填写号码'
    return
  }
  if (form.orderMode === 'delivery' && !form.deliveryAddress.trim()) {
    submitError.value = '请填写配送地址'
    return
  }

  submitting.value = true
  try {
    const orderData = {
      items: cartItems.value.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      guestCount: form.guestCount || 1,
      totalAmount: totalAmount.value,
      customerName: form.customerName || null,
      contactType: form.contactType || 'phone',
      contactInfo: form.contactInfo || null,
      notes: form.notes || null,
      expectedTime: form.expectedTime || null,
      orderMode: form.orderMode || 'dine_in',
      deliveryAddress: form.deliveryAddress || null,
      deviceId: null, // will be filled by submitOrder or from cart
      status: 'pending'
    }

    // 读取 deviceId
    try {
      const raw = localStorage.getItem('ribuluo_cart')
      if (raw) {
        const cart = JSON.parse(raw)
        orderData.deviceId = cart.deviceId || null
      }
    } catch (e) { /* ignore */ }

    if (editingOrderId.value) {
      // 修改模式：更新已有订单
      const oldItems = oldOrderItems.value
      const msgId = telegramMessageId.value
      await updateOrderById(editingOrderId.value, orderData)
      submittedOrderId.value = editingOrderId.value
      showSuccessModal.value = true
      notifyCustomerUpdate({ ...orderData, id: editingOrderId.value, telegram_message_id: msgId, oldItems })
      clearCart()
    } else {
      // 新建模式
      orderData.id = genOrderId()
      const result = await submitOrder(orderData)
      submittedOrderId.value = result.id
      addOrderId(result.id)
      clearCart()
      showSuccessModal.value = true
      notifyNewOrder(orderData).then(msgId => { if (msgId) patchTelegramMessageId(result.id, msgId) })
    }
  } catch (e) {
    submitError.value = '提交失败，请重试'
  } finally {
    submitting.value = false
  }
}

function handleClear() {
  clearCart()
}

function copyOrderId() {
  navigator.clipboard.writeText(submittedOrderId.value).then(() => {
    copyMsg.value = t('copied')
    setTimeout(() => copyMsg.value = '', 2000)
  }).catch(() => {})
}

async function closeSuccess() {
  showSuccessModal.value = false
  submittedOrderId.value = ''
  copyMsg.value = ''
  await nextTick()
  activeTab.value = 'history'
  loadHistory()
  // 滚回顶部确保页签可见
  const el = document.querySelector('.cart-view')
  if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' })
  window.scrollTo({ top: 0, behavior: 'instant' })
}

// 修改历史订单
function handleModify(order) {
  if (hasItems() || editingOrderId.value) {
    pendingModifyOrder.value = order
    showConflictModal.value = true
    return
  }
  loadOrder({
    id: order.id,
    items: order.items || [],
    order_mode: order.order_mode,
    delivery_address: order.delivery_address,
    guest_count: order.guest_count,
    customer_name: order.customer_name,
    contact_type: order.contact_type,
    contact_info: order.contact_info,
    notes: order.notes,
    expected_time: order.expected_time,
    telegram_message_id: order.telegram_message_id
  })
  activeTab.value = 'current'
}

// 加载历史
async function loadHistory() {
  const ids = getOrderIds()
  if (!ids.length) {
    historyOrders.value = []
    return
  }
  historyLoading.value = true
  historyError.value = ''
  try {
    historyOrders.value = await getOrdersByIds(ids)
  } catch (e) {
    historyError.value = '加载失败，请重试'
  } finally {
    historyLoading.value = false
  }
}

function toggleExpand(orderId) {
  const s = new Set(expandedIds.value)
  if (s.has(orderId)) s.delete(orderId)
  else s.add(orderId)
  expandedIds.value = s
}

function fmtName(nameObj) {
  const name = tName(nameObj) || '-'
  return name.length > 20 ? name.slice(0, 20) + '…' : name
}

function fmtTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return mm + '/' + dd + ' ' + hh + ':' + mi
}

function copyText(text) {
  navigator.clipboard.writeText(text).catch(() => {})
}

function nowISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

onMounted(() => {
  if (editingOrderId.value || hasItems()) {
    activeTab.value = 'current'
  }
})
</script>

<style scoped>
.cart-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* ===== 页签 ===== */
.cart-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
}
.cart-tab-btn {
  flex: 1;
  padding: 12px;
  font-size: 15px;
  border: none;
  background: var(--tab-bg);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--body-font);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.cart-tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

/* ===== 空状态 ===== */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 20px;
}
.empty-text {
  color: var(--text-secondary);
  font-size: 15px;
}

/* ===== 菜品明细表 ===== */
.order-items {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 12px;
}
.oi-header {
  display: flex;
  font-size: 11px;
  color: var(--text-secondary);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}
.oi-row {
  display: flex;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}
.oi-row:last-child { border-bottom: none; }
.oi-col-name { flex: 2; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oi-col-qty { flex: 1; display: flex; justify-content: center; }
.oi-col-price { flex: 1; text-align: center; color: var(--text-secondary); }
.oi-col-sub { flex: 1; text-align: right; color: var(--text-price); font-weight: 600; }
.oi-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  font-size: 14px;
  font-weight: 600;
}
.oi-total-amount { color: var(--text-price); font-size: 16px; }

/* 小号数量控件 */
.qty-ctrl-sm { display: inline-flex; align-items: center; gap: 2px; }
.qty-btn-sm {
  width: 22px; height: 22px; border: 1px solid var(--border);
  background: var(--tab-bg); color: var(--text-primary);
  font-size: 13px; line-height: 1; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0; border-radius: 4px;
  font-family: var(--body-font);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.qty-btn-sm:active { transform: scale(0.9); }
.qty-val-sm { min-width: 20px; text-align: center; }

/* ===== 预订表单 ===== */
.order-form {
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
}
.form-group { margin-bottom: 12px; }
.form-group:last-child { margin-bottom: 0; }
.form-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.required-star {
  color: var(--danger);
}
.form-input, .form-select {
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  outline: none;
  font-family: var(--body-font);
}
.form-input::placeholder, .form-select::placeholder {
  color: var(--text-secondary);
  opacity: 0.55;
}
.form-input:focus, .form-select:focus { border-color: var(--accent); }
.form-textarea { resize: vertical; min-height: 48px; }
.form-row { display: flex; gap: 10px; }
.form-half { flex: 1; }

.radio-row {
  display: flex;
  gap: 16px;
}
.radio-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
}

.submit-error {
  color: var(--danger);
  font-size: 13px;
  margin-bottom: 8px;
  text-align: center;
}

/* ===== 底部按钮 ===== */
.cart-actions {
  display: flex;
  gap: 8px;
  padding: 8px 0 20px;
}
.cart-actions .btn { flex: 1; }

/* ===== 历史订单 ===== */
.search-bar {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 10px; padding: 8px 12px;
  background: var(--bg-secondary); border-radius: 20px;
  border: 1px solid var(--border);
  flex-shrink: 0;
}
.search-icon { font-size: 14px; flex-shrink: 0; }
.search-input {
  flex: 1; background: none; border: none; outline: none;
  font-size: 13px; color: var(--text-primary); font-family: var(--body-font);
}
.search-input::placeholder { color: var(--text-secondary); }

.history-list {
  flex: 1;
  overflow-y: auto;
}

.history-card {
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-bottom: 8px;
  overflow: hidden;
}

.history-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  cursor: pointer;
}
.hs-id {
  flex: 1.4;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  font-family: monospace;
  white-space: nowrap;
}
.hs-badge {
  flex: 0 0 auto;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
}
.badge-dinein { background: var(--accent); color: var(--badge-text, #2B1600); }
.badge-delivery { background: var(--danger); color: #fff; }
.hs-time {
  flex: 1.3;
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
}
.hs-amount {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-price);
  text-align: right;
  white-space: nowrap;
}
.hs-expand {
  flex: 0.7;
  display: flex;
  justify-content: center;
}
.hs-modify {
  flex: 0.7;
  display: flex;
  justify-content: center;
}

/* 展开详情 */
.history-detail {
  padding: 0 12px 12px;
  border-top: 1px solid var(--border);
}
.hd-order-id {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 0 4px;
  font-size: 14px; font-weight: 700; font-family: monospace;
  color: var(--accent); cursor: pointer; user-select: text;
}
.hd-copy-hint { font-size: 13px; }
.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
  font-size: 12px;
}
.detail-table th, .detail-table td {
  padding: 4px 6px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.detail-table th {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 11px;
}
.detail-info {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
}
.di-row {
  display: flex;
  gap: 12px;
}
.di-row span { flex: 1; }
.di-status { margin-top: 4px; }
.status-pending { color: var(--accent); }
.status-done { color: var(--success); }

.btn-copy-inline { background: none; border: none; cursor: pointer; font-size: 13px; padding: 0 2px; }


/* 成功弹窗 */
.success-order-id {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  font-family: monospace;
  color: var(--accent);
  padding: 12px;
  margin: 12px 0;
  background: var(--bg-primary);
  border-radius: 8px;
  cursor: pointer;
  letter-spacing: 2px;
  user-select: text;
  -webkit-user-select: text;
}
.copy-msg {
  text-align: center;
  color: var(--success);
  font-size: 13px;
  margin-bottom: 8px;
}

/* 通用样式 */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  padding: 10px 16px; border: none; border-radius: 8px; font-size: 14px;
  cursor: pointer; transition: all 0.2s; font-family: var(--body-font);
  outline: none; -webkit-tap-highlight-color: transparent;
}
.btn:active { transform: scale(0.96); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--accent); color: var(--badge-text, #2B1600); }
.btn-danger { background: var(--danger); color: #fff; }
.btn-sm { padding: 4px 10px; font-size: 11px; }
.btn-outline { background: transparent; border: 1px solid var(--accent); color: var(--accent); }

.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: var(--overlay);
  display: flex; align-items: flex-end; justify-content: center;
}
.modal-content {
  background: var(--bg-secondary); width: 100%; max-width: 480px;
  border-radius: 16px 16px 0 0; padding: 20px;
}
.modal-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.modal-actions { display: flex; gap: 10px; margin-top: 20px; }
.modal-actions .btn { flex: 1; }
</style>
