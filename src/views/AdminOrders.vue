<template>
  <div class="admin-orders">
    <div class="ao-topbar">
      <button class="btn-back" @click="$router.push('/admin/dashboard')">← {{ t('back') }}</button>
      <h2 class="ao-title">订单管理</h2>
    </div>

    <!-- 统计栏 -->
    <div class="stats-bar">
      <div class="stats-row">
        <span class="stats-label">今日</span>
        <span class="stats-group">
          <span class="stats-item">待处理 <b>{{ stats.todayPending }}</b></span>
          <span class="stats-item">已处理 <b>{{ stats.todayCompleted }}</b></span>
          <span class="stats-item">已完成金额 <b>֏ {{ fmtNum(stats.todayAmount) }}</b></span>
        </span>
      </div>
      <div class="stats-row">
        <span class="stats-label">本月</span>
        <span class="stats-group">
          <span class="stats-item">订单 <b>{{ stats.monthCount }}</b></span>
          <span class="stats-item">金额 <b>֏ {{ fmtNum(stats.monthAmount) }}</b></span>
        </span>
        <a href="#" class="stats-detail-link" @click.prevent="openStatsModal">详细统计</a>
      </div>
    </div>

    <!-- 订单内容区（搜索+列表） -->
    <div class="ao-content-block">
    <!-- 搜索区 -->
    <div class="search-area">
      <input class="si-input" v-model="search.orderId" placeholder="订单号" />
      <input class="si-input" type="date" v-model="search.dateFrom" title="下单时间从" />
      <input class="si-input" type="date" v-model="search.dateTo" title="下单时间至" />
      <input class="si-input" v-model="search.customerName" placeholder="联系人" />
      <select class="si-select" v-model="search.orderMode">
        <option value="">全部方式</option>
        <option value="dine_in">到店</option>
        <option value="delivery">配送</option>
      </select>
      <select class="si-select" v-model="search.contactType">
        <option value="">全部类型</option>
        <option value="phone">Phone</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="telegram">Telegram</option>
        <option value="wechat">WeChat</option>
      </select>
      <input class="si-input" v-model="search.contactInfo" placeholder="联系方式" />
      <button class="btn btn-sm btn-primary" @click="doSearch">搜索</button>
    </div>

    <!-- 页签 -->
    <div class="ao-tabs">
      <button class="ao-tab" :class="{ active: activeTab === 'pending' }" @click="switchTab('pending')">
        待处理 ({{ pendingTotal }})
      </button>
      <button class="ao-tab" :class="{ active: activeTab === 'completed' }" @click="switchTab('completed')">
        已完成 ({{ completedTotal }})
      </button>
    </div>

    <!-- 列表 -->
    <div class="order-list" ref="listRef">
      <div v-if="loading">加载中...</div>
      <div v-else-if="!orders.length" class="empty-hint">暂无数据</div>
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="oc-summary" @click="toggleExpand(order.id)">
          <div class="ocs-left">
            <span class="ocs-id">{{ order.id }}</span>
            <span class="ocs-badge" :class="order.order_mode === 'delivery' ? 'badge-del' : 'badge-dine'">
              {{ order.order_mode === 'delivery' ? '配送' : '到店' }}
            </span>
            <span class="ocs-time">{{ fmtTime(order.created_at) }}</span>
            <span class="ocs-amount">֏ {{ (order.total_amount || 0).toLocaleString() }}</span>
            <span v-if="order.delivery_fee" class="ocs-fee">+ 配送费 ֏ {{ order.delivery_fee.toLocaleString() }}</span>
          </div>
          <button class="btn-expand">{{ expandedIds.has(order.id) ? '收起' : '展开' }}</button>
        </div>

        <!-- 展开详情（与用户端历史预订一致） -->
        <div v-if="expandedIds.has(order.id)" class="oc-detail">
          <!-- 操作按钮放顶部 -->
          <div class="ocd-actions">
            <button v-if="order.status === 'pending'" class="btn btn-sm btn-success" @click="confirmComplete(order)">✓ 完成结算</button>
            <button v-if="order.status === 'completed'" class="btn btn-sm btn-warning" @click="confirmUndo(order)">↩ 结算撤回</button>
            <button class="btn btn-sm btn-outline" @click="openEdit(order)">✎ 编辑</button>
            <button class="btn btn-sm btn-danger" @click="confirmDelete(order)">✕ 删除</button>
          </div>

          <table class="detail-table">
            <thead><tr><th>菜品</th><th>数量</th><th>单价</th><th>小计</th></tr></thead>
            <tbody>
              <tr v-for="(item, i) in (order.items || [])" :key="i">
                <td>{{ itemName(item.name) }}</td><td>{{ item.qty }}</td>
                <td>֏ {{ (item.price || 0).toLocaleString() }}</td>
                <td>֏ {{ ((item.price || 0) * (item.qty || 0)).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>

          <div class="detail-info">
            <div class="di-row"><span>预订方式：{{ order.order_mode === 'delivery' ? '配送' : '到店' }}</span><span>人数：{{ order.guest_count || 1 }}</span></div>
            <div class="di-row"><span>顾客：{{ order.customer_name || '-' }}</span><span>联系方式：{{ order.contact_type }} / {{ order.contact_info || '-' }}</span></div>
            <div class="di-row" v-if="order.expected_time"><span>预期时间：{{ fmtTime(order.expected_time) }}</span><span>备注：{{ order.notes || '-' }}</span></div>
            <div class="di-row" v-if="!order.expected_time && order.notes"><span>备注：{{ order.notes }}</span></div>
            <div class="di-row" v-if="order.delivery_address">
              <span>配送地址：{{ order.delivery_address }}
                <button class="btn-copy-inline" @click="copyText(order.delivery_address)">📋</button>
              </span>
            </div>
            <div class="di-row" v-if="order.delivery_address" style="gap:8px">
              <a class="btn-delivery-app" :href="yandexGoUrl(order.delivery_address)" target="_blank">Yandex Go 🚕</a>
              <a class="btn-delivery-app" :href="ggUrl(order.delivery_address)" target="_blank">GG 🛵</a>
            </div>
            <div class="di-row">
              <span>配送费：֏ {{ (order.delivery_fee || 0).toLocaleString() }}</span>
              <button v-if="order.status === 'pending'" class="btn btn-sm btn-outline" @click="addDeliveryFee(order)">+ 追加配送费</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button :disabled="page <= 1" @click="page--; loadOrders()">‹</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="page++; loadOrders()">›</button>
      </div>
    </div>
    </div><!-- /ao-content-block -->

    <!-- ===== 编辑弹窗 ===== -->
    <div v-if="editOrder" class="modal-overlay" @click.self="editOrder = null">
      <div class="modal-content modal-wide">
        <h3 class="modal-title">编辑订单 {{ editOrder.id }}</h3>

        <!-- 菜品编辑 -->
        <div class="edit-items">
          <div class="ei-header">
            <span class="ei-col-wide">菜品</span><span>数量</span><span>单价</span><span>小计</span><span></span>
          </div>
          <div v-for="(item, i) in editItems" :key="i" class="ei-row">
            <span class="ei-col-wide">{{ itemName(item.name) }}</span>
            <span class="ei-col-qty">
              <button class="qbtn" @click="adjEditItem(i, -1)">−</button>
              <span class="qval">{{ item.qty }}</span>
              <button class="qbtn" @click="adjEditItem(i, 1)">+</button>
            </span>
            <span>֏ {{ (item.price || 0).toLocaleString() }}</span>
            <span>֏ {{ ((item.price || 0) * (item.qty || 0)).toLocaleString() }}</span>
            <button class="btn-del-row" @click="editItems.splice(i, 1)">✕</button>
          </div>
          <div class="ei-add-row">
            <button class="btn btn-sm btn-outline" @click="showItemPicker = !showItemPicker">+ 点菜</button>
            <div v-if="showItemPicker" class="item-picker">
              <input class="ip-search" v-model="itemPickerQ" placeholder="搜索菜品..." ref="pickerInput" />
              <div v-if="filteredMenuItems.length" class="ip-dropdown">
                <div v-for="mi in filteredMenuItems.slice(0, 10)" :key="mi.id" class="ip-item" @click="pickItem(mi)">
                  {{ mi.name }} — ֏ {{ mi.price.toLocaleString() }}
                </div>
              </div>
              <div v-else-if="itemPickerQ" class="ip-empty">无匹配菜品</div>
            </div>
          </div>
          <div class="ei-total">
            合计：<b>֏ {{ editTotal.toLocaleString() }}</b>
          </div>
        </div>

        <!-- 表单 -->
        <div class="edit-form">
          <div class="form-row">
            <label class="form-label">预订方式</label>
            <div class="radio-row">
              <label><input type="radio" v-model="editForm.orderMode" value="dine_in" /> 到店</label>
              <label><input type="radio" v-model="editForm.orderMode" value="delivery" /> 配送</label>
            </div>
          </div>
          <div v-if="editForm.orderMode === 'delivery'" class="form-row">
            <label class="form-label">配送地址</label>
            <input class="form-input" v-model="editForm.deliveryAddress" maxlength="150" />
          </div>
          <div class="form-row form-split">
            <div><label class="form-label">人数</label><input class="form-input" type="number" v-model.number="editForm.guestCount" min="1" /></div>
            <div><label class="form-label">预期时间</label><input class="form-input" type="datetime-local" v-model="editForm.expectedTime" /></div>
          </div>
          <div class="form-row form-split">
            <div><label class="form-label">顾客姓名</label><input class="form-input" v-model="editForm.customerName" /></div>
            <div><label class="form-label">联系类型</label><select class="form-input" v-model="editForm.contactType">
              <option value="phone">Phone</option><option value="whatsapp">WhatsApp</option><option value="telegram">Telegram</option><option value="wechat">WeChat</option>
            </select></div>
          </div>
          <div class="form-row">
            <label class="form-label">联系方式</label><input class="form-input" v-model="editForm.contactInfo" />
          </div>
          <div class="form-row">
            <label class="form-label">备注</label><textarea class="form-input" v-model="editForm.notes" rows="2"></textarea>
          </div>
          <div class="form-row">
            <label class="form-label">配送费 (֏)</label><input class="form-input" type="number" v-model.number="editForm.deliveryFee" min="0" />
          </div>
        </div>

        <p v-if="editError" class="submit-error">{{ editError }}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="editOrder = null">取消</button>
          <button class="btn btn-primary" @click="saveEdit" :disabled="editSaving">提交</button>
        </div>
      </div>
    </div>

    <!-- ===== 详细统计弹窗 ===== -->
    <div v-if="showStats" class="modal-overlay" @click.self="showStats = false">
      <div class="modal-content modal-wide">
        <h3 class="modal-title">订单统计明细</h3>
        <div class="stats-detail">
          <div class="stats-detail-row">
            <span>年订单：<b>{{ stats.yearCount }}</b></span>
            <span>年总金额：<b>֏ {{ fmtNum(stats.yearAmount) }}</b></span>
          </div>
          <div class="stats-detail-row">
            <span>月订单：<b>{{ stats.monthCount }}</b></span>
            <span>月金额：<b>֏ {{ fmtNum(stats.monthAmount) }}</b></span>
          </div>
        </div>
        <div class="chart-tabs">
          <button :class="{ active: chartMode === 'month' }" @click="switchChart('month')">按月统计</button>
          <button :class="{ active: chartMode === 'day' }" @click="switchChart('day')">按日统计</button>
        </div>
        <div class="chart-wrap"><canvas ref="chartCanvas"></canvas></div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showStats = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- ===== 确认弹窗 ===== -->
    <div v-if="confirmMsg" class="modal-overlay" @click.self="confirmMsg = ''">
      <div class="modal-content">
        <p style="text-align:center;margin-bottom:16px">{{ confirmMsg }}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="confirmMsg = ''">取消</button>
          <button class="btn btn-primary" @click="doConfirm">确定</button>
        </div>
      </div>
    </div>

    <!-- 提示 Toast -->
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useOrders } from '../composables/useOrders'
import { useMenuData } from '../composables/useMenuData'
import { useAlertSound } from '../composables/useAlertSound'
import { Chart, BarController, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'

Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip)

const router = useRouter()
const { t } = useI18n()
const { searchOrders, getOrderStats, getStatsByMonth, getStatsByDay, updateOrderById, deleteOrder, getPendingCount } = useOrders()
const { getMenuData } = useMenuData()
const { playAlert, activate } = useAlertSound()

// 统计
const stats = reactive({ todayPending: 0, todayCompleted: 0, todayAmount: 0, monthCount: 0, monthAmount: 0, yearCount: 0, yearAmount: 0 })
const showStats = ref(false)
const chartMode = ref('month')
const chartCanvas = ref(null)
let chartInstance = null

// 搜索
const search = reactive({ orderId: '', dateFrom: '', dateTo: '', customerName: '', orderMode: '', contactType: '', contactInfo: '' })

// 订单列表
const activeTab = ref('pending')
const orders = ref([])
const pendingTotal = ref(0)
const completedTotal = ref(0)
const loading = ref(false)
const page = ref(1)
const pageSize = 20
const totalPages = computed(() => Math.max(1, Math.ceil((activeTab.value === 'pending' ? pendingTotal.value : completedTotal.value) / pageSize)))
const expandedIds = ref(new Set())

// 编辑
const editOrder = ref(null)
const editItems = ref([])
const editForm = reactive({ orderMode: 'dine_in', deliveryAddress: '', guestCount: 1, expectedTime: '', customerName: '', contactType: 'phone', contactInfo: '', notes: '', deliveryFee: 0 })
const editError = ref('')
const editSaving = ref(false)
const showItemPicker = ref(false)
const itemPickerQ = ref('')
const pickerInput = ref(null)

// 确认
const confirmMsg = ref('')
let confirmAction = null

// Toast
const toast = ref('')

const editTotal = computed(() => editItems.value.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0))

