// Telegram 通知客户端封装 — 调用 /api/notify (fire-and-forget)

export function useTelegramNotify() {
  /** 新订单通知 */
  async function notifyNewOrder(orderData) {
    try {
      const resp = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            id: orderData.id,
            items: orderData.items || [],
            guestCount: orderData.guestCount,
            totalAmount: orderData.totalAmount,
            customerName: orderData.customerName,
            contactType: orderData.contactType,
            contactInfo: orderData.contactInfo,
            notes: orderData.notes,
            expectedTime: orderData.expectedTime,
            orderMode: orderData.orderMode,
            deliveryAddress: orderData.deliveryAddress,
            deliveryFee: orderData.deliveryFee || 0,
            status: orderData.status || 'pending'
          },
          action: 'new',
          messageId: orderData.telegram_message_id || null
        })
      })
      const data = await resp.json()
      return data.message_id || null
    } catch (e) {
      console.error('Telegram notify new failed:', e)
      return null
    }
  }

  /** 顾客修改通知 */
  async function notifyCustomerUpdate(orderData) {
    try {
      const resp = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            id: orderData.id,
            items: orderData.items || [],
            guestCount: orderData.guestCount,
            totalAmount: orderData.totalAmount,
            customerName: orderData.customerName,
            contactType: orderData.contactType,
            contactInfo: orderData.contactInfo,
            notes: orderData.notes,
            expectedTime: orderData.expectedTime,
            orderMode: orderData.orderMode,
            deliveryAddress: orderData.deliveryAddress,
            deliveryFee: orderData.deliveryFee || 0,
            status: orderData.status || 'pending'
          },
          action: 'customer_update',
          messageId: orderData.telegram_message_id || null,
          oldItems: orderData.oldItems || null
        })
      })
      const data = await resp.json()
      return data.message_id || null
    } catch (e) {
      console.error('Telegram notify customer_update failed:', e)
      return null
    }
  }

  /** 管理端编辑通知（仅编辑，无额外铃声） */
  async function notifyAdminUpdate(orderData) {
    try {
      const resp = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            id: orderData.id,
            items: orderData.items || [],
            guestCount: orderData.guestCount,
            totalAmount: orderData.totalAmount,
            customerName: orderData.customerName,
            contactType: orderData.contactType,
            contactInfo: orderData.contactInfo,
            notes: orderData.notes,
            expectedTime: orderData.expectedTime,
            orderMode: orderData.orderMode,
            deliveryAddress: orderData.deliveryAddress,
            deliveryFee: orderData.deliveryFee || 0,
            status: orderData.status || 'pending'
          },
          action: 'admin_update',
          messageId: orderData.telegram_message_id || null
        })
      })
      const data = await resp.json()
      return data.message_id || null
    } catch (e) {
      console.error('Telegram notify admin_update failed:', e)
      return null
    }
  }

  /** 状态变更通知（结算/撤回） */
  async function notifyStatusChange(orderData) {
    try {
      const resp = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            id: orderData.id,
            items: orderData.items || [],
            guestCount: orderData.guestCount,
            totalAmount: orderData.totalAmount,
            customerName: orderData.customerName,
            contactType: orderData.contactType,
            contactInfo: orderData.contactInfo,
            notes: orderData.notes,
            expectedTime: orderData.expectedTime,
            orderMode: orderData.orderMode,
            deliveryAddress: orderData.deliveryAddress,
            deliveryFee: orderData.deliveryFee || 0,
            status: orderData.status || 'pending'
          },
          action: 'status_change',
          messageId: orderData.telegram_message_id || null
        })
      })
      const data = await resp.json()
      return data.message_id || null
    } catch (e) {
      console.error('Telegram notify status_change failed:', e)
      return null
    }
  }

  /** 测试通知 */
  async function testNotify() {
    try {
      const resp = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' })
      })
      const data = await resp.json()
      return data
    } catch (e) {
      console.error('Telegram test failed:', e)
      return { error: String(e) }
    }
  }

  return { notifyNewOrder, notifyCustomerUpdate, notifyAdminUpdate, notifyStatusChange, testNotify }
}
