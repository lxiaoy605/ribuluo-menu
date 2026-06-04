import { useSupabase } from './useSupabase'

export function useOrders() {
  const { supabase } = useSupabase()

  const TABLE = 'orders'

  function genOrderId() {
    const now = new Date()
    const dd = String(now.getDate()).padStart(2, '0')
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    return 'RN' + dd + hh + mm + ss
  }

  async function submitOrder(order) {
    const insertData = {
      id: order.id,
      status: order.status || 'pending',
      order_mode: order.orderMode || 'dine_in',
      device_id: order.deviceId || null,
      delivery_address: order.deliveryAddress || null,
      items: order.items,
      guest_count: order.guestCount,
      total_amount: order.totalAmount,
      customer_name: order.customerName || null,
      contact_type: order.contactType,
      contact_info: order.contactInfo,
      notes: order.notes || null,
      expected_time: order.expectedTime || null
    }

    // 尝试插入，若单号冲突则追加随机字符重试（最多3次）
    let lastError = null
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        insertData.id = order.id + Math.random().toString(36).substring(2, 4).toUpperCase()
      }
      const { data, error } = await supabase
        .from(TABLE)
        .insert([insertData])
        .select('id, created_at')
        .single()

      if (!error) return data
      // 23505 = unique violation
      if (error.code !== '23505') throw error
      lastError = error
    }
    throw lastError
  }

  async function updateOrderById(id, order) {
    const { error } = await supabase
      .from(TABLE)
      .update({
        status: order.status,
        order_mode: order.orderMode || 'dine_in',
        delivery_address: order.deliveryAddress || null,
        delivery_fee: order.deliveryFee || 0,
        items: order.items,
        guest_count: order.guestCount,
        total_amount: order.totalAmount,
        customer_name: order.customerName || null,
        contact_type: order.contactType,
        contact_info: order.contactInfo,
        notes: order.notes || null,
        expected_time: order.expectedTime || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
  }

  async function getOrdersByIds(ids) {
    if (!ids || !ids.length) return []
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .in('id', ids)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async function getOrders(page = 1, pageSize = 20) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return { orders: data, count }
  }

  async function deleteOrder(id) {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // ========== 统计查询 ==========
  function todayStart() {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
  }
  function monthStart() {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
  }
  function yearStart() {
    return new Date(new Date().getFullYear(), 0, 1).toISOString()
  }

  async function getPendingCount() {
    const { count, error } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    if (error) throw error
    return count || 0
  }

  async function getOrderStats() {
    const ts = todayStart()
    const ms = monthStart()
    const ys = yearStart()

    // 一次拉取本月全部订单（量小可行），客户端聚合
    const { data, error } = await supabase
      .from(TABLE)
      .select('status,total_amount,created_at')
      .gte('created_at', ms)
      .order('created_at', { ascending: false })

    if (error) throw error

    const today = data.filter(o => o.created_at >= ts)
    const todayPending = today.filter(o => o.status === 'pending').length
    const todayCompleted = today.filter(o => o.status === 'completed').length
    const todayAmount = today.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total_amount || 0), 0)

    const monthCompleted = data.filter(o => o.status === 'completed')
    const monthCount = monthCompleted.length
    const monthAmount = monthCompleted.reduce((s, o) => s + (o.total_amount || 0), 0)

    // 本年需单独拉取
    const { data: yearData, error: yearErr } = await supabase
      .from(TABLE)
      .select('total_amount')
      .eq('status', 'completed')
      .gte('created_at', ys)

    let yearCount = 0, yearAmount = 0
    if (!yearErr && yearData) {
      yearCount = yearData.length
      yearAmount = yearData.reduce((s, o) => s + (o.total_amount || 0), 0)
    }

    return { todayPending, todayCompleted, todayAmount, monthCount, monthAmount, yearCount, yearAmount }
  }

  async function searchOrders({ status, search, page = 1, pageSize = 20 } = {}) {
    let query = supabase.from(TABLE).select('*', { count: 'exact' })

    if (status) query = query.eq('status', status)
    if (search) {
      if (search.orderId) query = query.ilike('id', `%${search.orderId}%`)
      if (search.dateFrom) query = query.gte('created_at', search.dateFrom)
      if (search.dateTo) query = query.lte('created_at', search.dateTo + 'T23:59:59')
      if (search.customerName) query = query.ilike('customer_name', `%${search.customerName}%`)
      if (search.orderMode) query = query.eq('order_mode', search.orderMode)
      if (search.contactType) query = query.eq('contact_type', search.contactType)
      if (search.contactInfo) query = query.ilike('contact_info', `%${search.contactInfo}%`)
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return { orders: data || [], count: count || 0 }
  }

  async function getStatsByMonth(year) {
    const start = new Date(year, 0, 1).toISOString()
    const end = new Date(year + 1, 0, 1).toISOString()
    const { data, error } = await supabase
      .from(TABLE)
      .select('total_amount,created_at')
      .eq('status', 'completed')
      .gte('created_at', start)
      .lt('created_at', end)

    if (error) throw error
    const bins = Array(12).fill(0)
    ;(data || []).forEach(o => {
      const m = new Date(o.created_at).getMonth()
      bins[m] += (o.total_amount || 0)
    })
    return bins.map((amount, i) => ({ month: i + 1, amount }))
  }

  async function getStatsByDay(year, month) {
    const start = new Date(year, month - 1, 1).toISOString()
    const end = new Date(year, month, 1).toISOString()
    const { data, error } = await supabase
      .from(TABLE)
      .select('total_amount,created_at')
      .eq('status', 'completed')
      .gte('created_at', start)
      .lt('created_at', end)

    if (error) throw error
    const daysInMonth = new Date(year, month, 0).getDate()
    const bins = Array(daysInMonth).fill(0)
    ;(data || []).forEach(o => {
      const d = new Date(o.created_at).getDate() - 1
      bins[d] += (o.total_amount || 0)
    })
    return bins.map((amount, i) => ({ day: i + 1, amount }))
  }

  return { submitOrder, updateOrderById, getOrders, getOrdersByIds, searchOrders, deleteOrder, genOrderId, getPendingCount, getOrderStats, getStatsByMonth, getStatsByDay }
}