const allMenuItems = computed(() => {
  const data = getMenuData()
  if (!data?.categories) return []
  const items = []
  for (const cat of data.categories) {
    for (const sub of (cat.children || [])) {
      for (const p of (sub.items || [])) {
        if (!p.soldOut) items.push({ id: p.id, name: p.name?.zh || p.name || '', price: p.price })
      }
    }
  }
  return items
})

const filteredMenuItems = computed(() => {
  if (!itemPickerQ.value.trim()) return []
  const q = itemPickerQ.value.trim().toLowerCase()
  return allMenuItems.value.filter(mi => mi.name.toLowerCase().includes(q))
})

// ========== 数据加载 ==========
async function loadStats() {
  try {
    const s = await getOrderStats()
    Object.assign(stats, s)
  } catch (e) { /* ignore */ }
}

async function loadOrders() {
  loading.value = true
  try {
    const result = await searchOrders({
      status: activeTab.value,
      search: {
        orderId: search.orderId || undefined,
        dateFrom: search.dateFrom || undefined,
        dateTo: search.dateTo || undefined,
        customerName: search.customerName || undefined,
        orderMode: search.orderMode || undefined,
        contactType: search.contactType || undefined,
        contactInfo: search.contactInfo || undefined
      },
      page: page.value,
      pageSize
    })
    orders.value = result.orders
    if (activeTab.value === 'pending') pendingTotal.value = result.count
    else completedTotal.value = result.count
  } catch (e) { /* ignore */ }
  finally { loading.value = false }
}

