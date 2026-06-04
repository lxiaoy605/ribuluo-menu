import { ref, computed, watch } from 'vue'

const CART_KEY = 'ribuluo_cart'
const ORDER_IDS_KEY = 'ribuluo_order_ids'

// 内存响应式缓存
const _cart = ref(null)
const _itemCount = computed(() => _cart.value?.items?.length || 0)
const _totalAmount = computed(() => {
  if (!_cart.value?.items) return 0
  return _cart.value.items.reduce((sum, i) => sum + i.price * i.qty, 0)
})
const _editingOrderId = computed(() => _cart.value?.editingOrderId || null)

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
}

// ========== 内部读写 ==========
function _readCart() {
  if (_cart.value) return _cart.value
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (raw) {
      _cart.value = JSON.parse(raw)
    } else {
      _cart.value = { items: [], deviceId: uid(), form: _defaultForm(), editingOrderId: null }
      _saveCart()
    }
  } catch (e) {
    _cart.value = { items: [], deviceId: uid(), form: _defaultForm(), editingOrderId: null }
  }
  return _cart.value
}

function _saveCart() {
  if (_cart.value) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(_cart.value)) } catch (e) { /* ignore */ }
  }
}

function _defaultForm() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return {
    orderMode: 'dine_in',
    deliveryAddress: '',
    guestCount: 1,
    customerName: '',
    contactType: 'phone',
    contactInfo: '',
    notes: '',
    expectedTime: now.toISOString().slice(0, 16)
  }
}

// ========== 公开方法 ==========
function getCart() {
  return _readCart()
}

function addItem(product) {
  const cart = _readCart()
  const existing = cart.items.find(i => i.id === product.id)
  if (existing) {
    existing.qty = Math.min(existing.qty + 1, 999)
  } else {
    cart.items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1
    })
  }
  _saveCart()
}

function removeItem(productId) {
  const cart = _readCart()
  const existing = cart.items.find(i => i.id === productId)
  if (existing) {
    existing.qty -= 1
    if (existing.qty <= 0) {
      cart.items = cart.items.filter(i => i.id !== productId)
    }
  }
  _saveCart()
}

function setItemQty(productId, qty, productInfo) {
  const cart = _readCart()
  const q = Math.max(0, Math.min(qty, 999))
  if (q === 0) {
    cart.items = cart.items.filter(i => i.id !== productId)
  } else {
    const existing = cart.items.find(i => i.id === productId)
    if (existing) {
      existing.qty = q
    } else if (productInfo) {
      cart.items.push({
        id: productId,
        name: productInfo.name,
        price: productInfo.price,
        qty: q
      })
    }
  }
  _saveCart()
}

function getItemQty(productId) {
  const cart = _readCart()
  return cart.items.find(i => i.id === productId)?.qty || 0
}

function clearCart() {
  _cart.value = { items: [], deviceId: _readCart().deviceId, form: _defaultForm(), editingOrderId: null }
  _saveCart()
}

function hasItems() {
  return _readCart().items.length > 0
}

function updateForm(partial) {
  const cart = _readCart()
  Object.assign(cart.form, partial)
  _saveCart()
}

function loadOrder(orderData) {
  const cart = _readCart()
  cart.items = (orderData.items || []).map(i => ({
    id: i.id,
    name: i.name,
    price: i.price,
    qty: i.qty
  }))
  cart.form = {
    orderMode: orderData.order_mode || 'dine_in',
    deliveryAddress: orderData.delivery_address || '',
    guestCount: orderData.guest_count || 1,
    customerName: orderData.customer_name || '',
    contactType: orderData.contact_type || 'phone',
    contactInfo: orderData.contact_info || '',
    notes: orderData.notes || '',
    expectedTime: orderData.expected_time || ''
  }
  cart.editingOrderId = orderData.id
  _saveCart()
}

// ========== 订单号管理（用于Supabase同步） ==========
function addOrderId(orderId) {
  try {
    const raw = localStorage.getItem(ORDER_IDS_KEY)
    const ids = raw ? JSON.parse(raw) : []
    if (!ids.includes(orderId)) {
      ids.unshift(orderId)
      localStorage.setItem(ORDER_IDS_KEY, JSON.stringify(ids))
    }
  } catch (e) { /* ignore */ }
}

function getOrderIds() {
  try {
    const raw = localStorage.getItem(ORDER_IDS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) { return [] }
}

export function useCart() {
  return {
    getCart,
    addItem,
    removeItem,
    setItemQty,
    getItemQty,
    clearCart,
    hasItems,
    updateForm,
    loadOrder,
    addOrderId,
    getOrderIds,
    itemCount: _itemCount,
    totalAmount: _totalAmount,
    cartItems: computed(() => _readCart().items),
    cartForm: computed(() => _readCart().form),
    editingOrderId: _editingOrderId
  }
}