async function doSearch() {
  page.value = 1
  expandedIds.value = new Set()
  await loadOrders()
}

function switchTab(tab) {
  activeTab.value = tab
  page.value = 1
  expandedIds.value = new Set()
  loadOrders()
}

function toggleExpand(id) {
  const s = new Set(expandedIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  expandedIds.value = s
}

// ========== 操作 ==========
async function refreshCounts() {
  try {
    const s = { orderId: search.orderId || undefined, dateFrom: search.dateFrom || undefined, dateTo: search.dateTo || undefined, customerName: search.customerName || undefined, orderMode: search.orderMode || undefined, contactType: search.contactType || undefined, contactInfo: search.contactInfo || undefined }
    const [pRes, cRes] = await Promise.all([
      searchOrders({ status: 'pending', search: s, page: 1, pageSize: 1 }),
      searchOrders({ status: 'completed', search: s, page: 1, pageSize: 1 })
    ])
    pendingTotal.value = pRes.count
    completedTotal.value = cRes.count
  } catch (e) { /* ignore */ }
}

function confirmComplete(order) {
  confirmMsg.value = `确认完成结算订单 ${order.id}？完成后将进入"已完成"列表。`
  confirmAction = async () => {
    await updateOrderById(order.id, { ...order, status: 'completed', deliveryFee: order.delivery_fee || 0, orderMode: order.order_mode, deliveryAddress: order.delivery_address, guestCount: order.guest_count, customerName: order.customer_name, contactType: order.contact_type, contactInfo: order.contact_info, notes: order.notes, expectedTime: order.expected_time, items: order.items, totalAmount: order.total_amount })
    showToast('结算完成')
    await loadStats(); await loadOrders(); await refreshCounts()
  }
}

function confirmUndo(order) {
  confirmMsg.value = `确认将订单 ${order.id} 变更为预订状态？`
  confirmAction = async () => {
    await updateOrderById(order.id, { ...order, status: 'pending', deliveryFee: order.delivery_fee || 0, orderMode: order.order_mode, deliveryAddress: order.delivery_address, guestCount: order.guest_count, customerName: order.customer_name, contactType: order.contact_type, contactInfo: order.contact_info, notes: order.notes, expectedTime: order.expected_time, items: order.items, totalAmount: order.total_amount })
    showToast('已撤回')
    await loadStats(); await loadOrders(); await refreshCounts()
  }
}

function confirmDelete(order) {
  confirmMsg.value = `确认删除订单 ${order.id}？此操作不可恢复。`
  confirmAction = async () => {
    await deleteOrder(order.id)
    showToast('已删除')
    await loadStats(); await loadOrders(); await refreshCounts()
  }
}

async function doConfirm() {
  if (confirmAction) {
    try { await confirmAction() } catch (e) { showToast('操作失败') }
    confirmAction = null
  }
  confirmMsg.value = ''
}

function addDeliveryFee(order) {
  const fee = prompt('请输入配送费金额 (֏)：', order.delivery_fee || 0)
  if (fee === null) return
  const val = parseInt(fee, 10)
  if (isNaN(val) || val < 0) return
  updateOrderById(order.id, {
    ...order, deliveryFee: val, status: order.status, orderMode: order.order_mode,
    deliveryAddress: order.delivery_address, guestCount: order.guest_count,
    customerName: order.customer_name, contactType: order.contact_type,
    contactInfo: order.contact_info, notes: order.notes, expectedTime: order.expected_time,
    items: order.items, totalAmount: order.total_amount
  }).then(() => {
    showToast('配送费更新成功')
    loadOrders()
  }).catch(() => showToast('更新失败'))
}

// ========== 编辑弹窗 ==========
function openEdit(order) {
  editOrder.value = order
  editItems.value = (order.items || []).map(i => ({ ...i }))
  Object.assign(editForm, {
    orderMode: order.order_mode || 'dine_in',
    deliveryAddress: order.delivery_address || '',
    guestCount: order.guest_count || 1,
    expectedTime: order.expected_time || '',
    customerName: order.customer_name || '',
    contactType: order.contact_type || 'phone',
    contactInfo: order.contact_info || '',
    notes: order.notes || '',
    deliveryFee: order.delivery_fee || 0
  })
  editError.value = ''
  editSaving.value = false
  showItemPicker.value = false
  itemPickerQ.value = ''
}

function adjEditItem(idx, delta) {
  const item = editItems.value[idx]
  item.qty = Math.max(0, (item.qty || 0) + delta)
  if (item.qty <= 0) editItems.value.splice(idx, 1)
}

function pickItem(mi) {
  const existing = editItems.value.find(i => i.id === mi.id)
  if (existing) { existing.qty++ } else {
    editItems.value.push({ id: mi.id, name: mi.name, price: mi.price, qty: 1 })
  }
  showItemPicker.value = false
  itemPickerQ.value = ''
}

watch(showItemPicker, async (v) => {
  if (v) await nextTick(); pickerInput.value?.focus()
})

async function saveEdit() {
  if (!editItems.value.length) { editError.value = '请至少添加一个菜品'; return }
  editSaving.value = true
  editError.value = ''
  try {
    await updateOrderById(editOrder.value.id, {
      status: editOrder.value.status,
      orderMode: editForm.orderMode,
      deliveryAddress: editForm.deliveryAddress,
      deliveryFee: editForm.deliveryFee,
      guestCount: editForm.guestCount,
      customerName: editForm.customerName,
      contactType: editForm.contactType,
      contactInfo: editForm.contactInfo,
      notes: editForm.notes,
      expectedTime: editForm.expectedTime,
      items: editItems.value.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      totalAmount: editTotal.value
    })
    showToast('订单已更新')
    editOrder.value = null
    loadOrders()
    loadStats()
  } catch (e) {
    editError.value = '保存失败，请重试'
  } finally {
    editSaving.value = false
  }
}

// ========== 详细统计弹窗 ==========
async function openStatsModal() {
  await loadStats()
  showStats.value = true
  await nextTick()
  renderChart()
}

function switchChart(mode) {
  chartMode.value = mode
  renderChart()
}

async function renderChart() {
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
  const canvas = chartCanvas.value
  if (!canvas) return

  let labels, data
  const now = new Date()
  if (chartMode.value === 'month') {
    const raw = await getStatsByMonth(now.getFullYear())
    labels = raw.map(r => r.month + '月')
    data = raw.map(r => r.amount)
  } else {
    const raw = await getStatsByDay(now.getFullYear(), now.getMonth() + 1)
    labels = raw.map(r => r.day + '日')
    data = raw.map(r => r.amount)
  }

  chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '金额 (֏)',
        data,
        backgroundColor: 'rgba(212,175,55,0.5)',
        borderColor: '#D4AF37',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          backgroundColor: '#3A1612',
          titleColor: '#D4AF37',
          bodyColor: '#FFF4E2',
          borderColor: '#D4AF37',
          borderWidth: 1,
          callbacks: { label: ctx => '֏ ' + ctx.raw.toLocaleString() }
        }
      },
      scales: {
        x: {
          ticks: { color: '#D9C8B2' },
          grid: { color: 'rgba(212,175,55,0.15)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#D9C8B2', callback: v => v.toLocaleString() },
          grid: { color: 'rgba(212,175,55,0.15)' }
        }
      }
    }
  })
}

// ========== 工具函数 ==========
function fmtNum(n) { return (n || 0).toLocaleString() }
function itemName(nameObj) {
  if (!nameObj) return '-'
  if (typeof nameObj === 'string') return nameObj
  return nameObj.zh || nameObj['zh'] || Object.values(nameObj).find(v => v) || ''
}
function fmtTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
function yandexGoUrl(address) {
  const encoded = encodeURIComponent(address || '')
  return `https://3.redirect.appmetrica.yandex.com/route?end-lat=&end-lon=&tariffClass=cargo&ref=ribuluo&appmetrica_tracking_id=1178268795219780156`
}

function ggUrl(address) {
  return 'https://play.google.com/store/apps/details?id=am.ggtaxi.main'
}

function copyText(text) {
  navigator.clipboard.writeText(text).catch(() => {})
  showToast('已复制')
}
function showToast(msg) {
  toast.value = msg
  setTimeout(() => toast.value = '', 3000)
}

// ========== 轮询 ==========
let statsTimer = null
let lastPending = 0

onMounted(async () => {
  await loadStats()
  lastPending = await getPendingCount()
  await loadOrders()
  await refreshCounts()
  // 激活提示音
  activate()

  statsTimer = setInterval(async () => {
    try {
      const count = await getPendingCount()
      await loadStats()
      if (count !== lastPending) {
        lastPending = count
        if (activeTab.value === 'pending') {
          pendingTotal.value = count
        }
        playAlert()
      }
    } catch (e) { /* ignore */ }
  }, 5000)
})

onUnmounted(() => {
  if (statsTimer) clearInterval(statsTimer)
  if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
.admin-orders { display: flex; flex-direction: column; height: 100vh; background: var(--bg-primary); }

.ao-topbar { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-bottom: 1px solid var(--border); }
.btn-back { background: none; border: none; color: var(--accent); font-size: 16px; cursor: pointer; padding: 4px 8px; }
.ao-title { font-size: 17px; font-weight: 600; }

/* 统计栏 */
.stats-bar { padding: 10px 12px; background: var(--bg-secondary); border-bottom: 1px solid var(--border); font-size: 12px; line-height: 2.2; margin-bottom: 8px; }
.stats-row { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
.stats-label { color: var(--text-secondary); flex-shrink: 0; }
.stats-group { display: flex; gap: 12px; flex: 1; justify-content: space-around; padding: 3px 8px; border: 1px solid var(--border); border-radius: 6px; }
.stats-item { white-space: nowrap; }
.stats-row b { color: var(--accent); }
.stats-detail-link { font-size: 11px; color: var(--accent); cursor: pointer; text-decoration: underline; flex-shrink: 0; }

/* 订单内容区块 */
.ao-content-block { flex: 1; display: flex; flex-direction: column; min-height: 0; background: var(--bg-primary); border-radius: 8px 8px 0 0; overflow: hidden; border: 1px solid rgba(212,175,55,0.25); }

/* 搜索区 */
.search-area { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px; border-bottom: 1px solid var(--border); background: var(--bg-secondary); }
.si-input, .si-select { flex: 1; min-width: 80px; padding: 5px 6px; font-size: 11px; border-radius: 4px; border: 1px solid var(--input-border); background: var(--input-bg); color: var(--text-primary); font-family: var(--body-font); }
.si-input::placeholder, .si-select::placeholder { color: var(--text-secondary); opacity: 0.5; }
.si-input:focus, .si-select:focus { border-color: var(--accent); outline: none; }

/* 页签 */
.ao-tabs { display: flex; border-bottom: 1px solid var(--border); }
.ao-tab { flex: 1; padding: 10px; border: none; background: var(--tab-bg); color: var(--text-secondary); font-size: 13px; cursor: pointer; font-family: var(--body-font); }
.ao-tab.active { color: var(--accent); border-bottom: 2px solid var(--accent); }

/* 列表 */
.order-list { flex: 1; overflow-y: auto; padding: 10px; }
.order-card { background: var(--bg-secondary); border-radius: 8px; margin-bottom: 6px; overflow: hidden; }
.oc-summary { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; cursor: pointer; gap: 10px; }
.ocs-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; justify-content: space-between; }
.ocs-id { font-size: 12px; font-weight: 700; color: var(--accent); font-family: monospace; }
.ocs-badge { font-size: 10px; padding: 1px 5px; border-radius: 3px; }
.badge-dine { background: var(--accent); color: var(--badge-text, #2B1600); }
.badge-del { background: var(--danger); color: #fff; }
.ocs-time { font-size: 11px; color: var(--text-secondary); }
.ocs-amount { font-size: 13px; font-weight: 600; color: var(--text-price); }
.ocs-fee { font-size: 11px; color: var(--text-secondary); }
.btn-expand {
  font-size: 11px;
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: 4px;
  padding: 2px 8px;
  cursor: pointer;
  flex-shrink: 0;
  font-family: var(--body-font);
  white-space: nowrap;
}
.btn-expand:active { background: var(--accent); color: var(--badge-text, #2B1600); }

.oc-detail { padding: 0 10px 10px; border-top: 1px solid var(--border); background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px; margin: 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.ocd-actions { display: flex; gap: 6px; padding: 8px 0; flex-wrap: wrap; }

/* 详情表格 */
.detail-table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 12px; }
.detail-table th, .detail-table td { padding: 3px 4px; text-align: left; border-bottom: 1px solid var(--border); }
.detail-table th { color: var(--text-secondary); font-weight: 500; font-size: 11px; }
.detail-info { font-size: 11px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 3px; margin-top: 6px; }
.di-row { display: flex; gap: 8px; }
.di-row span { flex: 1; }
.btn-copy-inline { background: none; border: none; cursor: pointer; font-size: 13px; padding: 0 2px; }
.btn-delivery-app {
  display: inline-block;
  padding: 4px 10px;
  font-size: 11px;
  border-radius: 12px;
  border: 1px solid var(--accent);
  color: var(--accent);
  text-decoration: none;
  font-family: var(--body-font);
}
.btn-delivery-app:active { background: var(--accent); color: var(--badge-text, #2B1600); }

/* 分页 */
.pagination { display: flex; justify-content: center; align-items: center; gap: 10px; padding: 12px 0; font-size: 13px; }

/* 编辑弹窗 */
.modal-wide { max-height: 90vh; }
.edit-items { margin-bottom: 12px; }
.ei-header, .ei-row { display: flex; align-items: center; gap: 4px; font-size: 12px; padding: 4px 0; border-bottom: 1px solid var(--border); }
.ei-col-wide { flex: 2; min-width: 0; }
.ei-col-qty { display: flex; align-items: center; gap: 2px; }
.qbtn { width: 20px; height: 20px; border: 1px solid var(--border); background: var(--tab-bg); color: var(--text-primary); cursor: pointer; font-size: 14px; line-height: 1; padding: 0; border-radius: 3px; display: inline-flex; align-items: center; justify-content: center; }
.qbtn:active { transform: scale(0.9); }
.qval { min-width: 18px; text-align: center; }
.btn-del-row { background: none; border: none; color: var(--danger); cursor: pointer; font-size: 14px; padding: 0 4px; }
.ei-add-row { padding: 6px 0; position: relative; }
.ei-total { text-align: right; font-size: 13px; padding: 4px 0; border-top: 1px solid var(--border); }

.item-picker { margin-top: 6px; }
.ip-search { width: 100%; padding: 6px 8px; font-size: 12px; border: 1px solid var(--input-border); border-radius: 4px; background: var(--input-bg); color: var(--text-primary); }
.ip-search::placeholder { color: var(--text-secondary); opacity: 0.5; }
.ip-dropdown { max-height: 180px; overflow-y: auto; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 4px; margin-top: 2px; }
.ip-item { padding: 6px 8px; cursor: pointer; font-size: 12px; border-bottom: 1px solid var(--border); }
.ip-item:last-child { border-bottom: none; }
.ip-item:hover { background: var(--tab-bg); color: var(--accent); }
.ip-empty { padding: 6px 8px; font-size: 12px; color: var(--text-secondary); }

/* 编辑表单 */
.edit-form { font-size: 13px; }
.edit-form .form-row { margin-bottom: 10px; }
.edit-form .form-label { display: block; font-size: 11px; color: var(--text-secondary); margin-bottom: 3px; }
.edit-form .form-input { width: 100%; padding: 6px 8px; font-size: 13px; border: 1px solid var(--input-border); border-radius: 4px; background: var(--input-bg); color: var(--text-primary); font-family: var(--body-font); }
.edit-form .form-input:focus { border-color: var(--accent); outline: none; }
.edit-form .form-input::placeholder { color: var(--text-secondary); opacity: 0.5; }
.form-split { display: flex; gap: 8px; }
.form-split > div { flex: 1; }
.radio-row { display: flex; gap: 12px; }
.radio-row label { display: flex; align-items: center; gap: 3px; cursor: pointer; }
.submit-error { color: var(--danger); font-size: 12px; text-align: center; }
textarea.form-input { resize: vertical; }

/* 统计弹窗 */
.stats-detail { margin-bottom: 8px; }
.stats-detail-row { display: flex; justify-content: space-between; align-items: center; margin: 6px 0; font-size: 13px; }
.stats-detail-row b { color: var(--accent); }
.chart-tabs { display: flex; gap: 8px; margin: 10px 0; }
.chart-tabs button { padding: 4px 12px; border: 1px solid var(--border); background: var(--tab-bg); color: var(--text-secondary); border-radius: 4px; cursor: pointer; font-size: 12px; }
.chart-tabs button.active { background: var(--accent); color: var(--badge-text, #2B1600); border-color: var(--accent); }
.chart-wrap { max-height: 300px; }

/* Toast */
.toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--accent); color: var(--badge-text); padding: 6px 20px; border-radius: 20px; font-size: 13px; z-index: 300; white-space: nowrap; }

/* 通用按钮 */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 3px; padding: 7px 14px; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: var(--body-font); outline: none; -webkit-tap-highlight-color: transparent; }
.btn:active { transform: scale(0.96); }
.btn:disabled { opacity: 0.5; }
.btn-primary { background: var(--accent); color: var(--badge-text, #2B1600); }
.btn-outline { background: transparent; border: 1px solid var(--accent); color: var(--accent); }
.btn-danger { background: var(--danger); color: #fff; }
.btn-success { background: var(--success); color: #fff; }
.btn-warning { background: #f39c12; color: #fff; }
.btn-sm { padding: 4px 10px; font-size: 11px; }

.modal-overlay { position: fixed; inset: 0; z-index: 200; background: var(--overlay); display: flex; align-items: flex-end; justify-content: center; }
.modal-content { background: var(--bg-secondary); width: 100%; max-width: 480px; max-height: 85vh; overflow-y: auto; border-radius: 16px 16px 0 0; padding: 16px; }
.modal-title { font-size: 17px; font-weight: 600; margin-bottom: 12px; }
.modal-actions { display: flex; gap: 8px; margin-top: 16px; }
.modal-actions .btn { flex: 1; }
.empty-hint { text-align: center; padding: 40px; color: var(--text-secondary); font-size: 13px; }
</style>
